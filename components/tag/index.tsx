import { useMemo } from 'react'
import classNames from 'classnames'
import s from './index.module.less'
type props = {
    text: string,
    className?: string
}
export default function Tag (props) {
    const { text, className } = props
    const color = useMemo(() => {
        const len = 12, index = Math.round(Math.random() * len)
        return `c${index}`
    }, [])
    return (
        <div title={text} className={classNames(s[color], 'text-white text-[12px] px-2 py-1 leading-4 rounded max-w-[200px] text-ellipsis overflow-hidden whitespace-nowrap inline-block', className)}>
            {text}
        </div>
    )
}