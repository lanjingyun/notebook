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
    const arr = fs.readFileSync('./blogList.txt').toString().split('\r\n')
    for(let i = 0; i < arr.length; i++) {
        const list = arr[i] && JSON.parse(arr[i])
        if(list?.fileName === fileName) return res.status(500).json({success: false, message: '文件已存在'})
    }
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

module.exports = router