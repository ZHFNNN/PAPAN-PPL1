import crypto from "node:crypto";

export type MidtransPaymentMethod = "MIDTRANS" | "QRIS" | "BCA" | "BRI" | "MANDIRI";

export type MidtransItemDetail = {
  id: string;
  price: number;
  quantity: number;
  name: string;
};

export type MidtransCustomer = {
  first_name: string;
  last_name?: string;
  email?: string;
  phone?: string;
};

type MidtransTransactionInput = {
  orderId: string;
  grossAmount: number;
  items: MidtransItemDetail[];
  paymentMethod: MidtransPaymentMethod;
  customer?: MidtransCustomer;
  expiryDurationMinutes?: number;
};

type MidtransTransactionResponse = {
  token: string;
  redirect_url: string;
};

function getMidtransServerKey() {
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  if (!serverKey) {
    throw new Error("MIDTRANS_SERVER_KEY belum dikonfigurasi.");
  }

  return serverKey;
}

function getMidtransBaseUrl() {
  return process.env.MIDTRANS_IS_PRODUCTION === "true"
    ? "https://app.midtrans.com"
    : "https://app.sandbox.midtrans.com";
}

function getAuthorizationHeader() {
  const serverKey = getMidtransServerKey();
  return `Basic ${Buffer.from(`${serverKey}:`).toString("base64")}`;
}

export function getMidtransSignatureKey({
  orderId,
  statusCode,
  grossAmount,
}: {
  orderId: string;
  statusCode: string;
  grossAmount: string | number;
}) {
  const serverKey = getMidtransServerKey();
  return crypto
    .createHash("sha512")
    .update(`${orderId}${statusCode}${grossAmount}${serverKey}`)
    .digest("hex");
}

export async function createMidtransSnapTransaction(
  input: MidtransTransactionInput,
): Promise<MidtransTransactionResponse> {
  const response = await fetch(`${getMidtransBaseUrl()}/snap/v1/transactions`, {
    method: "POST",
    headers: {
      Authorization: getAuthorizationHeader(),
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      transaction_details: {
        order_id: input.orderId,
        gross_amount: input.grossAmount,
      },
      item_details: input.items,
      customer_details: input.customer,
      expiry: {
        unit: "minutes",
        duration: input.expiryDurationMinutes ?? 60,
      },
    }),
  });

  const payload = (await response.json().catch(() => null)) as
    | (MidtransTransactionResponse & { error_messages?: string[] })
    | null;

  if (!response.ok || !payload?.token || !payload?.redirect_url) {
    const message =
      payload?.error_messages?.join(", ") ||
      `Midtrans request failed with status ${response.status}`;
    throw new Error(message);
  }

  return {
    token: payload.token,
    redirect_url: payload.redirect_url,
  };
}
