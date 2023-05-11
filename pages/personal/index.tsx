import { useEffect, useRef, useState, useMemo } from "react"
import { downloadFile, getCookie, request } from "@/utils"
import List from '@/public/images/list.svg'
import LikeList from '@/public/images/likelist.svg'
import Modify from '@/public/images/modify.svg'
import Question from '@/public/images/question.svg'
import classNames from "classnames"
import Transfer from "@/components/transfer"
import s from '@/styles/index.module.less'
import Tag from "@/components/tag"
import { tags } from "@/utils/config"
import Modal from "@/components/modal"
import { message } from "@/components/message"
import { Table, Input, Button } from 'antd'
import Link from "next/link"
import Layout from "@/components/layout"
const menu = [
    { name: '笔记列表', id: 0, Icon: () => <List /> },
    { name: '收藏列表', id: 2, Icon: () => <LikeList /> },
    { name: '修改评论', id: 3, Icon: () => <Modify /> }
]
const sourceTags = tags.map((i) => {
    return { key: i, title: i }
})
const { success, waring, error } = message()
export default function Personal() {
    const [active, setActive] = useState<number>(0)
    useEffect(() => {
        const auth = getCookie('AUTHID'), user = getCookie('UID')
    }, [])
    return (
        <Layout>
            <div className="relative min-h-screan-112">
                <div className="absolute w-[200px] text-white bg-head h-full">
                    {
                        menu.map(({ name, id, Icon }) => {
                            return (
                                <div key={id} onClick={() => setActive(id)} className={classNames('px-4 py-2 flex items-center cursor-pointer border shadow-2xl', { 'text-theme border-theme bg-gradient-to-l from-theme-500': active === id }, { 'border-white border-opacity-10': active !== id })}>
                                    <Icon />
                                    <span className="ml-4">{name}</span>
                                </div>
                            )
                        })
                    }
                </div>
                <div className={classNames("absolute h-full p-6 ml-[200px] overflow-auto", s.calc_200)}>
                    {active === 0 && <Notes />}
                    {active === 1 && <AddNote />}
                    {active === 2 && <Collection />}
                </div>
            </div>
        </Layout>
    )
}
// 我的笔记
function Notes() {
    const cloumn = [
        { title: '笔记概述', dataIndex: 'desc', key: 'desc' },
        {
            title: '笔记标签', dataIndex: 'tag', render: (val: string) => {
                const arr = val.split('，')
                return (
                    <div className="flex flex-wrap max-w-[500px]">
                        {
                            arr.map((v, index) => {
                                return <Tag className={'m-px'} text={v} key={index} />
                            })
                        }
                    </div>
                )
            }
        },
        {
            title: '笔记内容', dataIndex: 'fileName', render: (_, val) => {
                return (
                    <Link href={`/blogs/${val._id}`}>
                        <p className='block cursor-pointer hover:text-primary leading-6 text-justify'>{_}</p>
                    </Link>
                )
            }
        },
        {
            title: '操作', dataIndex: 'opt', render: (_, val) => {
                return (
                    <div className="whitespace-nowrap">
                        <span className={classNames("pr-2 border-r border-gray-300 inline-block relative", s.hover)}>
                            <span className="cursor-pointer text-primary">更多</span>
                            <ul className={classNames("absolute hidden bg-white py-1 px-3 z-10 rounded list-none shadow", s.hover_show)}>
                                <li className="cursor-pointer my-1 hover:text-primary" onClick={() => update(val.desc, val._id)}>编辑概述</li>
                                <li className="cursor-pointer my-1 hover:text-primary" onClick={() => uploadNote(val._id)}>笔记上传</li>
                            </ul>
                        </span>
                        <span className="cursor-pointer pl-2 text-[red]" onClick={() => deleteList(val._id)}>删除</span>
                    </div>
                )
            }
        }
    ]
    const [data, setData] = useState<any[]>([])
    const [tag, setTag] = useState<string>('')
    const [desc, setDesc] = useState<string>('')
    const [show, setShow] = useState<boolean>(false)
    const [updateDesc, setUpdateDesc] = useState<string>('')
    const [updateID, setID] = useState<string>('')
    const [addBox, setShowAdd] = useState<boolean>(false)
    const ref = useRef<HTMLInputElement>()
    useEffect(() => {
        getList()
    }, [])
    const getList = (params: Record<string, string> = {}) => {
        const user = getCookie('UID')
        request.get('/blog/personal', { data: { user, ...params } }).then((res) => {
            if (res.success) {
                setData(res.data)
            } else {
                setData([])
            }
        })
    }
    const deleteList = (_id: string) => {
        request.post('/blog/delete', { data: { _id } }).then((res) => {
            if (res.success) {
                success('删除成功')
                getList()
            } else {
                error(res.message)
            }
        })
    }
    const search = () => {
        const params: any = {}
        tag && (params.tag = tag.trim())
        desc && (params.desc = desc.trim())
        getList(params)
    }
    const update = (val: string, id: string) => {
        setUpdateDesc(val)
        setID(id)
        setShow(true)
    }
    const closeModal = () => {
        setShow(false)
        setUpdateDesc('')
        setID('')
    }
    const uploadNote = (id: string) => {
        setID(id)
        waring({
            message: '上传的笔记将会覆盖之前的内容', delay: 1500, onClose: () => {
                ref.current.click()
            }
        })
    }
    const fileChange = (e) => {
        const file = e.target.files[0]
        const data = new FormData()
        data.append('_id', updateID)
        data.append('file', file)
        request.post('/blog/update', { data }).then((res) => {
            if (res.success) {
                success('编辑成功')
                getList()
                closeModal()
            } else {
                error(res.message)
            }
        })
    }
    const pushUpdate = () => {
        const params = { _id: updateID, desc: updateDesc }
        request.post('/blog/update', { data: params }).then((res) => {
            if (res.success) {
                success('编辑成功')
                getList()
                closeModal()
            } else {
                error(res.message)
            }
        })
    }
    return (
        <div className="bg-white p-6 rounded">
            <div className="text-center">
                <span className="text-[24px] text-primary font-bold">我的笔记目录</span>
                <i className="text-[14px] text-gray-400">(温故而知新)</i>
            </div>
            <div className={classNames("mt-6 text-right", s.antd_button)}>
                <Input placeholder={'请输入笔记概述'} value={desc} style={{ width: 240 }} onChange={(e) => setDesc(e.target.value)} />
                <Input placeholder={'请输入笔记标签'} value={tag} style={{ width: 240, margin: '0px 12px' }} onChange={(e) => setTag(e.target.value)} />
                <Button type={'primary'} onClick={search} className="mr-3">查询</Button>
                <Button type={'primary'} onClick={() => setShowAdd(true)} >新增</Button>
            </div>
            <div className="mt-6">
                <Table columns={cloumn} dataSource={data} />
            </div>
            <input ref={ref} type={'file'} hidden onChange={fileChange} />
            <Modal visiable={show} onClose={closeModal}>
                <div className="bg-white p-6 rounded whitespace-nowrap">
                    <p className="text-center text-lg font-semibold">编辑笔记概述</p>
                    <textarea className="min-h-[74px] w-[400px] mt-6 block outline-none border border-gray-400 rounded p-1 max-h-[150px] flex-1" onChange={(e) => setUpdateDesc(e.target.value)} value={updateDesc} placeholder={'请输入笔记概述'} maxLength={150} />
                    <div className="flex justify-center items-center mt-6">
                        <Button type={'primary'} className="bg-primary mx-1" onClick={closeModal}>取消</Button>
                        <Button type={'primary'} className="bg-primary mx-1" onClick={pushUpdate}>确认</Button>
                    </div>
                </div>
            </Modal>
            <Modal visiable={addBox} onClose={() => setShowAdd(false)}>
                <AddNote />
            </Modal>
        </div>
    )
}

