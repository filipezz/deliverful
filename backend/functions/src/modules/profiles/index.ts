import express from 'express'
import cors from 'cors'
import { router } from './profiles.routes'
import { errors } from 'celebrate'

export const profilesApp = express()

profilesApp.use(cors())
profilesApp.use(express.json())
profilesApp.use('/profiles', router)
profilesApp.use(errors())