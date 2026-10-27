import { authRepositoryClass } from "./auth.repositary";
import { db } from "../../Infra/Database";
import type { UserCreateInput } from "../../Types/auth.types";
import { AppError, UserAlreadyExistsError, UserCreationFailedError } from "../../Infra/Error/errors";
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

  createUser = async (input: UserCreateInput) => {
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
}
