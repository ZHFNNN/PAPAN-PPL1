import crypto from "node:crypto";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getMidtransSignatureKey } from "@/lib/midtrans";

/**
 * Whitebox test untuk getMidtransSignatureKey.
 * Fungsi ini menghasilkan hash SHA-512 dari order_id + status_code + gross_amount + server_key.
 * Kita pakai server key dummy untuk memastikan deterministik dan tidak menyentuh secret asli.
 */

const DUMMY_SERVER_KEY = "SB-Mid-server-DUMMYKEY";

describe("getMidtransSignatureKey", () => {
  const ORIGINAL = process.env.MIDTRANS_SERVER_KEY;

  beforeEach(() => {
    process.env.MIDTRANS_SERVER_KEY = DUMMY_SERVER_KEY;
  });

  afterEach(() => {
    process.env.MIDTRANS_SERVER_KEY = ORIGINAL;
  });

  it("throws when MIDTRANS_SERVER_KEY is not set", () => {
    delete process.env.MIDTRANS_SERVER_KEY;
    expect(() =>
      getMidtransSignatureKey({
        orderId: "ORDER-1",
        statusCode: "200",
        grossAmount: "10000",
      }),
    ).toThrowError(/MIDTRANS_SERVER_KEY/);
  });

  it("produces SHA-512 hex of concatenated fields", () => {
    const orderId = "ORDER-123";
    const statusCode = "200";
    const grossAmount = "100000";
    const expected = crypto
      .createHash("sha512")
      .update(`${orderId}${statusCode}${grossAmount}${DUMMY_SERVER_KEY}`)
      .digest("hex");

    expect(
      getMidtransSignatureKey({ orderId, statusCode, grossAmount }),
    ).toBe(expected);
  });

  it("is deterministic for identical inputs", () => {
    const a = getMidtransSignatureKey({
      orderId: "X",
      statusCode: "200",
      grossAmount: "1000",
    });
    const b = getMidtransSignatureKey({
      orderId: "X",
      statusCode: "200",
      grossAmount: "1000",
    });
    expect(a).toBe(b);
    expect(a).toHaveLength(128); // SHA-512 hex = 128 chars
  });

  it("accepts grossAmount as number and produces the same hash as its string form", () => {
    const asNumber = getMidtransSignatureKey({
      orderId: "X",
      statusCode: "200",
      grossAmount: 1000,
    });
    const asString = getMidtransSignatureKey({
      orderId: "X",
      statusCode: "200",
      grossAmount: "1000",
    });
    expect(asNumber).toBe(asString);
  });

  it("changes when any input changes", () => {
    const base = getMidtransSignatureKey({
      orderId: "X",
      statusCode: "200",
      grossAmount: "1000",
    });
    const diffOrder = getMidtransSignatureKey({
      orderId: "Y",
      statusCode: "200",
      grossAmount: "1000",
    });
    const diffStatus = getMidtransSignatureKey({
      orderId: "X",
      statusCode: "201",
      grossAmount: "1000",
    });
    const diffAmount = getMidtransSignatureKey({
      orderId: "X",
      statusCode: "200",
      grossAmount: "2000",
    });
    expect(new Set([base, diffOrder, diffStatus, diffAmount]).size).toBe(4);
  });
});
