import crypto from "crypto";
import jwt from "jsonwebtoken";

export interface JwtPayload {
  userId: number;
  email: string;
}

export class AuthUtils {
  private readonly jwtSecret = process.env.JWT_SECRET || "fallback_super_secret_key";
  // Keep in sync with the session_token cookie maxAge in auth.routes.ts (7 days)
  // so the cookie never outlives the JWT it carries.
  private readonly jwtExpiresIn = (process.env.JWT_EXPIRES_IN || "7d") as jwt.SignOptions["expiresIn"];

  public generateEmailVerificationToken(): string {
    return crypto.randomBytes(32).toString("hex");
  }

  public getVerificationTokenExpiry(amount = 1, unit: "m" | "h" | "d" = "h"): Date {
    const now = new Date();
    switch (unit) {
      case "m":
        return new Date(now.getTime() + amount * 60 * 1000);
      case "h":
        return new Date(now.getTime() + amount * 60 * 60 * 1000);
      case "d":
        return new Date(now.getTime() + amount * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() + 1 * 60 * 60 * 1000);
    }
  }

  public generateOtp(length = 6): string {
    if (length < 4 || length > 10) {
      throw new Error("OTP length must be between 4 and 10 digits");
    }
    const digits = "0123456789";
    let otp = "";
    for (let i = 0; i < length; i++) {
      const randomIndex = crypto.randomInt(0, digits.length);
      otp += digits[randomIndex];
    }
    return otp;
  }

  public generateJwtToken(payload: JwtPayload): string {
    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.jwtExpiresIn,
    });
  }

  public verifyJwtToken(token: string): JwtPayload {
    return jwt.verify(token, this.jwtSecret) as JwtPayload;
  }

  public async hashPassword(password: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const salt = crypto.randomBytes(16).toString("hex");
      crypto.scrypt(password, salt, 64, (err, derivedKey) => {
        if (err) reject(err);
        resolve(`${salt}:${derivedKey.toString("hex")}`);
      });
    });
  }

  public async verifyPassword(password: string, hash: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const [salt, key] = hash.split(":");
      if (!salt || !key) return resolve(false);
      crypto.scrypt(password, salt, 64, (err, derivedKey) => {
        if (err) reject(err);
        resolve(crypto.timingSafeEqual(Buffer.from(key, "hex"), derivedKey));
      });
    });
  }

  public hashToken(token: string): string {
    return crypto.createHash("sha256").update(token).digest("hex");
  }
}
