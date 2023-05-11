import { WritableStream as PofWritableStream, TransformStream as PofTransformStream } from 'web-streams-polyfill/ponyfill'
type callback = {
    progress?: (loadByte: number) => void,
    closed?: () => void
}
export default class StreamSaver {
    private WritableStream: any
    private TransformStream: any
    private supportsTransferable: boolean = false
    useBlob: boolean = false
    constructor() {
        const global: any = window
        this.WritableStream = global.WritableStream || PofWritableStream
        this.useBlob = /constructor/i.test(global.HTMLElement) || !!global.safari || !!global.WebKitPoint
        try {
            new TransformStream()
            this.TransformStream = TransformStream
            this.supportsTransferable = true
        } catch (err) {
            console.error(err)
            try {
                new PofTransformStream()
                this.TransformStream = PofTransformStream
                this.supportsTransferable = true
            } catch(err) {
                console.error(err)
                this.supportsTransferable = false
            }
        }
        try {
            new Response(new ReadableStream())
            if (!('serviceWorker' in navigator)) {
                this.useBlob = true
            }
        } catch (err) {
            console.error(err)
            this.useBlob = true
        }
    }
    private makeIframe(src: string) {
        const iframe: any = document.createElement('iframe')
        iframe.hidden = true
        iframe.src = src
        iframe.loaded = false
        iframe.name = 'iframe'
        iframe.addEventListener('load', () => {
            iframe.loaded = true
        }, { once: true })
        document.body.appendChild(iframe)
    }
    async createWriteStream(fileName: string, size: number, opts: callback = {} ): Promise<WritableStream | null> {
        let bytesWritten = 0
        let transformStream: any = {}
        let sw: ServiceWorker = null
        const { port1, port2 } = new MessageChannel()
        const { progress, closed } = opts
        const supportsTransferable = this.supportsTransferable
        if (!this.useBlob) {
            sw = await registerWorker('sw.js', '/')
            if(!sw) {
                this.useBlob = true
                return null
            }
            const header = fileName.endsWith('.zip') ? {'Content-Type': 'application/zip'} : null
            // Make filename RFC5987 compatible
            const filename = encodeURIComponent(fileName.replace(/\//g, ':')).replace(/['()]/g, escape).replace(/\*/g, '%2A')
            const downloadUrl = location.origin + '/' + Math.random() + '/' + filename
            const transformer = supportsTransferable && {
                transform(chunk, controller) {
                    if (!(chunk instanceof Uint8Array)) {
                        throw new TypeError('Can only write Uint8Arrays')
                    }
                    bytesWritten += chunk.length
                    progress&&progress(bytesWritten)
                    controller.enqueue(chunk)
                },
                flush() {
                    closed && closed()
                }
            } 
            transformStream = supportsTransferable && new this.TransformStream(transformer) 
            const readableStream = transformStream.readable 
            port1.onmessage = evt => {
                if (evt.data.abort) {
                    port1.postMessage('abort')
                    port1.onmessage = null
                    port1.close()
                    port2.close()
                }
            }
            const params: any = { downloadUrl, size, filename, header }
            if(readableStream) {
                params['readableStream'] = readableStream
                sw.postMessage(params, [port2, readableStream])
            } else {
                sw.postMessage(params, [port2])
            }
            this.makeIframe(downloadUrl)
            return (!this.useBlob && transformStream && transformStream.writable) ||  new this.WritableStream({
                write(chunk) {
                    if (!(chunk instanceof Uint8Array)) {
                        throw new TypeError('Can only write Uint8Arrays')
                    }
                    port1.postMessage(chunk)
                    bytesWritten += chunk.length
                    progress&&progress(bytesWritten)
                },
                close() {
                    closed && closed()
                    port1.postMessage('end')
                },
                abort() {
                    port1.postMessage('abort')
                    port1.onmessage = null
                    port1.close()
                    port2.close()
                }
            })
        }
        return null
    }
}

export async function registerWorker(url: string, scope: string): Promise<ServiceWorker | null> {
    if(!navigator.serviceWorker) return null
    const swReg = await navigator.serviceWorker.getRegistration(scope).then((swReg) => swReg || navigator.serviceWorker.register(url, { scope })).catch(() => null)
    if (!swReg) return null
    const swRegTmp = swReg.installing || swReg.waiting
    if (swReg.active) {
        return swReg.active
    } else {
        return new Promise(resolve => {
            const fn = () => {
                if (swRegTmp.state === 'activated') {
                    swRegTmp.removeEventListener('statechange', fn)
                    resolve(swReg.active)
                }
            }
            swRegTmp.addEventListener('statechange', fn)
        })
    }
}

export function keepAlive(sw: ServiceWorker | null, scope: string) {
    const url = location.origin + scope + 'alive'
    const timer = setInterval(() => {
        if (sw) {
            sw.postMessage({ alive: true })
        } else {
            fetch(url).then((res: Response) => {
                if (!res.ok) clearInterval(timer)
            })
        }
    }, 10000)
    return timer
}

