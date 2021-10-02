import './config/env'
import * as functions from 'firebase-functions'
import { authApp, usersApp, profilesApp, driversApp } from './modules'

export const api = {
  auth: functions.https.onRequest(authApp),
  users: functions.https.onRequest(usersApp),
  profiles: functions.https.onRequest(profilesApp),
  drivers: functions.https.onRequest(driversApp)
}
