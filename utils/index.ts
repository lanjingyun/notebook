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
    data: Record<string, any> | Blob | FormData,
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
export const request = new Request()

export const tags = [
    'JavaScript', 'Webpack', 'HTML', 'CSS', 'React', 'Vue', 'Linux命令', 'Docker', 'Next', 'TypeScript', 'Node', 'Bug', 'MongoDB', '踩坑',
    '项目部署', '项目优化','性能优化', '基础知识', '框架', '微前端', '浏览器API', '浏览器兼容性', '高级应用', '高级API', '页面布局', '算法',
]
