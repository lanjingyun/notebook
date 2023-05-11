const ErrorStatus: any = {
    400: '访问参数发生错误',
    401: '操作未授权',
    404: '访问服务不存在',
    500: '服务器发生错误。',
    502: '网关错误。',
    503: '服务不可用，服务器暂时过载或维护。',
    504: '网关超时。',
}
type method = 'GET' | 'POST'
type getOption = {
    data?: Record<string, string | number>,
    timeout?: number
}
type postOption = {
    data: Record<string, string | number> | Blob | FormData,
    timeout?: number
}
type fetchOption = {
    type: method,
    data?: Record<string | number, any> | FormData | Blob,
    timeout?: number,
    responseType?: 'stream' | null 
}
class Request {
    private get baseUrl(): string {
        return '/api'
    }
    private get exclude(): string[] {
        return ['/user/login', '/user/loginCaptcha', '/file/download']
    }
    private withTimeout(p, delay) {
        if (delay <= 0) return p
        const timeout = new Promise((res) => setTimeout(() => res({ isTimeout: true }), delay))
        return Promise.race([timeout, p])
    }
    private async fetch(url: string, opts: fetchOption) {
        const { type, data, timeout = 0, responseType } = opts
        const opt: any = {
            method: type,
            headers: {
                'Content-Type': 'application/json'
            }
        }
        if ( type === 'POST') {
            if(data instanceof Blob || data instanceof FormData) {
                delete opt.headers
                opt.body = data
            } else {
                opt.body = JSON.stringify(data)
            }
        }
        const response = await this.withTimeout(fetch(this.baseUrl + url, opt), timeout).catch(() => { return { networkError: true } })
        if (response.networkError) return Promise.resolve({ networkError: true, success: false})
        if (response.isTimeout) return Promise.resolve({ isTimeout: true, success: false })
        if (responseType === 'stream') return response.body
        const { status } = response
        if(status === 200) {
            if (response.headers.get('Content-Type') === 'application/json; charset=utf-8') {
                return response.json()
            } else {
                return response.blob()
            }
        } else {
            return Promise.resolve({ success: false, message: ErrorStatus[status] || '服务器错误'})
        }
    }
    async get(url: string, opts: getOption = {}) {
        let u = url
        const { data, timeout } = opts
        if (data) {
            u += '?' + Object.keys(data).reduce((pre, n) => pre + '&' + n + '=' + String(data[n]), '').slice(1)
        }
        return this.fetch(u, {type: 'GET',timeout})
    }
    async post(url: string, opts: postOption) {
        return this.fetch(url, {type: 'POST', ...opts})
    }
}
// 复制
const copy = (val: string) => {
    const input = document.createElement('input')
    input.value = val
    input.style.height = '0px'
    document.body.appendChild(input)
    input.select()
    const res = document.execCommand('copy')
    document.body.removeChild(input)
    return res
}
// 下载
function downloadFile(name: string, data: any) {
    if (!['[object String]', '[object Blob]'].includes(Object.prototype.toString.call(data))) {
        throw new Error('Two parameters are required, one is a fileName(String) and the other is a String or Blob')
    }
    const isBlob = Object.prototype.toString.call(data) === '[object Blob]'
    const url = isBlob ? URL.createObjectURL(data) : data
    const a = document.createElement('a')
    a.download = name
    a.href = url
    a.click()
    URL.revokeObjectURL(url)
}
// 文件大小转化
function fileSize(size: number) {
    switch (true) {
        case size < 1024:
            return size + 'B'
        case size >= 1024 && size < Math.pow(1024, 2):
            return (size / 1024).toFixed(2) + 'KB'
        case size >= Math.pow(1024, 2) && size < Math.pow(1024, 3):
            return (size / Math.pow(1024, 2)).toFixed(2) + 'M'
        case size >= Math.pow(1024, 3):
            return (size / Math.pow(1024, 3)).toFixed(2) + 'G'
    }
}

// 节流
function throttle(cb: Function, delay?: number) {
    let time = 0
    const delayTime = delay || 300
    return (arg?: any) => {
        const t = new Date().getTime()
        if (t - time >= delayTime) {
            cb(arg)
            time = t
        }
    }
}
// cookie 
function setCookie(name: string, val: string, d?: number) {
    let cok = `${name}=${val};`
    if (d !== undefined) {
        const date = new Date(), expiresDate = date.getDate() + d
        date.setDate(expiresDate)
        cok = cok + `expires=${date.toUTCString()};`
    }
    document.cookie = cok
}

function getCookie(name: string) {
    if (!document.cookie) return null
    const str = document.cookie, arr = str.split(';')
    let res: string | null = null
    for (let i = 0; i < arr.length; i++) {
        if (arr[i].trim().split('=')[0] === name) {
            res = arr[i].trim().split('=')[1]
            break
        }
    }
    return res
}

function removeCookie(name: string) {
    setCookie(name, '', -1)
}

// 手机号正则
const phoneReg = /^1(3\d|4[5-9]|5[0-35-9]|6[567]|7[0-8]|8\d|9[0-35-9])\d{8}$/

export {
    copy,
    downloadFile,
    fileSize,
    throttle,
    setCookie,
    getCookie,
    removeCookie,
    phoneReg
}
export const request = new Request()


