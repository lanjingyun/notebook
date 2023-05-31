import { useState, useEffect } from 'react'
import Layout from '../layout'
import { request } from '@/utils'
import { Input, Card } from 'antd'
import s from './index.module.less'
import classNames from 'classnames'
import Forward from '@/public/images/zf.svg' 

const { Search } = Input
export default function Home() {
    const [value, setValue] = useState<string>('')
    const [list, setList] = useState<any[]>([])
    const onSearch = () => { }
    useEffect(() => {
        getList()
    }, [])
    const getList = () => {
        request.get('/blogList').then((res) => {
            if (res.success) {
                const { data } = res
                setList(data)
            }
        })
    } 
    return (
        <Layout>
            <div className={classNames('px-6 pt-6', s.home)}>
                <div className='text-right'>
                    <Search
                        placeholder={'请输入搜索关键字'}
                        allowClear
                        enterButton={'查询'}
                        size={'large'}
                        style={{ width: 320 }}
                        onSearch={onSearch}
                    />
                </div>
                <div className='bg-white rounded-xl'>
                    <div className='mt-6 p-6'>
                        <div className='flex flex-wrap'>
                            {
                                list.map((item, index) => {
                                    return (
                                        <div key={index} className={classNames('mr-3 mb-3 w-[24%]', s.shadow)}>
                                            <Card
                                                bordered={false}
                                                title={<span title={item.tag}>{item.tag}</span>}
                                                className='h-full flex flex-col'
                                                headStyle={{ minHeight: 0, color: 'rgb(var(--color-primary))', paddingTop: 8, paddingBottom: 8, width: '100%', overflow: 'hidden', textOverflow: 'ellipsis' }}
                                                bodyStyle={{ padding: 0, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}}>
                                                <div className='min-h-[4rem] max-w-[40rem] px-6 pt-3'>{item.desc}</div>
                                                <div className='border-t border-[#f0f0f0] flex flex-row-reverse items-center px-6 py-2 mt-1'>
                                                    <span className='flex justify-center items-center cursor-pointer' onClick={() => window.open(`/blogs?fileName=${item.fileName}`)}>
                                                        <Forward />
                                                        <span className='text-theme ml-1'>详情</span>
                                                    </span>
                                                </div> 
                                            </Card>
                                        </div>
                                    )
                                })
                            }
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    )
}