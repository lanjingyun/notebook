import { readFileSync } from "fs"
export default function handler(req, res) {
    const arr = readFileSync('./blogList.txt').toString().split('\r\n')
    const data = []
    arr.forEach((str) => {
        if(str) data.push(JSON.parse(str))
    })
    const result = {
        success: true,
        data
    }
    res.status(200).json(result)
}
