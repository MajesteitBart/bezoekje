"use client";

// Per-roster map of visitId -> editToken, kept in this browser so people can
// edit their own visits without any account.

function storageKey(publicToken: string): string {
  return `visits:${publicToken}:tokens`;
}

export function getEditTokens(publicToken: string): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(storageKey(publicToken));
    return raw ? (JSON.parse(raw) as Record<string, string>) : {};
  } catch {
    return {};
  }
}

export function saveEditToken(
  publicToken: string,
  visitId: string,
  editToken: string
): void {
  if (typeof window === "undefined") return;
  try {
    const tokens = getEditTokens(publicToken);
    tokens[visitId] = editToken;
    window.localStorage.setItem(storageKey(publicToken), JSON.stringify(tokens));
  } catch {
    // localStorage unavailable (private mode) — the personal link still works.
  }
}

export function removeEditToken(publicToken: string, visitId: string): void {
  if (typeof window === "undefined") return;
  try {
    const tokens = getEditTokens(publicToken);
    delete tokens[visitId];
    window.localStorage.setItem(storageKey(publicToken), JSON.stringify(tokens));
  } catch {
    // ignore
  }
}

// navigator.clipboard is unavailable on insecure origins (plain http on a
// non-localhost host — e.g. testing from a phone over the LAN). Fall back to a
// temporary textarea + execCommand so copy still works there.
export async function copyText(text: string): Promise<boolean> {
  try {
    if (window.isSecureContext && navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through to the legacy path
  }
  try {
    const el = document.createElement("textarea");
    el.value = text;
    el.setAttribute("readonly", "");
    el.style.position = "fixed";
    el.style.opacity = "0";
    document.body.appendChild(el);
    el.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(el);
    return ok;
  } catch {
    return false;
  }
}

export function getSavedName(): string {
  if (typeof window === "undefined") return "";
  try {
    return window.localStorage.getItem("visits:name") ?? "";
  } catch {
    return "";
  }
}

export function saveName(name: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem("visits:name", name);
  } catch {
    // ignore
  }
}
