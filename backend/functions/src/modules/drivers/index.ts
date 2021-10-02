import express from 'express'
import cors from 'cors'
import { router } from './drivers.routes'

export const driversApp = express()

driversApp.use(cors())
driversApp.use(express.json())
driversApp.use('/drivers', router)