import { readFileSync } from "fs"
export default function handler(req, res) {
    const fileName = req.body?.fileName
    const arr = readFileSync('./blogList.txt').toString().split('\r\n')
    let data
    arr.forEach((str) => {
        const list = str && JSON.parse(str)
        if (list?.fileName === fileName) {
            data = readFileSync(`./blogFile/${fileName}`).toString()
        }
    })
    const result = {
        success: true,
        data
    }
    res.status(200).json(result)
}
