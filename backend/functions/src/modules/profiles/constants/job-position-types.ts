import { JobPositionType } from 'deliverful-types/profiles/dtos'

export const jobPositionType: Record<JobPositionType, JobPositionType> = {
  'Full-time': 'Full-time',
  'Part-time': 'Part-time',
  'Split shifts': 'Split shifts',
  Contract: 'Contract',
  Seasonal: 'Seasonal',
  Temporary: 'Temporary'
}