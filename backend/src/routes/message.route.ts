import express from 'express'
import { type Request, type Response } from 'express';

const router = express.Router()

router.get('/send', (req: Request, res: Response) => {
    res.send('Send Message endpoint')
})

router.get('/receive', (req: Request, res: Response) => {
    res.send('Receive Message endpoint')
})



export default router