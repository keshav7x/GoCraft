import { authRepositoryClass } from "./auth.repositary";
import { db } from "../../Infra/Database";
import type { UserCreateInput } from "../../Types/auth.types";
import { AppError, InvalidCredentialsError, UserAlreadyExistsError, UserCreationFailedError } from "../../Infra/Error/errors";
import { VerificationRepositoryClass } from "../verification/verification.repo";
import { AuthUtils } from "./auth.utils";
import { OutboxRepository } from "../../Infra/OutBox/outbox.repo";


export class authServiceClass {
  private authRepo = new authRepositoryClass()
  private verificationRepo = new VerificationRepositoryClass()
  private authUtils = new AuthUtils()
  private outbox = new OutboxRepository()

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

      const tokenHash = this.authUtils.hashToken(verificationToken)

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
            token: tokenHash,
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
    password: string
  }) => {
    const email = INPUT.email.toLowerCase()
    const input = { ...INPUT, email }
    if (!input.email) throw new AppError("No email provided", 400)
    if (!input.password) throw new AppError("No password provided", 400)

    const user = await this.authRepo.findUserByEmail(input.email)
    if (!user) throw new AppError("User not found", 404)

    if (!user.emailVerified) throw new AppError("Email not verified", 401)

    const password = await this.authUtils.verifyPassword(input.password, user.password)

    if (!password) throw new InvalidCredentialsError()

    const token = this.authUtils.generateJwtToken({
      userId: user.id,
      email: email
    })
    return {
      user,
      token
    }
  }

  getMe = async (userId: number) => {
    return await this.authRepo.findUserById(userId)
  }
}