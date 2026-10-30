import 'dotenv/config'
import {z} from 'zod'

const config = z.object({
  PORT: z.string(),
  DATABASE_URL: z.string(),
  REDIS_URL: z.string(),
  CLOUDINARY_CLOUD_NAME: z.string(),
  CLOUDINARY_API_KEY: z.string(),
  CLOUDINARY_API_SECRET:z.string()
})


export const envConfig=config.parse(process.env)
