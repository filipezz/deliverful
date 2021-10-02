import { getFirestore, tearDown } from '../../test/firebase-helpers'
import * as R from 'ramda'
import * as http from '../../helpers/http.helpers'
import * as src from '.'
import { AbstractDTO } from 'deliverful-types/common/dtos'

type ISutTypes = {
  db: FirebaseFirestore.Firestore;
  refs: {
      namespacesRef: FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData>
      profilesRef: FirebaseFirestore.CollectionReference
  }
}

type HasId = {id: string}
type HasName = {name: string}
const create = async <IN extends HasName>(
    ref: FirebaseFirestore.CollectionReference,
    id: string,
    data: IN
    ): Promise<IN & HasId> =>
  {

    await ref.doc(id).set(data)
    const doc = await ref.doc(id).get()
    const uid = id.includes('_')
      ? id.split('_')[0]
      : id
    return {id: uid, ...doc.data()} as (IN & HasId)
  }

function makeSut(): ISutTypes {
  const firestore = getFirestore()
  const namespacesRef = firestore.collection('namespaces')
  const profilesRef = firestore.collection('profiles')
  const firestoreCollectionMap: Record<
    string, FirebaseFirestore.CollectionReference
  > = {
    namespaces: namespacesRef,
    profiles: profilesRef
  }
  jest.spyOn(firestore, 'collection')
    .mockImplementation(
      (collectionPath: string) => firestoreCollectionMap[collectionPath]
    )

  return {
    db: firestore,
    refs: {
      namespacesRef,
      profilesRef
    }
  }
}


type NamespaceRecord = {id: string; name: string;}
type BaseProfileRecord = {id: string; name: string; value?: string; _namespace: string;}
type DiffProfileRecord = {id: string; modifiedOn: string; value?: string; _namespace: string; name?: string}


type NamespaceAndProfileRecords = {
  namespaces: NamespaceRecord[]
  baseProfiles:   BaseProfileRecord[]
  diffProfiles:   DiffProfileRecord[]
  privateProfiles: BaseProfileRecord[]
}



async function makeRecords(sut: ISutTypes): Promise<NamespaceAndProfileRecords>{

  const namespaces = await Promise.all(
      [{name: '0', private: true },
       {name: '1', pricate: false}]
        .map( data => create(sut.refs.namespacesRef, data.name, data) )
  )



  const baseProfiles = await Promise.all(
      [
       {name: '0', _namespace: ''},
       {name: '1', value: '1', _namespace: ''},
       {name: 'Shared', value: 'Shared', _namespace:''}
      ].map( data => create(sut.refs.profilesRef, data.name, data) )
  )

  const diffProfiles = await Promise.all(
      [
       {name: '0_0', _namespace: '0', modifiedOn: '0'},
       {name: '1_1', _namespace: '1', value: '11', modifiedOn: '1'}
      ].map( data => create(sut.refs.profilesRef, data.name, data) )
  )

  const privateProfiles = await Promise.all(
      [
       {name: 'private_0', value: 'secret', _namespace: '0'}
      ].map( data => create(sut.refs.profilesRef, data.name, data) )
  )

  return { namespaces, baseProfiles, diffProfiles, privateProfiles }
}

