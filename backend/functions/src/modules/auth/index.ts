import express from 'express'
import cors from 'cors'
import { router } from './auth.routes'
import { errors } from 'celebrate'

export const authApp = express()

authApp.use(cors())
authApp.use(express.json())
authApp.use('/auth', router)
authApp.use(errors())