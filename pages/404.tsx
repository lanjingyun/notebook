import bg404 from '@/public/images/404bg.png'
import { DefaultCarousel } from '@/components/carousel'
import Image from 'next/image'
// import s from './index.module.less'
export default function Error () {
    const back = () => {
        history.back()
    }
    return (
        <section className='flex flex-col xl:flex-row justify-center items-center w-full h-screen-64 sm:h-auto min-h-screen-64 xl:h-screen-112 xl:min-h-[42.5rem]'>
            <div className='mt-6 xl:mt-0 w-full xl:flex-[8] xl:h-full flex justify-center items-center px-2'>
                <DefaultCarousel />
            </div>
            <div className="w-full xl:flex-[5] h-full text-black flex flex-col justify-center items-center xl:items-start xl:mb-0">
                <div className='flex flex-col text-center'>
                    <Image src={bg404} alt='image' />
                    <p className='text-[2rem] text-button'>功能开发中<span className='load-blue'></span></p>
                    <p className='my-2'>希望给您带来更好的文件传输体验</p>
                    <p className='text-[1.5rem] text-button'>升级内容正在开发中，敬请期待！</p>
                </div>
            </div>
        </section>
    )
}