describe('Namespaces Firestore Middleware', () => {

  let sut: ISutTypes
  let records: NamespaceAndProfileRecords

  beforeEach(async () => {
    sut = makeSut()
    records = await makeRecords(sut)
  })

  afterEach(async () => {
    await tearDown()
  })

  describe('_getDbCollectionRef()', () => {

    it('should receive db and collectionName and return a ref to that collection', async () => {
      expect(src._getDbCollectionRef(sut.db, 'namespaces')).toBe(sut.refs.namespacesRef)
      expect(src._getDbCollectionRef(sut.db, 'profiles')).toBe(sut.refs.profilesRef)
    })

  })

  describe('_resourceExistsInAnyNamespace()', () => {

    it('True: Find a resource that is hidden in a private namespace', async () => {
      expect(await src._resourceExistsInAnyNamespace(sut.refs.profilesRef, 'private'))
        .toEqual(true)
    })

    it('False: dont find a resource that don\'t exists anywhere', async () => {
      expect(await src._resourceExistsInAnyNamespace(sut.refs.profilesRef, 'liberty'))
        .toEqual(false)
    })
  })


  describe('get()', () => {

    describe('provide access', () => {

      it('From namespace Shared, get a Shared Profile that was NOT changed on any namespaces', async () => {
        expect(await src.get(sut.db, '', 'profiles', records.baseProfiles[2].id))
          .toEqual(records.baseProfiles[2])
      })

      it('From namespace Shared, get a Shared Profile that was Diffed in a namespace', async () => {
        expect(await src.get(sut.db, '', 'profiles', records.baseProfiles[0].id))
          .toEqual(records.baseProfiles[0])
      })


      it('From namespace A, get a Shared Profile that was NOT Diffed', async () => {
        expect(await src.get(sut.db, '', 'profiles', records.baseProfiles[2].id))
          .toEqual(records.baseProfiles[2])
      })

      it('From namespace A, get a Shared Profile that was Diffed, adding a new attribute', async () => {
        expect(await src.get(sut.db, records.namespaces[0].id, 'profiles', records.baseProfiles[0].id))
          .toEqual({...records.baseProfiles[0], ...records.diffProfiles[0]})
      })

      it('From namespace B, get a Shared Profile that was Diffed, changing the value of a existent attribute and adding a new attribute', async () => {
        expect(await src.get(sut.db, records.namespaces[1].id, 'profiles', records.baseProfiles[1].id))
          .toEqual({...records.baseProfiles[1], ...records.diffProfiles[1]})
      })

      it('From namespace A, get a user that is private to this namespace,', async () => {
        expect(await src.get(sut.db, records.namespaces[0].id, 'profiles', records.privateProfiles[0].id))
          .toEqual(records.privateProfiles[0])
      })
    })

    describe('deny access', () => {

      it('From namespace B, it should be impossible to access a resource that is private to namespace A', async () => {

        const prom = src.get(sut.db, records.namespaces[1].id, 'profiles', records.privateProfiles[0].id)

        await expect(prom)
          .rejects
          .toBeInstanceOf(http.HttpJsonErrorResponse)

        await expect(prom)
          .rejects
          .toEqual(expect.objectContaining({httpStatus: http.HttpErrorCode.forbiddenError}))
      })

      it('From namespace Shared, it should be impossible to access a resource that is private to namespace A', async () => {

        const prom = src.get(sut.db, '', 'profiles', records.privateProfiles[0].id)

        await expect(prom)
          .rejects
          .toBeInstanceOf(http.HttpJsonErrorResponse)

        await expect(prom)
          .rejects
          .toEqual(expect.objectContaining({httpStatus: http.HttpErrorCode.forbiddenError}))
      })


      it('From namespace B, it should be impossible to access a resource that is private to namespace A', async () => {

        const prom = src.get(sut.db, records.namespaces[1].id, 'profiles', records.privateProfiles[0].id)

        await expect(prom)
          .rejects
          .toBeInstanceOf(http.HttpJsonErrorResponse)

        await expect(prom)
          .rejects
          .toEqual(expect.objectContaining({httpStatus: http.HttpErrorCode.forbiddenError}))
      })


      it('Return error when providing a ID that is not present on the collection', async () => {

        const prom = src.get(sut.db, '', 'profiles', 'liberty')

        await expect(prom)
          .rejects
          .toBeInstanceOf(http.HttpJsonErrorResponse)

        await expect(prom)
          .rejects
          .toEqual(expect.objectContaining({httpStatus: http.HttpErrorCode.notFoundError}))
      })


    })
  })

  describe('list()', () => {
    
    it('from namespace Shared, list only entries that are globally shared', async () => {
      expect(await src.list(sut.db, '', 'profiles'))
        .toEqual(records.baseProfiles)
    })

    it('from namespace A, list profiles', async () => {
      expect(await src.list(sut.db, records.namespaces[0].id,'profiles'))
        .toEqual([
          records.baseProfiles[1],
          records.baseProfiles[2],
          {...records.baseProfiles[0], ...records.diffProfiles[0]},
          records.privateProfiles[0]
        ])
    })

    it('from namespace B, list profiles', async () => {
      expect(await src.list(sut.db, records.namespaces[1].id,'profiles'))
        .toEqual([
          records.baseProfiles[0],
          records.baseProfiles[2],
          {...records.baseProfiles[1], ...records.diffProfiles[1]}
        ])
    })

  })

  describe('create()', () => {

    it('from namespace Shared, create new Profiles', async () => {

      const newProfilesRecs = 
          [
            {name: 's0', _namespace: ''},
            {value: 's1'}
          ]

      const newProfilesDocsProms = newProfilesRecs
          .map(async (rec) =>  await src.create(sut.db, '', 'profiles', rec) )
      const newProfilesDocs = await Promise.all(newProfilesDocsProms)


      expect(newProfilesDocs[0].id.toUpperCase()).toContain(newProfilesRecs[0].name?.toUpperCase())
      expect(newProfilesDocs[0].name).toEqual(newProfilesRecs[0].name)
      expect(newProfilesDocs[1].value).toEqual(newProfilesRecs[1].value)
    })

    it('from namespace B, create new public profiles', async () => {

      const newProfilesRecs = 
          [
            {name: 'dog0', _namespace: records.namespaces[1].id},
            {value: 'dog1'}
          ]

      const newProfilesDocsProms = newProfilesRecs
          .map(async (rec) =>  await src.create(sut.db, records.namespaces[1].id, 'profiles', rec) )
      const newProfilesDocs = await Promise.all(newProfilesDocsProms)

      expect(newProfilesDocs[0].id.toUpperCase()).toContain(newProfilesRecs[0].name?.toUpperCase())
      expect(newProfilesDocs[0].name).toEqual(newProfilesRecs[0].name)
      expect(newProfilesDocs[1].value).toEqual(newProfilesRecs[1].value)
    })

    it('from namespace A, create new private profiles', async () => {

      const newProfilesRecs = 
          [
            {name: 'cat0', _namespace: records.namespaces[0].id},
            {value: 'cat1'}
          ]

      const newProfilesDocsProms = newProfilesRecs
          .map(async (rec) =>  await src.create(sut.db, records.namespaces[0].id, 'profiles', rec) )
      const newProfilesDocs = await Promise.all(newProfilesDocsProms)

      expect(newProfilesDocs[0].id.toUpperCase()).toContain(newProfilesRecs[0].name?.toUpperCase())
      expect(newProfilesDocs[0].name).toEqual(newProfilesRecs[0].name)
      expect(newProfilesDocs[1].value).toEqual(newProfilesRecs[1].value)
    })
  })

  describe('update()', () => {

    type ObjWithValue = AbstractDTO & { value: string }

    it('from namespace Shared, update a public profile', async () => {

      const obj = { id: '0', value: 'shhh' }
      const updated = await src.update<ObjWithValue>(sut.db, '', 'profiles', obj)

      expect(updated).toEqual({
        _namespace: '',
        id: '0',
        name: '0',
        value: 'shhh'
     })
    })

    it('from namespace B, update a public profile only for the namespace B', async () => {
      const obj = { id: '0', value: 'a6ab' }
      const updated = await src.update<ObjWithValue>(sut.db, records.namespaces[1].id, 'profiles', obj)
      const unchangedShared = await src.get(sut.db, '', 'profiles', '0')

      expect(updated).toEqual({
        _namespace: '1',
        id: '0',
        name: '0',
        value: 'a6ab'
      })

      expect(unchangedShared).toEqual({
        _namespace: '',
        id: '0',
        name: '0'
      })
    
    })

    it('from namespace A, update a Private profile', async () => {


      const obj = { id: 'private_0', value: 'a7x', color: 'missing_donkey'}
      const updated = await src.update<ObjWithValue>(sut.db, records.namespaces[0].id, 'profiles', obj)

      expect(updated).toEqual({
        _namespace: '0',
        id: 'private_0',
        name: 'private_0',
        value: 'a7x',
        color: 'missing_donkey'
      })
      })

  })

  describe('Handle Dates (Convert Firestore Date to JS Date)', () => {

    const fakeDate = new Date(2037, 1, 2, 3, 4, 5, 6)
    const fakeDateAttrs = { 
      createdAt: fakeDate, 
      fallenAt: fakeDate, 
      nat: fakeDate, 
      birthDate: fakeDate, 
      upDate: fakeDate, 
      update: fakeDate 
    }
    const fakeDateAttrsNested = {
      ...fakeDateAttrs,
      nest0: {
        ...fakeDateAttrs,
        nest00: fakeDateAttrs
      },
      nest1: {
        ...fakeDateAttrs,
        nest11: fakeDateAttrs
      }
    }

    let doc: typeof fakeDateAttrsNested
    let docs: typeof fakeDateAttrsNested[]
    const areAllFakeDate = R.all(R.equals(fakeDate))

    beforeAll(async () => {
      doc = await src.create(sut.db, '', 'profiles', fakeDateAttrsNested )
      docs = [doc, doc.nest0, doc.nest1, doc.nest0.nest00 ] as typeof fakeDateAttrsNested[] // type not accurate, but will do for the tests
    })

    describe('🐦 Unested (props on json root)', () => {

      it('Convert props with \'At\' suffix', () => {
        const values = R.props(['createdAt', 'fallenAt'], doc) as Date[]
        expect(areAllFakeDate(values)).toBeTruthy()
      })

      it('Convert props with \'Date\' suffix', () => {
        const values = R.props(['birthDate', 'upDate'], doc) as Date[]
        expect(areAllFakeDate(values)).toBeTruthy()
      })

      it('Should not convert props with misspeled suffix case', () => {
          const values = R.props(['nat', 'update'], doc)
          expect(values).not.toContainEqual(fakeDate)
      })

    })

    describe('🐣 Nested (props on json root)', () => {

      it('Convert props with \'At\' suffix', () => {
        const props = ['createdAt', 'fallenAt']
        const values = R.flatten(R.map(R.props(props), docs) as unknown as Date[])
        expect(areAllFakeDate(values)).toBeTruthy()
      })


      it('Convert props with \'Date\' suffix', () => {
        const props = ['birthDate', 'upDate']
        const values = R.flatten(R.map(R.props(props), docs) as unknown as Date[])
        expect(areAllFakeDate(values)).toBeTruthy()
      })


      it('Should not Convert props, with misspeled suffix case', () => {
        const props = ['nat', 'update']
        const values = R.flatten(R.map(R.props(props), docs) as unknown as Date[])
        expect(values).not.toContainEqual(fakeDate)
      })

    })

  })

})