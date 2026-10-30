import { envConfig } from "../config";

type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

export const sendEmail = async (input: SendEmailInput) => {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${envConfig.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: envConfig.RESEND_FROM,
      to: [input.to],
      subject: input.subject,
      html: input.html,
      ...(input.text ? { text: input.text } : {}),
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Resend API error ${response.status}: ${body}`);
  }

  return await response.json();
};

export const sendVerificationEmail = async (input: {
  email: string;
  token: string;
  expiresAt?: string;
}) => {
  const verifyUrl = `${envConfig.APP_URL}/verify-email?token=${encodeURIComponent(input.token)}`;
  const expiry = input.expiresAt ? new Date(input.expiresAt) : null;
  const expiryLine = expiry
    ? `This link expires on ${expiry.toUTCString()}.`
    : "This link will expire in 1 hour.";

  return sendEmail({
    to: input.email,
    subject: "Verify your GoCraft email",
    text: `Verify your email address to activate your GoCraft account.\n\n${verifyUrl}\n\n${expiryLine}\n\nIf you did not create this account, you can safely ignore this email.`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 16px;">
        <h1 style="font-size: 20px; margin: 0 0 8px;">Verify your email</h1>
        <p style="font-size: 14px; color: #555; margin: 0 0 24px;">Welcome to GoCraft! Click the button below to verify your email address and activate your account.</p>
        <a href="${verifyUrl}" style="display: inline-block; background: #111; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-size: 14px;">Verify email</a>
        <p style="font-size: 13px; color: #777; margin: 24px 0 0;">${expiryLine}</p>
        <p style="font-size: 13px; color: #777; margin: 8px 0 0;">If the button does not work, copy and paste this link into your browser:</p>
        <p style="font-size: 12px; color: #999; word-break: break-all; margin: 4px 0 0;">${verifyUrl}</p>
      </div>`,
  });
};
