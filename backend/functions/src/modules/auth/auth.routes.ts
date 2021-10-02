import { Router } from 'express'
import { celebrate, Segments, Joi } from 'celebrate'
import { middlewareAdapter, routeAdapter } from '../../helpers/express.adapters'
import { makeAuthController, makeCheckAuthMiddleware } from '../auth/auth.factory'


const controller = makeAuthController()
const checkAuthMiddleware = makeCheckAuthMiddleware()

export const router = Router()

router.post(
  '/signin',
  celebrate({
    [Segments.BODY]: {
      email: Joi.string().email().required(),
      password: Joi.string().required()
    }
  }),
  routeAdapter(controller.signInWithEmailAndPassword.bind(controller))
)

router.post(
  '/signout',
  middlewareAdapter(checkAuthMiddleware.handle.bind(checkAuthMiddleware)),
  routeAdapter(controller.signOut.bind(controller))
)

router.post(
  '/register',
  celebrate({
    [Segments.BODY]: {
      email: Joi.string().email().required(),
      password: Joi.string().required(),
      profile: {
        name: Joi.string(),
        email: Joi.string().email().optional(),
        phone: Joi.string().default(null),
        picture: Joi.string()
      }
    }
  }),
  routeAdapter(controller.register.bind(controller))
)

export default router