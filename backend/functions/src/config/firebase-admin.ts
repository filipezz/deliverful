import * as admin from 'firebase-admin'

const adminApp = admin.initializeApp({
  credential: admin.credential.cert(require('./firebase-adminsdk')),
  databaseURL: process.env['DATABASE_URL']
})

export { adminApp }