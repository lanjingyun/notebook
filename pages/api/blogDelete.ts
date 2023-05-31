import { readFileSync, unlink, writeFile } from "fs"
export default function handler(req, res) {
    const fileName = req.body?.fileName
    const arr = readFileSync('./blogList.txt').toString().split('\r\n')
    let data = ''
    arr.forEach((str) => {
        if(str && !(JSON.parse(str).fileName === fileName)) {
            data += str + '\r\n'
        }
    })
    writeFile('./blogList.txt', data, (err) => {
        if(err) {
            res.status(500).json({success: false, message: '服务器错误'})
        } else {
            unlink(`./blogFile/${fileName}`, (err) => {
                err ? res.status(500).json({success: false, message: '服务器错误'}) : res.status(200).json({success: true, message: '删除成功'})
            })
        }
    })
}
