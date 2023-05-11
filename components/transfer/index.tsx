import { ReactElement, useState, useEffect, useRef } from "react"
import { Button } from 'antd'
import classNames from "classnames"
import Left from '@/public/images/left.svg'
import Right from '@/public/images/right.svg'
type data = {
    key: string,
    title: string,
    [k: string]: any
}
type props = {
    render?: (p: any) => ReactElement,
    target?: data[],
    source?: data[],
    sourceAdd?: data[],
    onSelectChange?: (rg: data[], lf: data[]) => void,
    width?: number,
    className?: string
}
export default function Transfer(props: props) {
    const { render, target, source, onSelectChange, width, className, sourceAdd} = props
    const lfState: Record<string, boolean> = {}, rgState: Record<string, boolean> = {};
    (source || []).forEach(item => {
        lfState[item.key] = false
    });
    (target || []).forEach(item => {
        rgState[item.key] = false
    });
    const [left, setLeft] = useState<any[]>(source || [])
    const [right, setRight] = useState<any[]>(target || [])
    const [leftState, setLeftState] = useState<Record<string, boolean>>(lfState)
    const [rightState, setRightState] = useState<Record<string, boolean>>(rgState)
    const [leftCheckAll, setLeftCheckAll] = useState<boolean>(false)
    const [rightCheckAll, setRightCheckAll] = useState<boolean>(false)
    const [leftReSelect, setLeftReselect] = useState<boolean>(false)
    const [rightReSelect, setRightReSelect] = useState<boolean>(false)
    useEffect(() => {
        const lfState = {}, rgState = {}
        let lf: any = [], rg: any = []
        source && (lf = [...source])
        target && (rg = [...target])
        lf.forEach(({key}) => {
            lfState[key] = false
        })
        rg.forEach(({key}) => {
            rgState[key] = false
        })
        setLeft(lf)
        setLeftState(lfState)
        setLeftReselect(false)
        setLeftCheckAll(false)
        setRight(rg)
        setRightState(rgState)
        setRightCheckAll(false)
        setRightReSelect(false)
    }, [source, target])
    useEffect(() => {
        if(sourceAdd && sourceAdd.length) {
            const lfData = [...left, ...sourceAdd], lfState = {...leftState}
            sourceAdd.forEach(({key}) => {
                lfState[key] = false
            })
            setLeftState(lfState)
            setLeft(lfData)
        }
    }, [sourceAdd])
    const itemSelect = (type: 'left' | 'right', key) => {
        if (type === 'left') {
            const arr = []
            for (let k in leftState) {
                if (k === key) {
                    arr.push(!leftState[k])
                } else {
                    arr.push(leftState[k])
                }
            }
            const allSelect = !arr.includes(false)
            setLeftCheckAll(allSelect)
            setLeftReselect(false)
            setLeftState((pre) => {
                const preState = pre[key]
                return { ...pre, [key]: !preState }
            })
        } else {
            const arr = []
            for (let k in rightState) {
                if (k === key) {
                    arr.push(!rightState[k])
                } else {
                    arr.push(rightState[k])
                }
            } 
            const allSelect = !arr.includes(false)
            setRightCheckAll(allSelect)
            setRightReSelect(false)
            setRightState((pre) => {
                const preState = pre[key]
                return { ...pre, [key]: !preState }
            })
        }
    }
    const selectAll = (type: 'left' | 'right') => {
        const pre = type === 'left' ? leftCheckAll : rightCheckAll, now = !pre
        if (type === 'left') {
            setLeftCheckAll(now)
            setLeftReselect(false)
            setLeftState((pre) => {
                const state = {}
                for (let k in pre) {
                    state[k] = now
                }
                return state
            })
        } else {
            setRightCheckAll(now)
            setRightReSelect(false)
            setRightState((pre) => {
                const state = {}
                for (let k in pre) {
                    state[k] = now
                }
                return state
            })
        }
    }
    const reSelectAll = (type: 'left' | 'right') => {
        const pre = type === 'left' ? leftReSelect : rightReSelect, now = !pre
        if (type === 'left') {
            setLeftReselect(now)
            setLeftCheckAll(false)
            setLeftState((pre) => {
                const state = {}
                for (let k in pre) {
                    const preState = pre[k], nowState = !preState
                    state[k] = nowState
                }
                return state
            })
        } else {
            setRightReSelect(now)
            setRightCheckAll(false)
            setRightState((pre) => {
                const state = {}
                for (let k in pre) {
                    const preState = pre[k], nowState = !preState
                    state[k] = nowState
                }
                return state
            })
        }
    }
    const click = (type: 'add' | 'delete') => {
        const selectKeys = [], leftData = type === 'add' ? [] : [...left], rightData = type === 'delete' ? [] : [...right], leftStatus = {}, rightStatus = {}
        if (type === 'add') {
            for (let k in leftState) {
                if (leftState[k]) selectKeys.push(k)
            }
            left.forEach((item) => {
                if (selectKeys.includes(item.key)) {
                    rightData.push(item)
                } else {
                    leftData.push(item)
                }
            })
            leftData.forEach((item) => {
                leftStatus[item.key] = false
            })
            rightData.forEach((item) => {
                rightStatus[item.key] = false
            }) 
        } else {
            for (let k in rightState) {
                if (rightState[k]) selectKeys.push(k)
            }
            right.forEach((item) => {
                if (selectKeys.includes(item.key)) {
                    leftData.push(item)
                } else {
                    rightData.push(item)
                }
            })
            leftData.forEach((item) => {
                leftStatus[item.key] = false
            })
            rightData.forEach((item) => {
                rightStatus[item.key] = false
            }) 
        }
        setLeftCheckAll(false)
        setLeftReselect(false)
        setRightReSelect(false)
        setRightCheckAll(false)
        setLeftState(leftStatus)
        setRightState(rightStatus)
        setLeft(leftData)
        setRight(rightData)
        if(onSelectChange) {
            onSelectChange(rightData, leftData)
        }
    }
    return (
        <div style={{ width }} className={classNames('w-full flex', className)}>
            <div className="flex-1 border border-gray-300 rounded">
                <div className="flex px-3 py-2 border-b border-gray-200 whitespace-nowrap">
                    <span className="flex justify-center items-center cursor-pointer" onClick={() => selectAll('left')}>
                        <input className='mr-1 cursor-pointer' readOnly type={'checkbox'} checked={leftCheckAll} />
                        <span>全选</span>
                    </span>
                    <span className="mx-3">{left.length}项</span>
                    <span className="flex justify-center items-center cursor-pointer" onClick={() => reSelectAll('left')}>
                        <input className='mr-1 cursor-pointer' readOnly type={'checkbox'} checked={leftReSelect} />
                        <span>反选</span>
                    </span>
                </div>
                <div className="max-h-[400px] overflow-auto">
                    {
                        left.map((item) => {
                            let dom = render ? render(item) : null
                            if (!dom) {
                                dom = <span>{item.title}</span>
                            }
                            const check = leftState[item.key]
                            return (
                                <div key={item.key} className='flex items-center pl-3 py-1 hover:bg-gray-100 cursor-pointer' onClick={() => itemSelect('left', item.key)}>
                                    <input readOnly type={'checkbox'} className='mr-1 cursor-pointer' checked={check} />
                                    {dom}
                                </div>
                            )
                        })
                    }
                </div>
            </div>
            <div className="flex flex-col justify-center items-center px-2">
                <Button type={'primary'} className="flex justify-center items-center py-[2px] px-2 bg-primary rounded my-1 text-white" onClick={() => click('add')}>
                    <span>添加</span>
                    <Right />
                </Button>
                <Button type={'primary'} className="flex justify-center items-center py-[2px] px-2 bg-primary rounded my-1 text-white" onClick={() => click('delete')}>
                    <Left />
                    <span>移除</span>
                </Button>
            </div>
            <div className="flex-1 border border-gray-300 rounded">
                <div className="flex px-3 py-2 border-b border-gray-200 whitespace-nowrap">
                    <span className="flex justify-center items-center cursor-pointer" onClick={() => selectAll('right')}>
                        <input readOnly className='mr-1 cursor-pointer' type={'checkbox'} checked={rightCheckAll} />
                        <span>全选</span>
                    </span>
                    <span className="mx-3">{right.length}项</span>
                    <span className="flex justify-center items-center cursor-pointer" onClick={() => reSelectAll('right')}>
                        <input readOnly className='mr-1 cursor-pointer' type={'checkbox'} checked={rightReSelect} />
                        <span>反选</span>
                    </span>
                </div>
                <div className="max-h-[400px] overflow-auto">
                    {
                        right.map((item) => {
                            let dom = render ? render(item) : null
                            if (!dom) {
                                dom = <span>{item.title}</span>
                            }
                            const check = rightState[item.key]
                            return (
                                <div key={item.key} className='flex items-center pl-3 py-1 hover:bg-gray-100 cursor-pointer' onClick={() => itemSelect('right', item.key)}>
                                    <input readOnly type={'checkbox'} className='mr-1 cursor-pointer' checked={check} />
                                    {dom}
                                </div>
                            )
                        })
                    }
                </div>
            </div>
        </div>
    )
}