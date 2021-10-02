import * as R from 'ramda'
import * as D from 'deep-object-diff'
import * as http from '../../helpers/http.helpers'
import { parseFirestoreTimestamp } from '../../helpers/firebase.helpers'
import { generateSortableFriendlyUID }  from '../../helpers/friendly.uid.generator'
import { CollectionName, Namespace } from 'deliverful-types/database/'
import { AbstractDTO } from 'deliverful-types/common/dtos'


type NamespacedDocRes = { _namespace: string, id: string }

export const _getDbCollectionRef = (
  db: FirebaseFirestore.Firestore,
  collectionName: CollectionName )
  : FirebaseFirestore.CollectionReference => db.collection(collectionName)


export const _resourceExistsInAnyNamespace = async (
  collection: FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData>,
  id: string
  )  =>
    (await collection
      // '___name___' = firestore id
      .where('__name__', '>', id) // a private resource will append '_namespaceId' to the id. So it will be greather than the id alone
      .where('__name__', '<', id + 'z') // '_' (divisor betwen id and namespace) is lower than 'z'
      .get()).size > 0


export const _getNamespace = async (
    db: FirebaseFirestore.Firestore,
    id: string
    ): Promise<Namespace> => get(db, id, 'namespaces', id)

export const _filterDiffsAndReturnBaseIds = (
      namespaceId: string, 
      docs: FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>[]
      ): string[] => {
  
  if (namespaceId === ''){
    return []
  }

  return docs
    .filter( (doc) => {
      const namespacedDoc = doc
      return namespacedDoc.id.includes('_')
    })
    .map( doc => doc.id.split('_')[0] )
}

export const _deepParseFirestoreTimestamps = <T extends object>(obj: T) => {


  const isKeyAnObject = (keyName: string) => R.propIs(Object, keyName, obj)
  const hasDateSuffix = (s: string) => R.endsWith('At', s) || R.endsWith('Date', s)
  const getProp = R.prop(R.__, obj)

  const objectKeys = R.filter(isKeyAnObject, R.keys(obj) as string[]) as (keyof T)[] 
  const dateKeys = R.filter(hasDateSuffix, objectKeys as string[]) as (keyof T)[]
  const recursionKeys = R.reject(hasDateSuffix, objectKeys as string[]) as (keyof T)[]

  const recursionObjects = R.map(getProp, recursionKeys)

  // destructive insecure
  parseFirestoreTimestamp(obj, dateKeys as (keyof T)[])
  //@ts-ignore
  R.map(_deepParseFirestoreTimestamps, recursionObjects)
}

export const tryGet = async <T extends object>(
      db: FirebaseFirestore.Firestore,
      namespaceId: string,
      collectionName: CollectionName,
      id: string
      ): Promise<(T & NamespacedDocRes) | null>  => {
  try {
    return await get<T>(db, namespaceId, collectionName, id)
  }
  catch {
    return null
  }
}

export const get = async <T extends object>(
    db: FirebaseFirestore.Firestore,
    namespaceId: string,
    collectionName: CollectionName,
    id: string
    ): Promise<T & NamespacedDocRes> => {

  const collection = _getDbCollectionRef(db, collectionName)

  const baseRes = collection.doc(id).get()
  const diffRes = namespaceId
    ? collection.doc(id + '_' + namespaceId).get()
    : Promise.resolve({
      data: () => { return undefined }
    })

  const base = (await baseRes).data()
  const diff = (await diffRes).data()

  if (!base && !diff){

    if (await _resourceExistsInAnyNamespace(collection, id)){
      throw new http.HttpJsonErrorResponse(
        'Access Denied',
        'This resource is private to a organization that you are not part of.',
        undefined,
        http.HttpErrorCode.forbiddenError)
    }
    throw new http.HttpJsonErrorResponse(
      'Resource Not Found',
      'There\'s no resource with this id on our system',
      undefined,
      http.HttpErrorCode.notFoundError)
  }

  const toMerge = ([{id}, base, diff]
    .filter( (x) => undefined ?? x )) as Partial<T>[]

    // unsafe/destructive
    const dateFixed = R.mergeAll(toMerge)
    _deepParseFirestoreTimestamps(dateFixed)

    //@ts-ignore
    return R.mergeAll(dateFixed) 
  }

export const list = async <T extends object>(
      db: FirebaseFirestore.Firestore,
      namespaceId: string,
      collectionName: CollectionName
      ): Promise<Array<T & NamespacedDocRes>> => {

  const collection = _getDbCollectionRef(db, collectionName)
 
  const rawList = (await collection
    .where('_namespace', 'in',  ['', namespaceId])
    .get()).docs

  const diffedsIds = _filterDiffsAndReturnBaseIds(namespaceId, rawList)
  const diffedsProms = diffedsIds.map(id => get(db, namespaceId, collectionName, id))

  const base = rawList
    .filter( doc => !doc.id.includes('_'))
    .filter( doc => !diffedsIds.includes(doc.id) )
    .map( doc => {
      return {
        id: doc.id,
        ...doc.data()
      }
    })

    const diffeds = await Promise.all(diffedsProms)
    //@ts-ignore
    return [].concat(base).concat(diffeds)
  }



export const createOrUpdate = async <T extends AbstractDTO>(
      db: FirebaseFirestore.Firestore,
      namespaceId: string,
      collectionName: CollectionName,
      object: T
      ): Promise<T & NamespacedDocRes> => {
  
  // If object contains ID, it is a CREATE
  // else, it is a UPDATE
  const baseProm = object.id
    ? tryGet(db, '', collectionName, object.id)
    : Promise.resolve(null)

  const objectId = object.id
    ? object.id
    : generateSortableFriendlyUID(object.name)

  const collection = _getDbCollectionRef(db, collectionName)

  const namespaceIdWhereDocWillBeStored = (
    namespaceId !== '' 
    &&  (object.id                                            // Updates will always be written on their namespaces
        || (await _getNamespace(db, namespaceId)).isPrivate)) // Private updates and creates too
         
      ? namespaceId
      : ''

  const maybeNamespaceSuffix = namespaceIdWhereDocWillBeStored
    ? '_' + namespaceId // CREATE
    : '' 
  
  const base = await baseProm || {}

  const data = namespaceIdWhereDocWillBeStored === ''
    ? object
    : R.mergeAll([ D.addedDiff(base, object), D.updatedDiff(base, object) ])

  await collection.doc(objectId + maybeNamespaceSuffix).set(
    R.mergeAll([
      data,
      { _namespace: namespaceIdWhereDocWillBeStored }
    ]),
    { merge: true}
  )

  return await get(db, namespaceId, collectionName, objectId)
}

export const create = createOrUpdate
export const update = createOrUpdate
