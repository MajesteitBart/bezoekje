"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { getRosterByPublicToken, linkRosterToUser } from "@/lib/data";
import { dbReady } from "@/lib/db";
import { parseAdminLink } from "@/lib/links";

export type OtpFormState = {
  ok: boolean;
  step: "email" | "otp" | "klaar";
  email?: string;
  error?: string;
};

function cleanEmail(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string") return null;
  const email = value.trim().toLowerCase();
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return null;
  return email;
}

export async function requestOtpAction(
  _prev: OtpFormState,
  formData: FormData
): Promise<OtpFormState> {
  const email = cleanEmail(formData.get("email"));
  if (!email)
    return { ok: false, step: "email", error: "Vul een geldig e-mailadres in." };
  await dbReady();
  try {
    await auth.api.sendVerificationOTP({ body: { email, type: "sign-in" } });
  } catch {
    return {
      ok: false,
      step: "email",
      email,
      error: "De code kon niet worden verstuurd. Probeer het zo nog eens.",
    };
  }
  return { ok: true, step: "otp", email };
}

export async function verifyOtpAction(
  _prev: OtpFormState,
  formData: FormData
): Promise<OtpFormState> {
  const email = cleanEmail(formData.get("email"));
  const otpRaw = formData.get("otp");
  const otp = typeof otpRaw === "string" ? otpRaw.trim() : "";
  if (!email || !/^\d{6}$/.test(otp))
    return {
      ok: false,
      step: "otp",
      email: email ?? undefined,
      error: "Vul de code van 6 cijfers in.",
    };
  await dbReady();
  let userId: string;
  try {
    const res = await auth.api.signInEmailOTP({ body: { email, otp } });
    userId = res.user.id;
  } catch {
    return {
      ok: false,
      step: "otp",
      email,
      error: "Die code klopt niet (meer). Vraag eventueel een nieuwe aan.",
    };
  }
  // Optional roster link: only when the form proves admin access (adminToken).
  const publicToken = formData.get("publicToken");
  const adminToken = formData.get("adminToken");
  if (
    typeof publicToken === "string" &&
    typeof adminToken === "string" &&
    publicToken &&
    adminToken
  ) {
    const roster = await getRosterByPublicToken(publicToken);
    if (roster && roster.adminToken === adminToken)
      await linkRosterToUser(roster.id, userId);
  }
  return { ok: true, step: "klaar", email };
}

export type AddRosterState = { ok: boolean; error?: string; added?: string };

export async function addRosterByLinkAction(
  _prev: AddRosterState,
  formData: FormData
): Promise<AddRosterState> {
  const raw = formData.get("link");
  const link = typeof raw === "string" ? raw.trim() : "";
  await dbReady();
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { ok: false, error: "Je bent niet ingelogd." };
  const parsed = parseAdminLink(link);
  if (!parsed.ok) {
    if (parsed.reason === "visitor")
      return {
        ok: false,
        error:
          "Dit is de bezoekerslink. Plak de beheer-link — die heeft /admin/ in het adres.",
      };
    return {
      ok: false,
      error: "Dat lijkt geen beheer-link. Plak de volledige link.",
    };
  }
  const roster = await getRosterByPublicToken(parsed.publicToken);
  if (!roster || roster.adminToken !== parsed.adminToken)
    return { ok: false, error: "Deze beheer-link klopt niet (meer)." };
  await linkRosterToUser(roster.id, session.user.id);
  return { ok: true, added: roster.title };
}

export async function linkRosterToMyAccountAction(input: {
  publicToken: string;
  adminToken: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  await dbReady();
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { ok: false, error: "Je bent niet ingelogd." };
  const roster = await getRosterByPublicToken(input.publicToken);
  if (!roster || roster.adminToken !== input.adminToken)
    return { ok: false, error: "Geen toegang tot dit rooster." };
  await linkRosterToUser(roster.id, session.user.id);
  return { ok: true };
}

export async function signOutAction(): Promise<void> {
  await dbReady();
  try {
    await auth.api.signOut({ headers: await headers() });
  } catch {
    // No valid session — signing out is then already the case.
  }
  redirect("/account");
}
