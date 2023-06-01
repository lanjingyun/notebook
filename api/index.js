const express = require('express')
const multer = require('multer')
const bodyParser = require('body-parser')
const fs = require('fs')

const { Router } = express
const router = Router()

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

router.post('/api/blogAdd', multer().single('file'), (req, res) => {
    const { tag, desc, fileName } = req.body
    const file = req.file
    const data = {tag, desc, fileName}
    fs.writeFile(`./blogFile/${fileName}`, file.buffer, (err) => {
        if(err){
            res.status(500).json({success: false, message: '服务器错误'})
        } else {
            fs.appendFile('./blogList.txt', JSON.stringify(data) + '\r\n', (err) => {
                if(err){
                    res.status(500).json({success: false, message: '服务器错误'})
                } else {
                    res.status(200).json({success: true, message: '添加成功'})
                }
            })
        }
    })
})

router.post('/api/blogUpdate', multer().single('file'), (req, res) => {
    const { desc, fileName } = req.body
    const file = req.file
    file && (file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8'))
    const arr = fs.readFileSync('./blogList.txt').toString().split('\r\n')
    let data = ''
    for(let i = 0; i < arr.length; i++) {
        const list = arr[i] && JSON.parse(arr[i])
        if(list?.fileName === fileName){
            list.desc = desc || list.desc
            list.fileName = (file && file.originalname) || list.fileName
            data += JSON.stringify(list) + '\r\n'
        } else {
            arr[i] && (data += arr[i] + '\r\n')
        }
    }
    fs.writeFile('./blogList.txt', data, (err) => {
        if(err) {
            res.status(500).json({success: false, message: '服务器错误'})
        } else {
            if(file) {
                fs.unlinkSync(`./blogFile/${fileName}`)
                fs.writeFile(`./blogFile/${file.originalname}`, file.buffer, (err) => {
                    err ? res.status(500).json({success: false, message: '服务器错误'}) : res.status(200).json({success: true, message: '修改成功'})
                })
            } else {
                res.status(200).json({success: true, message: '修改成功'})
            }
        }
    })
})

module.exports = router