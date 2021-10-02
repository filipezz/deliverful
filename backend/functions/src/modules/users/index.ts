import express from 'express'
import cors from 'cors'
import { router } from './users.routes'

export const usersApp = express()

usersApp.use(cors())
usersApp.use(express.json())
usersApp.use('/users', router)