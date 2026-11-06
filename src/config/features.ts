// Feature flags — build time pe inline hote hain (NEXT_PUBLIC_*), proxy (server) aur client dono mein same value.
export const features = {
  /**
   * Real Time Offers (RTO / auctions): /auctions, offer detail, broker offers/contracts, homepage section, nav toggle.
   * Abhi OFF hai. Wapas on karne ke liye .env mein NEXT_PUBLIC_FEATURE_REALTIME_OFFERS=true karke rebuild karein —
   * code poora mojood hai, sirf chhupa/redirect hai (dekho src/proxy.ts).
   */
  realTimeOffers: process.env.NEXT_PUBLIC_FEATURE_REALTIME_OFFERS === "true",
} as const;
