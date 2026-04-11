export type PaymentProviderId = "sayabayar" | "qrispy";

export function getPaymentProvider(): PaymentProviderId {
  const v = process.env.PAYMENT_PROVIDER?.trim().toLowerCase();
  if (v === "qrispy") return "qrispy";
  return "sayabayar";
}

export function getQrispyBaseUrl(): string {
  return (
    process.env.QRISPY_API_BASE_URL?.trim() || "https://api.qrispy.id"
  ).replace(/\/$/, "");
}
