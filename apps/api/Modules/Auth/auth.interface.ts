import type { UserResponse } from "./auth.types";

export interface IAuthRepositaryClass{
  isAdmin(userId:string,tx?:any):Promise<boolean>
  findByEmail(email: string): Promise<UserResponse | null>
  
}