/**
 * Generates a URL-safe slug from a string.
 * Example: "Women's Cotton Saree" → "womens-cotton-saree"
 */
export function generateSlug(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')         // Replace spaces with hyphens
    .replace(/[^\w\-]+/g, '')     // Remove non-word chars (except hyphens)
    .replace(/\-\-+/g, '-')      // Replace multiple hyphens with single
    .replace(/^-+/, '')           // Trim leading hyphens
    .replace(/-+$/, '');          // Trim trailing hyphens
}

/**
 * Generates a unique slug by appending a random suffix.
 * Example: "womens-cotton-saree-a3b2c1"
 */
export function generateUniqueSlug(text: string): string {
  const baseSlug = generateSlug(text);
  const suffix = Math.random().toString(36).substring(2, 8);
  return `${baseSlug}-${suffix}`;
}
