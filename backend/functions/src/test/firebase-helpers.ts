import dotenv from 'dotenv'
import firebase from 'firebase'
import * as firebaseTesting from '@firebase/rules-unit-testing'
import { AdminAppOptions } from '@firebase/rules-unit-testing/dist/src/api'

dotenv.config({ path: '.env.development' })

let adminApp: firebase.app.App
export function getAdminApp() {
  if (!adminApp) {
    const adminAppOptions: AdminAppOptions = {}
    if (!process.env['FIRESTORE_EMULATOR_HOST']) {
      adminAppOptions.projectId = process.env['PROJECT_ID']
    }

    adminApp = firebaseTesting.initializeAdminApp(adminAppOptions)
  }

  return adminApp
}

export function getFirestore(): FirebaseFirestore.Firestore {
  return (getAdminApp().firestore() as unknown) as FirebaseFirestore.Firestore
}

export function clearFirestoreData() {
  return firebaseTesting.clearFirestoreData({
    projectId: process.env['PROJECT_ID'] as string
  })
}

export async function tearDown() {
  await clearFirestoreData()
  return Promise.all(firebaseTesting.apps().map(app => app.delete()))
}