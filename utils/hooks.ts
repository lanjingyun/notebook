import { useCallback, useEffect } from "react"
import { throttle } from "."

function useOutClick(ref: React.RefObject<HTMLElement>, cb: () => void) {
    const listen = (e: MouseEvent) => {
        if(!ref.current?.contains(e.target as Node)) {
            cb()
        }
    }
    useEffect(() => {
        document.body.addEventListener('mousedown', listen)
        return () => document.body.removeEventListener('mousedown', listen)
    }, [])
}

function useThrottle (cb: (arg: any) => void, delay: number = 300) {
    const callback = useCallback(throttle(cb),[])
    return callback
}
export {
    useOutClick,
    useThrottle
}