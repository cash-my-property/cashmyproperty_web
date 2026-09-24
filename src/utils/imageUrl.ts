/**
 * Image URL normalization & CDN optimization utilities.
 * Automatically injects Cloudinary auto-format (WebP/AVIF) and auto-quality (q_auto).
 */

const PLACEHOLDER_IMAGE = "/property-placeholder.svg";

export function getOptimizedImageUrl(raw: any): string {
  if (!raw) return PLACEHOLDER_IMAGE;
  const url = typeof raw === "string" ? raw : raw?.url;
  if (!url || typeof url !== "string" || url.trim() === "") return PLACEHOLDER_IMAGE;

  // Cloudinary dynamic optimization: f_auto (AVIF/WebP based on client browser), q_auto (optimal visual quality vs file size)
  if (url.includes("res.cloudinary.com") && url.includes("/upload/") && !url.includes("f_auto")) {
    return url.replace("/upload/", "/upload/f_auto,q_auto/");
  }

  return url;
}

export function extractPropertyImages(itemOrDetails: any): string[] {
  if (!itemOrDetails) return [PLACEHOLDER_IMAGE];
  const details = itemOrDetails.propertyDetails || itemOrDetails;

  const rawList =
    details.allPropertyImages ||
    itemOrDetails.allPropertyImages ||
    details.propertyImages ||
    itemOrDetails.propertyImages ||
    (itemOrDetails.image ? [itemOrDetails.image] : []) ||
    (details.image ? [details.image] : []);

  if (Array.isArray(rawList) && rawList.length > 0) {
    const list = rawList
      .map(getOptimizedImageUrl)
      .filter((u) => u && u !== PLACEHOLDER_IMAGE);
    return list.length > 0 ? list : [PLACEHOLDER_IMAGE];
  }

  return [PLACEHOLDER_IMAGE];
}
