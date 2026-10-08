/**
 * Normalizes string into URL-safe slug format.
 * Example: "Wireless Pro Noise-Canceling Headphones!" -> "wireless-pro-noise-canceling-headphones"
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}
