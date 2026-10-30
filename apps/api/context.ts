import type { CreateFastifyContextOptions } from '@trpc/server/adapters/fastify';
import { AuthUtils } from './Modules/Auth/auth.utils';
const authUtils=new AuthUtils()
async function verifySessionToken(token?: string) {
  if (!token) return null;
  try {
    return authUtils.verifyJwtToken(token);
  } catch {
    return null;
  }
}

export async function createContext({ req, res }: CreateFastifyContextOptions) {
  const authHeader = req.headers.authorization;
  const bearerToken = authHeader?.split(' ')[1];
  const cookieToken = req.cookies?.session_token;
  const token = bearerToken || cookieToken;

  const user = await verifySessionToken(token)
  
  return {
    req,
    res,
    user
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
