import 'dotenv/config'
import {z} from 'zod'

const config = z.object({
  PORT: z.coerce.number().default(5000),
  DATABASE_URL: z.string(),
  REDIS_URL: z.string(),
  CLOUDINARY_CLOUD_NAME: z.string(),
  CLOUDINARY_API_KEY: z.string(),
  CLOUDINARY_API_SECRET: z.string(),
  // RESEND_API_KEY: z.string(),
  RESEND_FROM: z.string().default("GoCraft <onboarding@resend.dev>"),
  APP_URL: z.string().default("http://localhost:3000"),
})


export const envConfig=config.parse(process.env)