// 添加笔记
function AddNote() {
    const upload = useRef<any>()
    const [tagSource, setTagSource] = useState<any[]>(sourceTags)
    const [file, setFile] = useState<any>()
    const [addSource, setAddSource] = useState<any[]>([])
    const [show, setShow] = useState<boolean>(false)
    const [addTag, setAddTag] = useState<string>('')
    const [tag, seTag] = useState<string>('')
    const [desc, setDesc] = useState<string>('')
    const fileChange = (e) => {
        const file = e.target.files[0]
        setFile(file)
    }
    const render = (item) => {
        return <Tag text={item.title} />
    }
    const addTages = () => {
        const addSource = []
        addSource.push({ key: addTag, title: addTag })
        setAddSource(addSource)
        success({
            message: '添加成功', delay: 1000, onClose: () => {
                setShow(false)
                setAddTag('')
            }
        })
    }
    const tagChange = (tar: any[]) => {
        let tags = ''
        tar.forEach((item) => {
            tags += item.title + '，'
        })
        seTag(tags.slice(0, -1))
    }
    const reset = () => {
        setFile(null)
        setDesc('')
        seTag('')
        setAddSource([])
        setTagSource([...sourceTags])
    }
    const addNote = () => {
        if (!desc || !file || !tag) {
            waring('请添加笔记描述、标签和内容')
        } else {
            if (file.size === 0) return error('文件无内容')
            const user = getCookie('UID')
            const data = new FormData()
            data.append('file', file)
            data.append('desc', desc)
            data.append('tag', tag)
            data.append('user', user)
            request.post('/blog/add', { data }).then((res) => {
                if (res.success) {
                    success({ message: '添加成功', onClose: () => reset() })
                } else {
                    error(res.message)
                }
            })
        }
    }
    return (
        <div className="bg-white px-12 py-6 rounded">
            <div className="text-center">
                <span className="text-[24px] text-primary font-bold">每天记录一点点，技术进步一点点</span>
            </div>
            <div className="flex items-center whitespace-nowrap w-[50%] min-w-[640px] mt-6 mx-auto relative">
                <span className="text-[red] px-px absolute -translate-x-full">*</span>
                <span>笔记概述：</span>
                <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="请输入该笔记的概述(最多150字)" maxLength={150} className="flex-1 min-h-[74px] border rounded border-gray-400 max-h-[150px] outline-none px-3 py-2" />
            </div>
            <div className="flex items-center whitespace-nowrap mt-6 w-[50%] min-w-[640px] mx-auto relative">
                <span className="text-[red] px-px absolute -translate-x-full">*</span>
                <span>笔记标签：</span>
                <Transfer className="flex-1" render={render} source={tagSource} sourceAdd={addSource} onSelectChange={tagChange} />
                <span onClick={() => setShow(true)} className="cursor-pointer absolute right-0 translate-x-full pl-2" title={'标签不够？点击添加'}>
                    <Question />
                </span>
            </div>
            <div className="flex items-center whitespace-nowrap w-[50%] mt-6 min-w-[640px] mx-auto relative">
                <span className="text-[red] px-px absolute -translate-x-full">*</span>
                <span>笔记内容：</span>
                <Button type={'primary'} className="text-white bg-primary rounded px-2 py-1" onClick={() => upload?.current?.click()}>上传MD文件</Button>
                <span className="ml-2 text-red-500">{file && file.name}</span>
                <input ref={upload} type={'file'} hidden onChange={fileChange} />
            </div>
            <div className="w-full text-center mt-6">
                <Button type={'primary'} className="text-white bg-primary rounded mx-1" onClick={addNote}>添加笔记</Button>
                <Button type={'primary'} className="text-white bg-primary rounded mx-1" onClick={reset}>重置笔记</Button>
            </div>
            <Modal visiable={show} onClose={() => setShow(false)}>
                <div className='bg-white p-6 rounded'>
                    <p className="text-center text-lg">添加标签</p>
                    <Input size={'large'} value={addTag} onKeyDown={(e) => e.keyCode === 13 && addTages()} onChange={(e) => setAddTag(e.target.value)} placeholder={'请输入标签名'} />
                    <Button type={'primary'} size={'large'} className="bg-primary w-full mt-6" onClick={addTages}>添加</Button>
                </div>
            </Modal>
        </div>
    )
}

