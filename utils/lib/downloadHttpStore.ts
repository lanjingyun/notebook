import axios from "axios"
type option = {
    name: string,
    length: number,
    downloadCallBack?: (err: boolean, info?: any) => void
    downloadMap?: any[],
}

export default class DownloadHttpStore {
    closed: boolean = false
    name: string = ''
    chunkLength: number = 0
    lastChunkLength: number = 0
    lastChunkIndex: number = 0
    private downloadMap: any[]
    private downloadCallBack?: (err: boolean, info?: any) => void
    constructor(chunkLength: number, opts: option) {
        this.chunkLength = chunkLength
        this.downloadMap = opts.downloadMap || []
        this.name = opts.name
        this.downloadCallBack = opts.downloadCallBack || null
        if (opts.length >= 0) {
            this.lastChunkLength = opts.length % this.chunkLength || this.chunkLength
            this.lastChunkIndex = Math.ceil(opts.length / this.chunkLength) - 1
        } else {
            this.lastChunkIndex = 0
        }
    }
    // 对应knodeToTorrent里面的request事件
    async get(index: number, opts: any, cb: (p: any, d?: Uint8Array) => void) {
        if (this.closed || this.downloadMap.length < 1) {
            this.downloadCallBack && this.downloadCallBack(true)
            return console.error('No Download Address Node Closed')
        }
        let contentLength = index === this.lastChunkIndex ? this.lastChunkLength : this.chunkLength
        if ((opts?.offset && opts.offset !== 0) || (opts?.length && opts.length !== contentLength)) {
            const start = opts.offset || 0
            const end = opts.length ? start + opts.length : contentLength
            contentLength = end - start
        }
        let data: Uint8Array
        const { nodes } = this.downloadMap.find((val) => val.index === index)
        try {
            const url = nodes[0].address
            const response = await fetch(url, { headers: {'Cache-Control': 'no-store'} })
            data = Buffer.alloc(contentLength)
            let offset = 0
            const reader = response.body.getReader()
            while (true) {
                const { done, value } = await reader.read()
                if (done) {
                    if (offset !== contentLength) {
                        throw new Error('Content-Length mismatch')
                    }
                    break
                }
                data.set(value, offset)
                offset += value.byteLength
            }
        } catch (err) {
            cb(err)
            console.error(err)
            return
        }
        cb(null, data)
    }
    async put(index: number, buf: Uint8Array, cb: (abort: boolean) => void) {
        console.error('Unexpected trigger put')
        cb(false)
    }
    close(cb?: () => void) {
        if (cb) cb()
        if (this.closed) return
        this.closed = true
    }
    destroy(cb) {
        if (cb) cb()
    }
}
