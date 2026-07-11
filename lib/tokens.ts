import { customAlphabet } from "nanoid";

// No lookalike characters (0/O, 1/l/I) — these tokens travel through WhatsApp
// and occasionally get retyped by hand.
const alphabet = "23456789abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ";

export const newToken = customAlphabet(alphabet, 16);
export const newId = customAlphabet(alphabet, 12);
