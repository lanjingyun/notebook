import classNames from "classnames"
import { useMemo } from "react"
import type { ReactElement } from 'react'
import SuccessIcon from '@/public/images/successIcon.svg'
import ErrorIcon from '@/public/images/errorIcon.svg'
import WaringIcon from '@/public/images/waringIcon.svg'
import Image from "next/image"
import { render } from 'react-dom'
type messageNode = {
    type: 'success' | 'error' | 'waring',
    message: string | ReactElement
}
type messageParams = {
    delay?: number,
    onClose?: () => void,
    message: string | ReactElement
}

const icon = {
    success: <SuccessIcon />,
    error: <ErrorIcon />,
    waring: <WaringIcon />,
}

function message() {
    const nodes = []
    let root
    const createMessageNode = (params: messageNode) => {
        const { type, message } = params
        const Node = (props) => {
            const { className, style } = props
            return (
                <div style={style} className={classNames('relative flex justify-center items-center bg-[#eff0ee] rounded px-4 py-1', { 'text-success': type === 'success' }, { 'text-error': type === 'error' }, { 'text-waring': type === 'waring' }, className)}>
                    <span className="leading-4">{icon[type]}</span>
                    <span className='ml-1 text-[0.875rem]'>
                        {message}
                    </span>
                </div>
            )
        }
        return Node
    }
    const renderMessage = () => {
        if (!root) {
            root = document.createElement('div')
            root.className = 'fixed z-max top-20 left-1/2 cursor-pointer -translate-x-1/2'
            document.body.appendChild(root)
        }
        const reactElement = nodes.map((Node, index) => {
            let top = null
            if (index !== 0) top = `${index / 2}rem`
            return <Node key={index} style={{ top }} />
        })
        render(reactElement, root)
    }
    const timeOutRemoveNode = (node, delay, onClose?: () => void) => {
        let timer = setTimeout(() => {
            const index = nodes.findIndex((nodeItme) => nodeItme === node)
            nodes.splice(index, 1)
            renderMessage()
            if (onClose) onClose()
            timer = null
        }, delay)
    }
    const renderWithType = (type: 'success' | 'error' | 'waring') => {
        return (params: string | messageParams) => {
            const nodeParams: messageNode = { type, message: '' }
            if (typeof params === 'string') {
                nodeParams.message = params
            } else {
                nodeParams.message = params.message
            }
            const { delay = 2000, onClose } = params as messageParams
            const node = createMessageNode(nodeParams)
            nodes.push(node)
            renderMessage()
            timeOutRemoveNode(node, delay, onClose)
        }
    }
    return {
        success: renderWithType('success'),
        error: renderWithType('error'),
        waring: renderWithType('waring')
    }
}
type tipsProps = {
    text: string,
    type: tipsType,
    visiable: boolean,
    iconSrc?: any,
    space?: number,
    className?: string
}
function Tips(props: tipsProps) {
    const Icon = useMemo(() => {
        if (props.iconSrc) return <Image alt="icon" src={props.iconSrc}></Image>
        return icon[props.type]
    }, [props.iconSrc, props.type])
    return (
        <>
            {props.visiable ?
                <span className={classNames('flex items-center text-[0.875rem]', { 'text-success': props.type === 'success' }, { 'text-error': props.type === 'error' }, { 'text-waring': props.type === 'waring' }, props.className)}>
                    <span className="leading-4">{Icon}</span>
                    <span style={{ marginLeft: props.space }} className='ml-1 leading-4'>{props.text}</span>
                </span>
                : null
            }
        </>
    )
}

export {
    message,
    Tips
}