// 我的收藏
interface task { (): Promise<any> }
function Collection() {
    const pools = []
    function deepCopy(obj, map = new WeakMap()) {
        if (typeof obj != 'object') return
        var newObj = Array.isArray(obj) ? [] : {}
        if (map.get(obj)) {
            return map.get(obj);
        }
        map.set(obj, newObj);
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                if (typeof obj[key] == 'object') {
                    newObj[key] = deepCopy(obj[key], map);
                } else {
                    newObj[key] = obj[key];
                }
            }
        }
        return newObj;
    }
    const deepClone = (obj) => {
        // 定义一个映射，初始化的时候将 obj 本身加入映射中
        const map = new WeakMap()
        map.set(obj, true)
        // 封装原来的递归逻辑
        const copy = (obj) => {
            if (!obj || typeof obj !== 'object') {
                return {}
            }
            const newObj = Array.isArray(obj) ? [] : {}
            for (const key in obj) {
                const value = obj[key]
                // 如果拷贝的是简单类型的值直接进行赋值
                if (typeof value !== 'object') {
                    newObj[key] = value
                } else {
                    // 如果拷贝的是复杂数据类型第一次拷贝后存入 map
                    // 第二次再次遇到该值时直接赋值为 null，结束递归
                    if (map.has(value)) {
                        newObj[key] = null
                    } else {
                        map.set(value, true)
                        newObj[key] = copy(value)
                    }
                }
            }
            return newObj
        }
        return copy(obj)
    }
    const run = () => {
        const seven: any = {
            name: 'seven',
            fn: () => { }
        }
        const juejin = {
            name: 'juejin',
            relative: seven
        }
        seven.relative = juejin
        const res: any = deepCopy(seven)
        res.a = 2
        console.log(res, seven)
    }
    return (
        <button onClick={run}>执行</button>
    )
}