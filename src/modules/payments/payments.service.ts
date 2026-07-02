import { env } from "../../config/env";

export function handleCallback(
  status?: string,
  authority?: string,
  orderId?: string
): { redirectUrl: string } {
  console.log(`[PAYMENT CALLBACK] Status: ${status}, Authority: ${authority}, OrderId: ${orderId}`);

  if (status === "OK") {
    return { redirectUrl: `${env.FRONTEND_PAYMENT_SUCCESS_URL}?orderId=${orderId}` };
  }
  return { redirectUrl: `${env.FRONTEND_PAYMENT_FAIL_URL}?orderId=${orderId}` };
}
