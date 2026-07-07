import { env } from "../config/env";

/**
 * Send an SMS via Kavenegar (or log to console in dev mode).
 */
export async function sendSMS(phone: string, message: string): Promise<void> {
  if (!env.KAVENEGAR_API_KEY || !env.KAVENEGAR_SENDER) {
    return;
  }

  try {
    const axios = (await import("axios")).default;
    await axios.get(`https://api.kavenegar.com/v1/${env.KAVENEGAR_API_KEY}/sms/send.json`, {
      params: {
        receptor: phone,
        sender: env.KAVENEGAR_SENDER,
        message,
      },
    });
  } catch {
    // Don't throw — OTP should still work in dev mode
  }
}

/**
 * Send an OTP message in Farsi.
 */
export async function sendOTPMessage(phone: string, code: string): Promise<void> {
  const message = `کد تایید شما در فارد: ${code}\nلغو ۱۱`;
  await sendSMS(phone, message);
}