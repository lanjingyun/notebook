import MemoryChunkStore from 'memory-chunk-store'
import IdbChunkStore from 'idb-chunk-store'
export default async function getStore(size: number, pieceLength: number, name?: string) {
    let type = 'memory'
    if (globalThis.indexedDB) {
        try {
            const dbUseful: any = await new Promise((resolve) => {
                const dbRequest = indexedDB.open('KPL')
                dbRequest.onsuccess = () => resolve(true)
                dbRequest.onerror = (event) => {
                    console.error('open DB faild', event)
                    resolve(false)
                }
            })
            if (dbUseful) {
                if (typeof navigator?.storage?.estimate === 'function') {
                    const storage = await navigator.storage.estimate()
                    if (size > (storage.quota - (storage.usage + 52_428_800))) { // 50MB
                        type = 'memory'
                    } else {
                        type = 'idb'
                    }
                } else {
                    type = 'memory'
                }
            } else {
                type = 'memory'
            }
        } catch (err) {
            console.error('open DB faild', err)
            type = 'memory'
        }
    } else {
        type = 'memory'
    }
    indexedDB.deleteDatabase('KPL')
    const opts = {
        length: size,
        name: name || `KPL${Math.random().toString().slice(2)}`
    }
    const store = type === 'idb' ? new IdbChunkStore(pieceLength, opts) : new MemoryChunkStore(pieceLength, opts)
    return {
        type,
        store
    }
}
