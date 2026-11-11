// Feature flags — build time pe inline hote hain (NEXT_PUBLIC_*), proxy (server) aur client dono mein same value.
export const features = {
  /**
   * Real Time Offers (RTO / auctions): /auctions, offer detail, broker offers/contracts, homepage section, nav toggle.
   * Default ON. Band karna ho to env mein NEXT_PUBLIC_FEATURE_REALTIME_OFFERS=false karke rebuild karein —
   * tab routes redirect ho jate hain aur saare entry points chhup jate hain (dekho src/proxy.ts).
   */
  realTimeOffers: process.env.NEXT_PUBLIC_FEATURE_REALTIME_OFFERS !== "false",
} as const;
