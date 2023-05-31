import { readFileSync } from "fs"

export default function handler(req, res) {
    console.log(req.body)
    const arr = readFileSync('./db/index.txt').toString().split('\r\n')
    res.status(200).json({ message: 'w' })
}
