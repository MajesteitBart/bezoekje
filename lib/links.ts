export type ParsedAdminLink =
  | { ok: true; publicToken: string; adminToken: string }
  | { ok: false; reason: "visitor" | "invalid" };

// Accepts anything a user might paste: a full URL, a bare path, with or
// without query/hash. A visitor link is recognized so the error can say so.
export function parseAdminLink(text: string): ParsedAdminLink {
  const m = /\/r\/([^/\s]+)\/admin\/([^/?#\s]+)/.exec(text);
  if (m) return { ok: true, publicToken: m[1], adminToken: m[2] };
  if (/\/r\/[^/\s]+/.test(text)) return { ok: false, reason: "visitor" };
  return { ok: false, reason: "invalid" };
}
