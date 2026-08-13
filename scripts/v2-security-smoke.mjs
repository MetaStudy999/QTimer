import assert from "node:assert/strict";
import { escapeHtml, normalizeExternalHttpsUrl, normalizeSourceImageUrl, safeLinkAttributes } from "../src/v2/security/content-safety.mjs";

assert.equal(escapeHtml(`<img src=x onerror="alert('x')">`), "&lt;img src=x onerror=&quot;alert(&#039;x&#039;)&quot;&gt;");
assert.equal(normalizeExternalHttpsUrl("javascript:alert(1)"), null);
assert.equal(normalizeExternalHttpsUrl("data:text/html,<script>alert(1)</script>"), null);
assert.equal(normalizeExternalHttpsUrl("http://example.com/x"), null);
assert.equal(normalizeExternalHttpsUrl("https://user:pass@example.com/x"), null);
assert.equal(normalizeExternalHttpsUrl("not a url"), null);
assert.equal(normalizeExternalHttpsUrl("https://example.com/path"), "https://example.com/path");

assert.equal(normalizeSourceImageUrl("https://drive.google.com/file/d/abc/view"), "https://drive.google.com/file/d/abc/view");
assert.equal(normalizeSourceImageUrl("https://evil.example/drive.google.com/file"), null);
assert.equal(normalizeSourceImageUrl("javascript:alert(1)"), null);

const attrs = safeLinkAttributes("https://example.com/docs");
assert.equal(attrs.href, "https://example.com/docs");
assert.equal(attrs.target, "_blank");
assert.equal(attrs.rel, "noopener noreferrer");

console.log("# QTimer V2 security smoke");
console.log("PASS: untrusted text has centralized HTML escaping");
console.log("PASS: external links require HTTPS and reject embedded credentials");
console.log("PASS: SOURCE image hosts use explicit allowlist");
console.log("PASS: external new-tab links enforce noopener noreferrer");
