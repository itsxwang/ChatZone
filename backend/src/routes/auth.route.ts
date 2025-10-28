import express from 'express'
import { type Request, type Response } from 'express';

const router = express.Router()

router.get('/signup', (req: Request, res: Response) => {
  res.send('Signup endpoint')
})

router.get('/login', (req: Request, res: Response) => {
  res.send('Login endpoint')
})

router.get('/logout', (req: Request, res: Response) => {
  res.send('Logout endpoint')
})

export default router
