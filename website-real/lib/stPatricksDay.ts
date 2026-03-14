/**
 * St. Patrick's Day Sale — March 17, 2026
 * 50% off green colorways on qualifying products.
 *
 * To activate/deactivate the sale, adjust SALE_START / SALE_END below,
 * or flip FORCE_ACTIVE for local testing.
 */

export const SALE_DISCOUNT = 0.5; // 50% off

const SALE_START = new Date("2026-03-10T00:00:00-05:00"); // Live now
const SALE_END   = new Date("2026-03-18T00:00:00-05:00"); // Closes midnight after St. Paddy's

// Set to true during development to preview the banner outside the sale window
const FORCE_ACTIVE = false;

/** Returns true when the St. Patrick's Day sale is live. */
export function isStPatsDayActive(): boolean {
  if (FORCE_ACTIVE) return true;
  const now = new Date();
  return now >= SALE_START && now < SALE_END;
}

/**
 * Map of product slug → the color slugs that qualify for the St. Patrick's discount.
 * Add or remove slugs here as needed.
 */
export const ST_PATS_GREEN_SLUGS: Record<string, string[]> = {
  "jozi-rugby-jersey":  ["default"],          // Jozi Jersey (only colorway is green)
  "forest-hills-hat":   ["default"],           // Forest Hills Hat (lime green, one size)
  "gala-tshirt":        ["grasshopper"],        // Gala Tee – Grasshopper
  "fuji-tshirt":        ["arboretum"],          // Fuji Long Sleeve – Arboretum
  "tracksuit":          ["greenpoint-patina-crew"], // Greenpoint Tracksuit
  "track-top":          ["greenpoint-patina-crew"], // Greenpoint Top
  "track-pants":        ["greenpoint-patina-crew"], // Greenpoint Bottom
  "liberty-zip-up":     ["moss"],              // Moss Liberty Zip-Up
};

/**
 * Returns the discounted price for a product/color combination when the
 * St. Patrick's Day sale is active, otherwise returns the original price.
 *
 * Pass `colorSlug = null` for single-colorway products (Forest Hills Hat, Jozi Jersey).
 */
export function getStPatsPrice(
  productSlug: string,
  originalPrice: number,
  colorSlug: string | null
): number {
  if (!isStPatsDayActive()) return originalPrice;

  const greenSlugs = ST_PATS_GREEN_SLUGS[productSlug];
  if (!greenSlugs) return originalPrice;

  const slugToCheck = colorSlug ?? "default";
  if (greenSlugs.includes(slugToCheck)) {
    return Math.round(originalPrice * (1 - SALE_DISCOUNT) * 100) / 100;
  }

  return originalPrice;
}

/**
 * Returns true if the given color slug qualifies for the St. Patrick's discount
 * on this product (and the sale is currently active).
 */
export function isGreenColorOnSale(productSlug: string, colorSlug: string | null): boolean {
  if (!isStPatsDayActive()) return false;
  const greenSlugs = ST_PATS_GREEN_SLUGS[productSlug];
  if (!greenSlugs) return false;
  return greenSlugs.includes(colorSlug ?? "default");
}
