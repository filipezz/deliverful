import { uniqueNamesGenerator, Config, adjectives, colors, animals } from 'unique-names-generator'
import { monotonicFactory } from 'ulid'

const ulid = monotonicFactory()
const seed = new Date(2021, 1, 3)

const customConfig: Config = {
  dictionaries: [adjectives, colors, animals ],
  separator: '-',
  length: 3
}

export const str2PascalCaseLimited = (s?: string): string => {
  // empty string
  if (!s){
    return ''
  }

  const toTitleCase = (str: string): string =>
    str.replace(
      /\w\S*/g,
      (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    )

  const special2Space = s.replace(/[^0-9a-z]/gi, ' ')
  return toTitleCase(special2Space)
    .substring(0, 26)
}

export const generateFriendlyName = ():string => uniqueNamesGenerator(customConfig) 

export const generateSortableUID = (timestamp: Date = new Date()) => 
  ulid(Math.abs( (<unknown> timestamp as number ) - (<unknown> seed as number) ))

export const generateSortableFriendlyUID = (name?: string): string => 
  generateSortableUID() 
  + '-' 
  + ( str2PascalCaseLimited(name) || generateFriendlyName() )