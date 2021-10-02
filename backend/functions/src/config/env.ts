import { config, DotenvConfigOutput } from 'dotenv'

type ProjectId = 'deliverful-dev' | 'deliverful-prod';
type FirebaseConfig = { projectId: ProjectId };

const loadEnv = <Record<ProjectId, () => DotenvConfigOutput>>{
  'deliverful-dev': () => config({ path: '.env.development' }),
  'deliverful-prod': () => config({ path: '.env.production' })
}

const firebaseConfig: FirebaseConfig = JSON.parse(
  process.env['FIREBASE_CONFIG'] as string
)

loadEnv[firebaseConfig.projectId]()