import cn from "classnames";
import Modal from "../modal"
import { useState, useMemo, useRef, useEffect } from "react"
import { message } from "../message"
import { useRouter } from "next/router"
import { getCookie, request, setCookie } from "@/utils" 
import Header from "./component/head"; 
import { Input, Button } from 'antd'

const { error, success } = message()
export default function Layout(props) {
    const { children } = props
    const nav: any = useRouter()
    const aband = useRef<string>('')
    const [show, setShow] = useState<boolean>(false)
    const [account, setAccount] = useState<string>('')
    const [password, setPassword] = useState<string>('')
    const [active, setActive] = useState<string>('/')
    const router = useMemo(() => {
        const push = nav.push
        nav.authorList = ['/personal']
        nav.push = (path: string) => {
            if (nav.authorList.includes(path)) {
                const auth = getCookie('AUTHID'), user = getCookie('UID')
                if (!auth || !user) {
                    setShow(true)
                    aband.current = path
                    return { aband: true }
                } else {
                    push(path)
                    return { aband: false }
                }
            } else {
                push(path)
                return { aband: false }
            }
        }
        return nav
    }, [])
    useEffect(() => {
        setActive(location.pathname)
    }, [])
    const navgat = (path: string) => {
        const { aband } = router.push(path)
        if (!aband) setActive(path)
    }
    const login = () => {
        if (!account || !password) {
            error('请输入账号和密码！')
        } else {
            request.post('/user/login', { data: { name: account, password } }).then((res) => {
                if (res.success) {
                    setCookie('AUTHID', res.token)
                    setCookie('UID', account)
                    setCookie('refresh', res.refresh)
                    setShow(false)
                    success({
                        message: '登录成功', onClose: () => {
                            if (aband.current) {
                                router.push(aband.current)
                                setActive(aband.current)
                                aband.current = ''
                            }
                        }
                    })
                } else {
                    error(res.message)
                }
            })
        }
    }
    return (
        <>
            <Header />
            <div className="min-h-screan-112 bg-content text-text">
                {children}
            </div>
            <Modal visiable={show} onClose={() => setShow(false)}>
                <div className='w-[460px] rounded-2xl px-12 bg-[#c9cbc9] py-6'>
                    <span className="inline-block w-full text-center text-[24px] mb-6">登录</span>
                    <Input size={'large'} placeholder="账号" onChange={(e) => setAccount(e.target.value)} value={account} />
                    <Input className="my-6" size={'large'} type={'password'} value={password} onKeyDown={(e) => e.keyCode === 13 && login()} onChange={(e) => setPassword(e.target.value)} placeholder="密码" />
                    <Button size={'large'} type={'primary'} onClick={login} className="bg-primary w-full">登录</Button>
                </div>
            </Modal>
            <footer className="flex justify-between h-[48px] p-3 bg-content">
                <span>© make by 阿sir</span>
            </footer>
        </>
    )
}