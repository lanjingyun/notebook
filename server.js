const express = require('express')
const next = require('next')
const { createProxyMiddleware } = require('http-proxy-middleware')
const router = require('./api')

const port = parseInt(process.env.PORT, 10) || 3000
const dev = process.env.NODE_ENV !== 'production'
const app = next({dev})
const handle = app.getRequestHandler()
const server = express()

const devProxy = {
    '/api': {
        target: 'http://localhost:3030',
        // target: 'http://192.168.2.55:8000',
        changeOrigin: true,
        // pathRewrite: {
        //     '^/api': '/'
        // },
        ws: true
    }
}

app.prepare()
    .then(() => {
        // if (dev && devProxy) {
        //     Object.keys(devProxy).forEach(function(context) {
        //         server.use(createProxyMiddleware(context, devProxy[context]))
        //     })
        // }
        server.use(router)
        server.all('*', (req, res) => {
            handle(req, res)
        })
        server.listen(port, err => {
            if (err) {
                throw err
            }
            console.log(`start on ==> http://localhost:${port}`)
        })
    })
    .catch(err => {
        console.log('发生错误，启动服务失败')
        console.log(err)
    })