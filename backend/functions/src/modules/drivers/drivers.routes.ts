import { Router } from 'express'
import { routeAdapter, middlewareAdapter } from '../../helpers/express.adapters'
import { makeCheckAuthMiddleware } from '../auth/auth.factory'
import { makeDriversController } from './drivers.factory'

const controller = makeDriversController()
const checkAuthMiddleware = makeCheckAuthMiddleware()

export const router = Router()

router.post(
  '/me',
  middlewareAdapter(checkAuthMiddleware.handle.bind(checkAuthMiddleware)),
  routeAdapter(controller.saveDriver.bind(controller))
)