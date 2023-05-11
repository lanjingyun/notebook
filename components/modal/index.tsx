import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
type modalProps = {
    visiable: boolean,
    children: JSX.Element | JSX.Element[],
    onClose: () => void
}
function ModalDom({show = false, children, onClose}) {
    useEffect(() => {
        const hasScroll = document.body.scrollHeight > window.innerHeight || document.body.scrollHeight > document.documentElement.clientHeight
        if (show && hasScroll) {
            document.body.className = 'overflow-hidden sm:w-less-scroll'
        }
        return () => { document.body.className = '' }
    }, [])
    return (
        <div>
            <div className='fixed top-0 left-0 bottom-0 right-0 w-full h-full bg-black bg-opacity-50 z-50'></div>
            <div className='fixed top-0 left-0 bottom-0 right-0 z-50 overflow-auto text-center' onClick={onClose}>
                <div className='inline-block my-12' onClick={(e) => e.stopPropagation()}>
                    {children}
                </div>
            </div>
        </div>
    )
}
export default function Modal(props: modalProps) {
    const ref = useRef<any>(props.visiable)
    const [show, setShow] = useState<boolean>(false)
    useEffect(() => {
        if(ref.current) setShow(true)
    }, [])
    if (ref.current) {
        return props.visiable && show && createPortal(<ModalDom onClose={props.onClose} show={props.visiable}>{props.children}</ModalDom>, document.body)
    }
    return props.visiable && createPortal(<ModalDom onClose={props.onClose} show={props.visiable}>{props.children}</ModalDom>, document.body)
}