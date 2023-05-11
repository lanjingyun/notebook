import axios from "axios"
import { throttle } from ".."
type Strategy = {
    uploadAddress: any[],
    picesHash: string[],
    existList: any[]
    uploadCallback?: (err: boolean, info?: any[]) => void,
    uploadStateCallback?: (...res) => void,
}
export default class UploadHttpStrategy {
    private uploadAddress: string[]
    chunkLength: number = 0
    lastChunkLength: number = 0
    lastChunkIndex: number = 0
    private uploadInfoList: { pieceHash: string, pieceCid: string }[] = []
    private picesHash: string[]
    private existList: Map<string, string> = new Map()
    private uploadUrlMap: Map<number, string> = new Map()
    private uploadState: Observer
    private uploadCallback: (err: boolean, info?: any[]) => void
    private allUploaded: boolean[]
    constructor(chunkLength: number, size: number, opts: Strategy) {
        this.chunkLength = chunkLength
        this.uploadAddress = opts.uploadAddress.map(({ address }) => address) || []
        this.picesHash = opts.picesHash || []
        this.uploadCallback = opts.uploadCallback || null
        if (size >= 0) {
            this.lastChunkLength = size % this.chunkLength || this.chunkLength
            this.lastChunkIndex = Math.ceil(size / this.chunkLength) - 1
        } else {
            this.lastChunkIndex = 0
        }
        if(opts.existList.length > 0) {
            opts.existList.forEach(({cid, fid}) => {
                this.existList.set(fid, cid)
            })
        }
        this.uploadState = new Observer(this.lastChunkIndex + 1, this.uploadAddress.length, opts.uploadStateCallback)
        this.allUploaded = new Array(this.lastChunkIndex + 1).fill(false)
        this.assignUploadAddress()
    }
    private assignUploadAddress(Unavailable?: string) {
        if (Unavailable) {
            const index = this.uploadAddress.indexOf(Unavailable)
            if (index !== -1) {
                this.uploadAddress.splice(index, 1)
                this.uploadState.node --
            } else {
                return
            }
        }
        if (this.uploadAddress.length === 0) return
        const fn = (s: number, e: number, address: string) => {
            let i = s
            const j = e > this.lastChunkIndex + 1 ? this.lastChunkIndex + 1 : e
            for (i; i < j; i++) {
                this.uploadUrlMap.set(i, address)
            }
        }
        if (this.uploadAddress.length === 1) {
            fn(0, this.lastChunkIndex + 1, this.uploadAddress[0])
        } else if (this.uploadAddress.length > 1) {
            const num = Math.ceil((this.lastChunkIndex + 1) / this.uploadAddress.length)
            for (let j = 0; j < this.uploadAddress.length; j++) {
                const s = j * num, e = s + num, address = this.uploadAddress[j]
                if (s > this.lastChunkIndex) break
                fn(s, e, address)
            }
        }
    }
    private async push (index: number, buf: Uint8Array, fid: string, cb: (abort: boolean) => void) {
        const data = new FormData()
        data.append('file', new Blob([buf]))
        const url = this.uploadUrlMap.get(index)
        const progress = {
            onUploadProgress: (e) => {
                const state = {
                    progress: e.progress,
                    bytes: e.bytes
                }
                this.uploadState.set(index, state)
            }
        }
        const response: any = await axios.post(url + `&fid=${fid}`, data, { ...progress }).then((res: any) => {
            res.ok = true
            return res
        }).catch((res) => {
            res.ok = false
            return res
        })
        if (!response.ok) {
            this.assignUploadAddress(url)
            if (this.uploadAddress.length < 1) {
                cb(true)
                this.uploadCallback && this.uploadCallback(true)
                return console.error('All Upload Address Is Not Available')
            } else {
                this.push(index, buf, fid, cb)
            }
        } else {
            cb(false)
            const { data } = response
            this.uploadInfoList.push({ pieceCid: data.Hash, pieceHash: fid })
            this.allUploaded[index] = true
            if (!this.allUploaded.includes(false)) {
                this.uploadCallback && this.uploadCallback(false, this.uploadInfoList)
            }
            return
        }
    }
    upload(index: number, buf: Uint8Array, cb: (abort: boolean) => void) {
        const fid = this.picesHash[index]
        const cid = this.existList.get(fid)
        if(cid) {
            this.uploadInfoList.push({ pieceCid: cid, pieceHash: fid })
            this.uploadState.set(index, {progress: 1, bytes: 0})
            this.allUploaded[index] = true
            if (!this.allUploaded.includes(false)) {
                this.uploadCallback && this.uploadCallback(false, this.uploadInfoList)
            }
            return cb(false)
        }
        const isLastChunk = index === this.lastChunkIndex
        if ((isLastChunk && buf.length !== this.lastChunkLength) || (!isLastChunk && buf.length !== this.chunkLength) || this.uploadAddress.length < 1) {
            cb(true)
            this.uploadCallback && this.uploadCallback(true)
            return console.error('Chunk Length Is Not Match Or Upload Address Is Empty')
        }
        try {
            this.push(index, buf, fid, cb)
        } catch (err) {
            cb(true)
            this.uploadCallback && this.uploadCallback(true)
            return
        }
    }
}

class Observer {
    private map: Map<number, { progress: number, bytes: number } | any> = new Map()
    private onChange: (...res) => void
    node: number
    constructor(length: number, node: number, cb?: (...res) => void) {
        this.node = node
        if (!length) return
        for (let i = 0; i < length; i++) {
            const state = { progress: 0, bytes: 0 }
            this.map.set(i, state)
        }
        if (cb) {
            const call = () => {
                let byte = 0, rotate = 0
                for (let i = 0; i < length; i++) {
                    const { bytes, progress } = this.map.get(i)
                    if (progress !== 1) byte += bytes
                    rotate += progress
                }
                cb(byte, rotate / length, this.node)
            }
            this.onChange = throttle(call, 200)
        }
    }
    set(index: number, state: any) {
        this.map.set(index, state)
        this.onChange && this.onChange()
    }
}