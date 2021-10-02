import Faker from 'faker'
import isAfter from 'date-fns/isAfter'
import { SaveWorkPreferencesDTO } from 'deliverful-types/profiles/dtos'
import { WorkAvailability } from 'deliverful-types/profiles/dtos/work-preferences.dto'
import { jobPositionType } from '../../constants/job-position-types'

export const mockSaveWorkPreferencesDTO = (): SaveWorkPreferencesDTO => {
  const jobPositionTypes = Object
    .values(jobPositionType)
    .sort(() => Math.random() > .5 ? 1 : -1)
  return {
    availability: [
      sortWorkAvailabilityTimes({
        startsAt: Faker.date.recent().toLocaleTimeString(),
        endsAt: Faker.date.recent().toLocaleTimeString()
      }),
      ...Array.from({ length: 6 }).map(() => {
        const isAvailable = Math.random() > .5
        if (isAvailable) {
          return sortWorkAvailabilityTimes({
            startsAt: Faker.date.recent().toLocaleTimeString(),
            endsAt: Faker.date.recent().toLocaleTimeString()
          })
        } else {
          return null
        }
      })
    ],
    jobPositionTypes: [jobPositionTypes[0], jobPositionTypes[1]],
    willingToStartAt: Faker.date.recent(),
    workingRadius: (() => {
      const minMiles = Faker.random.number()
      const maxMiles = Faker.random.number({ min: minMiles })
      return [minMiles, maxMiles]
    })()
  }
}

export function sortWorkAvailabilityTimes(workAvailability: WorkAvailability): WorkAvailability {
  let { startsAt, endsAt } = workAvailability

  const helperDate = new Date().toLocaleDateString()
  const startsAtDatetime = new Date(`${helperDate} ${startsAt}`)
  const endsAtDatetime = new Date(`${helperDate} ${endsAt}`)
  if (isAfter(startsAtDatetime, endsAtDatetime)) {
    const oldStartsAt = startsAt
    startsAt = endsAt
    endsAt = oldStartsAt
  }

  return { startsAt, endsAt }
}