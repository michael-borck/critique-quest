// Escape text that will be interpolated into exported HTML so that
// AI-generated or imported content cannot inject active markup (stored XSS
// when the exported file is opened in a browser).
export function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
