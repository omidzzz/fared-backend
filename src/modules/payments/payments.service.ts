export async function handleCallback(status: string, authority: string, orderId: string) {
  // Payment verification logic here
  return { redirectUrl: `/order-confirmation/${orderId}` };
}
