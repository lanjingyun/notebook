import getBrowserInfo from "./browserInfo"
export default function blobToStream (blob: Blob) {
  if (typeof Blob.prototype.stream !== 'undefined') {
    const { OS, userAgent, browser, versionMajor, versionMinor } = getBrowserInfo()
    if(!((OS === 'ios' && userAgent.includes('Safari/604.1')) ||
     (OS === 'ios' && userAgent.includes('Safari/605.1')) ||
     (browser === 'safari' && versionMajor === 14 && versionMinor >= 1) ||
     (OS === 'ios' && userAgent.includes('UCBrowser')))){
        return blob.stream()
    }
  }
  return new ReadableStream(new BlobStream(blob))
}

class BlobStream {
  offset: number = 0
  blob: Blob
  chunkSize: number = 512 * 1024
  constructor (blob: Blob) {
    this.blob = blob
  }
  pull (controller): Promise<any> {
    return new Promise((resolve, reject) => {
      const bytesLeft = this.blob.size - this.offset
      if (bytesLeft <= 0) {
        controller.close()
        resolve('')
        return
      }
      const size = Math.min(this.chunkSize, bytesLeft)
      const blob = this.blob.slice(this.offset, this.offset + size)
      const reader = new FileReader()
      reader.addEventListener('load', () => {
        controller.enqueue(new Uint8Array(reader.result as Uint8Array))
        resolve('')
      },{ once: true })
      reader.addEventListener('error', () => reject(reader.error), { once: true })
      reader.readAsArrayBuffer(blob)
      this.offset += size
    })
  }
}
