import { Router } from 'express'
import { routeAdapter, middlewareAdapter } from '../../helpers/express.adapters'
import { makeCheckAuthMiddleware } from '../auth/auth.factory'
import { makeUsersController } from './users.factory'
import { adminApp } from '../../config/firebase-admin'

const controller = makeUsersController()
const checkAuthMiddleware = makeCheckAuthMiddleware()

export const router = Router()

router.get(
  '/me',
  middlewareAdapter(checkAuthMiddleware.handle.bind(checkAuthMiddleware)),
  routeAdapter(controller.getUser.bind(controller))
)

router.post(
  '/me/argyle',
  middlewareAdapter(checkAuthMiddleware.handle.bind(checkAuthMiddleware)),
  routeAdapter(controller.saveArgyleUser.bind(controller))
)

router.post(
  '/me/argyle/accounts',
  middlewareAdapter(checkAuthMiddleware.handle.bind(checkAuthMiddleware)),
  routeAdapter(controller.saveArgyleUserAccount.bind(controller))
)

router.post(
  '/me/argyle/refresh-token',
  middlewareAdapter(checkAuthMiddleware.handle.bind(checkAuthMiddleware)),
  routeAdapter(controller.refreshArgyleUserToken.bind(controller))
)

router.get(
  '/argyle-data',
  async (req, res) => {
    const userId = req.query.userId as string
    const argyleRef = adminApp.firestore().collection('argyle')
    let docIds: string[] = []
    if (userId) {
      docIds = [userId]
    } else {
      const argyleDocs = await argyleRef.listDocuments()
      docIds = await Promise.all(argyleDocs.map(async item => (await item.get()).id))
    }
    const data = await Promise.all(docIds.map(async docId => {
      // argyle user-id
      const docRef = argyleRef.doc(docId)

      // argyle resources: activities, documents, employments, profiles, reputations
      const docColletionIds = (await docRef.listCollections()).map(item => item.id)

      // argyle dumped data by resource
      const docCollectionDocData = await Promise.all(docColletionIds.map(async collectionId => {
        return {
          collectionId,
          ...(await docRef.collection(collectionId).get()).docs.map(item => ({ id: item.id, ...item.data() }))
        }
      }))
      return docCollectionDocData
    }))
    const formatedData = data.reduce((docAcc, docItem, idx) => {
      const docId = docIds[idx]
      return {
        ...docAcc,
        [docId]: docItem.reduce((collectionAcc, collectionDocItem: any) => {
          const itemIdxs = Object.keys(collectionDocItem).filter(key => /^\d+$/.test(key))
          const docItems = itemIdxs.reduce((itemAcc, itemIdx) => {
            return {
              ...itemAcc,
              [collectionDocItem[itemIdx].id]: collectionDocItem[itemIdx]
            }
          }, {} as Record<string, any>)
          return {
            ...collectionAcc,
            [collectionDocItem.collectionId]: docItems
          }
        }, {} as Record<string, any>)
      }
    }, {} as Record<string, any>)
    res.json(formatedData)
  }
)