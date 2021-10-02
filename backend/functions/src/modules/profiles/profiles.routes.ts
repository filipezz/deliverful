import { celebrate, Joi, Segments } from 'celebrate'
import { Router } from 'express'
import { routeAdapter, middlewareAdapter } from '../../helpers/express.adapters'
import { makeCheckAuthMiddleware } from '../auth/auth.factory'
import { makeProfilesController } from './profiles.factory'
import { jobPositionType } from './constants/job-position-types'

const controller = makeProfilesController()
const checkAuthMiddleware = makeCheckAuthMiddleware()

export const router = Router()

router.route('/me')
  .get(
    middlewareAdapter(checkAuthMiddleware.handle.bind(checkAuthMiddleware)),
    routeAdapter(controller.getProfile.bind(controller))
  )
  .post(
    celebrate({
    [Segments.BODY]: {
      name: Joi.string(),
      email: Joi.string().email().optional(),
      phone: Joi.string().default(null),
      picture: Joi.string(),
      address: {
        line1: Joi.string(),
        line2: Joi.string(),
        city: Joi.string(),
        state: Joi.string(),
        postalCode: Joi.string(),
        country: Joi.string()
      }
    }
  }),
    middlewareAdapter(checkAuthMiddleware.handle.bind(checkAuthMiddleware)),
    routeAdapter(controller.saveProfile.bind(controller))
  )

router.post(
  '/me/work-preferences',
  celebrate({
    [Segments.BODY]: {
      willingToStartAt: Joi.date(),
      availability: Joi.array().items(Joi.object({
        startsAt: Joi.string().required(),
        endsAt: Joi.string().required()
      }).allow(null)),
      jobPositionTypes: Joi.array().items(Joi.string().valid(...Object.keys(jobPositionType))),
      workingRadius: Joi.array().items(Joi.number())
    }
  }),
  middlewareAdapter(checkAuthMiddleware.handle.bind(checkAuthMiddleware)),
  routeAdapter(controller.saveWorkPreferences.bind(controller))
)

router.post(
  '/me/questionnaire',
  middlewareAdapter(checkAuthMiddleware.handle.bind(checkAuthMiddleware)),
  routeAdapter(controller.saveQuestionnaire.bind(controller))
)