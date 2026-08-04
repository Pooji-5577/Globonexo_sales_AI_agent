const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
const TAG_PATTERN = /<[^>]*>/g;

export function cleanText(value, { max = 500, multiline = false } = {}) {
  const source = String(value ?? "").replace(CONTROL_CHARS, "");
  const withoutTags = source.replace(TAG_PATTERN, "");
  const normalized = multiline
    ? withoutTags.replace(/\r\n?/g, "\n").replace(/[ \t]+\n/g, "\n").trim()
    : withoutTags.replace(/\s+/g, " ").trim();

  return normalized.slice(0, max);
}

export function cleanList(values, { maxItems = 20, maxItemLength = 120 } = {}) {
  return (Array.isArray(values) ? values : [])
    .map(value => cleanText(value, { max: maxItemLength }))
    .filter(Boolean)
    .slice(0, maxItems);
}

export function isValidEmail(value) {
  return EMAIL_PATTERN.test(cleanText(value, { max: 254 }));
}

export function normalizeUrl(value, { required = false } = {}) {
  const cleaned = cleanText(value, { max: 2048 });
  if (!cleaned) {
    if (required) throw new Error("Enter a valid URL.");
    return "";
  }

  const candidate = /^https?:\/\//i.test(cleaned) ? cleaned : `https://${cleaned}`;
  let parsed;
  try {
    parsed = new URL(candidate);
  } catch {
    throw new Error("Enter a valid URL.");
  }

  if (!["http:", "https:"].includes(parsed.protocol) || !parsed.hostname.includes(".")) {
    throw new Error("Enter a valid URL.");
  }

  parsed.hash = "";
  return parsed.toString();
}

export function clampNumber(value, { min = 0, max = Number.MAX_SAFE_INTEGER, fallback = min } = {}) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, number));
}

export function assertSafeExternalUrl(value, allowedProtocols = ["https:", "http:"]) {
  const parsed = new URL(String(value ?? ""));
  if (!allowedProtocols.includes(parsed.protocol)) {
    throw new Error("Unsafe redirect URL.");
  }
  return parsed.toString();
}
