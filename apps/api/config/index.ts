import 'dotenv/config'
import {z} from 'zod'

const config = z.object({
  PORT: z.number(),
  DATABASE_URL:z.string()
})


export const envConfig=config.parse(process.env)