import BitField from 'bitfield'
import ltDontHave from 'lt_donthave'
import sha1 from 'simple-sha1'
import Wire from 'bittorrent-protocol'
/* 下载的时候把konde上获取的数据传输给torrent */
export default class KnodeConnectTorrent extends Wire {
  [k: string]: any
  constructor(knode, torrent) {
    super()
    this.knode = knode
    this.connId = this.knode.name
    this._torrent = torrent
    this._init()
  }
  _init() {
    this.setKeepAlive(true)
    this.use(ltDontHave())
    this.once('handshake', (infoHash, peerId) => {
      if (this.destroyed) return
      this.handshake(infoHash, sha1.sync(this.connId))
      const numPieces = this._torrent.pieces.length
      const bitfield = new BitField(numPieces)
      for (let i = 0; i <= numPieces; i++) {
        bitfield.set(i, true)
      }
      this.bitfield(bitfield)
    })
    this.once('interested', () => {
      this.unchoke()
    })
    /* 核心逻辑数据传输，其余都是一些webTorrent，和wire相关的 */
    this.on('request', (index, offset, length, callback) => {
      this.knode.get(index, { offset, length }, (err, data) => {
        if (err) console.error(err)
        callback(err, data)
        data = null
      })
    })
  }
  destroy() {
    super.destroy()
    this.knode = null
    this._torrent = null
  }
}