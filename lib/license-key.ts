/**
 * MT UniPOS — Offline License Key System
 * ─────────────────────────────────────────────────────────────────────────────
 * Format: UNIPOS-V1.[base64url_payload].[base64url_hmac]
 *
 * Payload (JSON stringified then base64url encoded):
 * {
 *   tenant: Tenant,                  // full tenant object
 *   ownerEmail: string,              // owner email strict binding
 *   connectivityPlan: string,        // "offline-only" | "online-only" | "hybrid"
 *   expiresAt: string,               // YYYY-MM-DD or "LIFETIME"
 *   issuedAt: string,                // ISO date
 *   issuedFor: string,               // tenant ID
 *   durationLabel?: string,          // human readable label
 * }
 *
 * Security: HMAC-SHA256 with APP_SECRET.
 * Agar payload tamper ho to signature mismatch → key reject.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const APP_SECRET = "MT-UNIPOS-OFFLINE-KEY-SECRET-2026-v1";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function base64urlEncode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64urlDecode(str: string): Uint8Array {
  const padded = str.replace(/-/g, "+").replace(/_/g, "/");
  const padding = (4 - (padded.length % 4)) % 4;
  const base64 = padded + "=".repeat(padding);
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function getHmacKey(): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    "raw",
    enc.encode(APP_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

async function signPayload(payloadStr: string): Promise<string> {
  const key = await getHmacKey();
  const enc = new TextEncoder();
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(payloadStr));
  return base64urlEncode(sig);
}

async function verifySignature(payloadStr: string, sigB64: string): Promise<boolean> {
  try {
    const key = await getHmacKey();
    const enc = new TextEncoder();
    const sigBytes = base64urlDecode(sigB64);
    return await crypto.subtle.verify("HMAC", key, sigBytes.buffer as ArrayBuffer, enc.encode(payloadStr));
  } catch {
    return false;
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export interface LicensePayload {
  tenant: Record<string, unknown>;
  ownerEmail: string;
  connectivityPlan: "offline-only" | "online-only" | "hybrid";
  expiresAt: string; // ISO date YYYY-MM-DD or "LIFETIME"
  issuedAt: string;
  issuedFor: string;
  durationLabel?: string;
}

/**
 * Tenant object, owner Email, duration (days or -1 for lifetime), aur plan se license key generate karo.
 */
export async function generateLicenseKey(
  tenant: Record<string, unknown>,
  ownerEmail?: string,
  durationDays: number = 30, // -1 means Lifetime, or number of days
  connectivityPlan: "offline-only" | "online-only" | "hybrid" = "hybrid",
  durationLabel?: string
): Promise<string> {
  const targetEmail = ownerEmail || (tenant.email as string) || "";

  let expiresAtStr = "LIFETIME";
  if (durationDays > 0) {
    const expDate = new Date();
    expDate.setDate(expDate.getDate() + durationDays);
    expiresAtStr = expDate.toISOString().split("T")[0];
  }

  const payload: LicensePayload = {
    tenant: {
      ...tenant,
      connectivityPlan,
      licenseExpiresAt: expiresAtStr,
    },
    ownerEmail: targetEmail.toLowerCase().trim(),
    connectivityPlan,
    expiresAt: expiresAtStr,
    issuedAt: new Date().toISOString().split("T")[0],
    issuedFor: (tenant.id as string) || "UNKNOWN",
    durationLabel: durationLabel || (durationDays === -1 ? "Lifetime" : `${durationDays} Days`),
  };

  const payloadStr = JSON.stringify(payload);
  const payloadB64 = base64urlEncode(new TextEncoder().encode(payloadStr).buffer as ArrayBuffer);
  const sig = await signPayload(payloadStr);
  return `UNIPOS-V1.${payloadB64}.${sig}`;
}

/**
 * License key verify karo aur payload decode karo.
 */
export async function verifyAndDecodeLicenseKey(
  key: string
): Promise<LicensePayload | null> {
  try {
    if (!key.startsWith("UNIPOS-V1.")) return null;

    const parts = key.split(".");
    if (parts.length < 3) return null;

    const payloadB64 = parts[1];
    const sig = parts[2];

    const payloadBytes = base64urlDecode(payloadB64);
    const payloadStr = new TextDecoder().decode(payloadBytes);

    const valid = await verifySignature(payloadStr, sig);
    if (!valid) return null;

    const payload: LicensePayload = JSON.parse(payloadStr);
    return payload;
  } catch {
    return null;
  }
}
