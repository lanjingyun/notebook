import banner from '@/public/images/banner.png'
import banner2 from '@/public/images/banner2.png'
import Image from 'next/image'
import classNames from 'classnames'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useThrottle } from '@/utils/hooks'
type Props = {
    list: { src: any }[],
    width?: number,
    height?: number,
    delay?: number,
    showArrow?: boolean,
    className?: string
}
export default function Carousel(props: Props) {
    const { list, width, height, delay = 2500, showArrow = true, className } = props
    const timeRef = useRef<any>()
    const indexRef = useRef<number>(1)
    const box = useRef<any>()
    const [W, setW] = useState<number>(width)
    const [style, setStyle] = useState<any>({})
    const [active, setActive] = useState<number>(0)
    const AllList = useMemo(() => {
        const arr = [...list]
        arr.unshift(list[list.length - 1])
        arr.push(list[0])
        return arr
    }, [list])
    useEffect(() => {
        const w = box.current.clientWidth
        setStyle({transform: `translateX(${indexRef.current * -w}px)`})
        run()
        return () => clearInterval(timeRef.current)
    }, [width, box.current])
    const run = () => {
        if (timeRef.current) clearInterval(timeRef.current)
        const Box = box.current
        timeRef.current = setInterval(() => {
            const next = indexRef.current + 1, active = next === 0 ? list.length - 1 : (next > list.length ? 0 : next -1)
            indexRef.current = next
            const style = {
                transform: `translateX(${next * -Box.clientWidth}px)`,
                transition: 'all 300ms ease'
            }
            setStyle(style)
            setActive(active)
            if (next === list.length + 1) {
                const timer = setTimeout(() => {
                    indexRef.current = 1
                    setStyle({ transform: `translateX(-${Box.clientWidth}px)` })
                    clearTimeout(timer)
                }, 300);
            }
        }, delay)
    }
    const move = (step: 1 | -1) => {
        const index = indexRef.current + step, nextActive = index === 0 ? list.length - 1 : (index === list.length + 1 ? 0 : index - 1)
        const style = {
            transform: `translateX(${index * -box.current.clientWidth}px)`,
            transition: 'all 300ms ease'
        }
        setActive(nextActive)
        setStyle(style)
        indexRef.current = index
        if (index === list.length + 1 || index === 0) {
            const timer = setTimeout(() => {
                if (index === 0) {
                    indexRef.current = list.length
                    setStyle({ transform: `translateX(${list.length * -box.current.clientWidth}px)` })
                }
                if (index === list.length + 1) {
                    indexRef.current = 1
                    setStyle({ transform: `translateX(-${box.current.clientWidth}px)` })
                }
                clearTimeout(timer)
            }, 300);
        }
    }
    const clickArrow = useThrottle((step: -1 | 1) => {
        if (timeRef.current) clearInterval(timeRef.current)
        move(step)
    })
    const labClick = (i: number) => {
        if (timeRef.current) clearInterval(timeRef.current)
        const style = {
            transform: `translateX(${(i + 1) * -box.current.clientWidth}px)`,
            transition: 'all 300ms ease'
        }
        indexRef.current = i
        setActive(i)
        setStyle(style)
    }
    const leaveArrow = () => run()
    return (
        <div ref={box} className={classNames('relative', className)} style={{ width, height }}>
            <span className={classNames("absolute top-1/2 -left-8 -translate-x-full cursor-pointer z-10 xl:block hidden", { 'hidden': !showArrow })} onClick={() => clickArrow(-1)} onMouseLeave={leaveArrow}>
                左
            </span>
            <div className='w-full h-full overflow-hidden'>
                <ul className='inline-block whitespace-nowrap' style={{...style}}>
                    {
                        AllList.map((item, index) => {
                            return (
                                <li key={index} className='inline-block'>
                                    <Image src={item.src} alt={'banner'}></Image>
                                </li>
                            )
                        })
                    }
                </ul>
            </div>
            <span className={classNames("absolute top-1/2 -right-8 translate-x-full cursor-pointer z-10 xl:block hidden", { 'hidden': !showArrow })} onClick={() => clickArrow(1)} onMouseLeave={leaveArrow}>
                右
            </span>
            <ul className="flex justify-center items-center mt-4">
                {
                    list.map((_, index) => {
                        return (
                            <li onClick={() => labClick(index)} onMouseLeave={leaveArrow} key={index} className={classNames('h-1 w-8 3xl:w-12 rounded-xl cursor-pointer mx-1', { 'bg-button': index === active }, { 'bg-black bg-opacity-5': index !== active })}></li>
                        )
                    })
                }
            </ul>
        </div>
    )
}

export function DefaultCarousel() {
    const bannerList = [
        { src: banner },
        { src: banner2 }
    ]
    return <Carousel className='sm:w-[650px] md:w-[750px] lg:w-[950px] xl:w-[660px] 2xl:w-[850px] 3xl:w-[950px]' list={bannerList} />
}