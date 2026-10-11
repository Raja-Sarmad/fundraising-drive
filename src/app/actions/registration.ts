"use server";

import { headers } from "next/headers";
import { connectToDatabase } from "@/lib/mongodb";
import { Registration } from "@/models/Registration";
import { appendRegistrationRow, isGoogleSheetsConfigured } from "@/lib/googleSheets";
import {
  normalizeRegistration,
  stateForCity,
  validateRegistration,
  type FieldErrors,
  type RegistrationInput,
} from "@/lib/validation";

export type SubmitResult =
  | {
      ok: true;
      id: string;
      sheetSynced: boolean;
    }
  | {
      ok: false;
      message: string;
      fieldErrors?: FieldErrors;
    };

function formatSydneyTime(date: Date): string {
  return new Intl.DateTimeFormat("en-AU", {
    timeZone: "Australia/Sydney",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);
}

export async function submitRegistration(raw: RegistrationInput): Promise<SubmitResult> {
  // 1. Never trust the client: normalise + validate again on the server.
  if (!raw || typeof raw !== "object") {
    return { ok: false, message: "Invalid submission." };
  }
  const input = normalizeRegistration({
    name: String(raw.name ?? ""),
    email: String(raw.email ?? ""),
    phone: String(raw.phone ?? ""),
    city: String(raw.city ?? ""),
  });

  const fieldErrors = validateRegistration(input);
  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, message: "Please fix the highlighted fields.", fieldErrors };
  }

  // 2. Save to MongoDB.
  let doc;
  try {
    await connectToDatabase();
    const userAgent = (await headers()).get("user-agent") ?? undefined;
    doc = await Registration.create({
      ...input,
      state: stateForCity(input.city),
      userAgent,
    });
  } catch (err) {
    console.error("[registration] MongoDB save failed:", err);
    return {
      ok: false,
      message: "We couldn't save your details right now. Please try again in a moment.",
    };
  }

  // 3. Mirror the row to Google Sheets. A failure here must NOT lose the
  //    submission – it's already in the database – so we record the error
  //    on the document and report success to the user.
  let sheetSynced = false;
  if (isGoogleSheetsConfigured()) {
    try {
      await appendRegistrationRow({
        "Submitted At": formatSydneyTime(doc.createdAt ?? new Date()),
        Name: doc.name,
        Email: doc.email,
        Phone: doc.phone,
        City: doc.city,
        State: doc.state ?? "",
        "Registration ID": doc._id.toString(),
      });
      sheetSynced = true;
      await Registration.updateOne(
        { _id: doc._id },
        { $set: { sheetSynced: true, sheetSyncedAt: new Date() }, $unset: { sheetSyncError: "" } },
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("[registration] Google Sheets sync failed:", message);
      await Registration.updateOne(
        { _id: doc._id },
        { $set: { sheetSynced: false, sheetSyncError: message.slice(0, 500) } },
      ).catch(() => {});
    }
  } else {
    console.warn("[registration] Google Sheets not configured – skipped sheet sync.");
  }

  return { ok: true, id: doc._id.toString(), sheetSynced };
}
