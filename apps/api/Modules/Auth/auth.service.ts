import { authRepositoryClass } from "./auth.repositary";
import { db } from "../../Infra/Database";
import type { UserCreateInput } from "../../Types/auth.types";
import { AppError, InvalidCredentialsError, UserAlreadyExistsError, UserCreationFailedError } from "../../Infra/Error/errors";
import type { VerificationRepositoryClass } from "../verification/verification.repo";
import { AuthUtils } from "./auth.utils";
import type { OutboxRepository } from "../../Infra/OutBox/outbox.repo";


export class authServiceClass{
  constructor(
    private readonly authRepo: authRepositoryClass,
    private readonly verificationRepo: VerificationRepositoryClass,
    private readonly authUtils: AuthUtils,
    private readonly outbox:OutboxRepository
  ) { }

  register = async (input: UserCreateInput) => {
    const email = input.email.trim().toLowerCase();
    const password = await this.authUtils.hashPassword(input.password)
    return db.transaction(async (tx: any) => {
      const userExist = await this.authRepo.findUserByEmail(
        email,
        tx,
      );

      if (userExist) {
        throw new UserAlreadyExistsError();
      }

      const [newUser] = await this.authRepo.create(
        {
          ...input,
          password,
          email,
          emailVerified: false,
        },
        tx,
      );

      if (!newUser) {
        throw new UserCreationFailedError();
      }

      const verificationToken =
        this.authUtils.generateEmailVerificationToken();

      const tokenExpiry =
        this.authUtils.getVerificationTokenExpiry();

      const tokenHash=this.authUtils.hashToken(verificationToken)

      const [verification] =
        await this.verificationRepo.createVerificationToken(
          {
            userId: newUser.id,
            token: tokenHash,
            expiresAt: tokenExpiry,
          },
          tx,
        );

      if (!verification) {
        throw new AppError("Verification can't be created", 500);
      }

      await this.outbox.create(
        {
          type: "VERIFY_EMAIL",
          payload: {
            userId: newUser.id,
            email: newUser.email,
            token: verificationToken,
            expiresAt: tokenExpiry.toISOString(),
          },
        },
        tx,
      );

      return newUser;
    });
  };

  login = async (INPUT: {
    email: string,
    password:string
  }) => {
    const email = INPUT.email.toLowerCase()
    const input={...INPUT,email}
    if (!input.email) throw new AppError("No email provided", 400)
    if (!input.password) throw new AppError("No password provided", 400)

    const user = await this.authRepo.findUserByEmail(input.email)
    if (!user) throw new AppError("User not found", 404)

    if(!user.emailVerified) throw new AppError("Email not verified",401)

    const password = await this.authUtils.verifyPassword(input.password, user.password)

    if (!password) throw new InvalidCredentialsError()

    const token = this.authUtils.generateJwtToken({
      userId: user.id,
      email:email
    })
    return token
  }

  getMe = async (jwtToken: string) => {
    if (!jwtToken) throw new AppError("JWT token not found", 404)
    const userId = this.authUtils.verifyJwtToken(jwtToken).userId
    if (!userId) throw new AppError("User Id not found", 401)
    if (typeof userId !== "number") {
      throw new AppError("Invalid user ID in token", 401)
    }
    if(Number.isFinite(userId)) throw new AppError("Invalid user id",401)
    const [user] = await this.authRepo.findUserById(Number(userId))
    if (!user) throw new AppError("User not found", 404)

    return user

  }
}t
