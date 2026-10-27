import crypto from "crypto";
import jwt from "jsonwebtoken";
import type { Response } from "express";

export interface JwtPayload {
  userId: number;
  email: string;
}

export class AuthUtils {
  private readonly jwtSecret = process.env.JWT_SECRET || "fallback_super_secret_key";
  private readonly jwtExpiresIn = (process.env.JWT_EXPIRES_IN || "1d") as jwt.SignOptions["expiresIn"];
  private readonly cookieName = process.env.AUTH_COOKIE_NAME || "auth_token";

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

  public assignAuthCookie(res: Response, token: string): void {
    const isProduction = process.env.NODE_ENV === "production";
    const oneDayInMs = 24 * 60 * 60 * 1000;

    res.cookie(this.cookieName, token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "strict" : "lax",
      maxAge: oneDayInMs,
    });
  }

  public clearAuthCookie(res: Response): void {
    res.clearCookie(this.cookieName);
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
