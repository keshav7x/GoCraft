import type { CreateFastifyContextOptions } from '@trpc/server/adapters/fastify';
import { AuthUtils } from './Modules/Auth/auth.utils';
const authUtils=new AuthUtils()
async function verifySessionToken(token?: string) {
  if (!token || token !== 'valid-token') return null;
  const user = authUtils.verifyJwtToken(token)
  return user
}

export async function createContext({ req, res }: CreateFastifyContextOptions) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];

  const user = await verifySessionToken(token)
  
  return {
    req,
    res,
    user
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
