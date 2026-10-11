import "server-only";
import { JWT } from "google-auth-library";

const SHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets";

export const SHEET_HEADERS = [
  "Submitted At",
  "Name",
  "Email",
  "Phone",
  "City",
  "State",
  "Registration ID",
] as const;

export type SheetRow = Record<(typeof SHEET_HEADERS)[number], string>;

function getConfig() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const rawKey = process.env.GOOGLE_PRIVATE_KEY;
  const sheetId = process.env.GOOGLE_SHEET_ID;
  const sheetName = process.env.GOOGLE_SHEET_NAME || "Sheet1";

  if (!email || !rawKey || !sheetId) return null;

  // .env files store the key on a single line with literal "\n" sequences.
  const privateKey = rawKey.replace(/\\n/g, "\n").replace(/^"|"$/g, "");
  return { email, privateKey, sheetId, sheetName };
}

export function isGoogleSheetsConfigured(): boolean {
  return getConfig() !== null;
}

let cachedClient: JWT | null = null;

function getClient(email: string, privateKey: string): JWT {
  if (!cachedClient) {
    cachedClient = new JWT({ email, key: privateKey, scopes: [SHEETS_SCOPE] });
  }
  return cachedClient;
}

async function sheetsRequest<T>(
  client: JWT,
  url: string,
  init: { method: "GET" | "POST" | "PUT"; body?: unknown },
): Promise<T> {
  const { token } = await client.getAccessToken();
  if (!token) throw new Error("Could not obtain Google access token.");

  const res = await fetch(url, {
    method: init.method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: init.body ? JSON.stringify(init.body) : undefined,
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Google Sheets API ${res.status}: ${text.slice(0, 300)}`);
  }
  return (await res.json()) as T;
}

/** Writes the header row into row 1 if the sheet is currently empty. */
async function ensureHeaderRow(client: JWT, sheetId: string, sheetName: string) {
  const range = encodeURIComponent(`${sheetName}!A1:${String.fromCharCode(64 + SHEET_HEADERS.length)}1`);
  const base = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}`;

  const existing = await sheetsRequest<{ values?: string[][] }>(client, base, { method: "GET" });
  if (existing.values && existing.values.length > 0) return;

  await sheetsRequest(client, `${base}?valueInputOption=RAW`, {
    method: "PUT",
    body: { range: decodeURIComponent(range), majorDimension: "ROWS", values: [SHEET_HEADERS] },
  });
}

/**
 * Appends one registration as a new row at the bottom of the sheet.
 * Throws when not configured or when Google rejects the request.
 */
export async function appendRegistrationRow(row: SheetRow): Promise<void> {
  const cfg = getConfig();
  if (!cfg) {
    throw new Error(
      "Google Sheets is not configured (GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY, GOOGLE_SHEET_ID).",
    );
  }

  const client = getClient(cfg.email, cfg.privateKey);
  await ensureHeaderRow(client, cfg.sheetId, cfg.sheetName);

  const range = encodeURIComponent(`${cfg.sheetName}!A:A`);
  const url =
    `https://sheets.googleapis.com/v4/spreadsheets/${cfg.sheetId}/values/${range}:append` +
    `?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

  await sheetsRequest(client, url, {
    method: "POST",
    body: {
      majorDimension: "ROWS",
      values: [SHEET_HEADERS.map((h) => row[h] ?? "")],
    },
  });
}
