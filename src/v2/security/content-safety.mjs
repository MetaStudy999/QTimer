// QTimer V2 content safety utilities.
// Treat imported/user/external strings as untrusted even when they are persisted locally.

export function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function normalizeExternalHttpsUrl(input, { allowedHosts = null } = {}) {
  const raw = String(input ?? "").trim();
  if (!raw) return null;
  let url;
  try { url = new URL(raw); }
  catch { return null; }
  if (url.protocol !== "https:") return null;
  if (url.username || url.password) return null;

  if (allowedHosts) {
    const hosts = new Set([...allowedHosts].map(host => String(host).toLowerCase()));
    if (!hosts.has(url.hostname.toLowerCase())) return null;
  }
  return url.href;
}

export function normalizeSourceImageUrl(input) {
  return normalizeExternalHttpsUrl(input, {
    allowedHosts: new Set([
      "drive.google.com",
      "docs.google.com",
      "lh3.googleusercontent.com",
      "googleusercontent.com"
    ])
  });
}

export function safeLinkAttributes(input, options = {}) {
  const href = normalizeExternalHttpsUrl(input, options);
  if (!href) return null;
  return Object.freeze({
    href,
    target: "_blank",
    rel: "noopener noreferrer"
  });
}
