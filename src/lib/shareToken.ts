import CryptoJS from "crypto-js";

const SHARE_ENCRYPTION_KEY = process.env.NEXT_PUBLIC_SHARE_ENCRYPTION_KEY || "cmp_share_2024";

const key = CryptoJS.enc.Utf8.parse(
  SHARE_ENCRYPTION_KEY.padEnd(32, "0").slice(0, 32)
);

const iv = CryptoJS.enc.Utf8.parse("1234567890123456");

// Token generate karte time timestamp add karo
export const generateShareToken = (
  auctionId: string,
  userId?: string
): string => {
  const payload = JSON.stringify({
    auctionId,
    listingId: auctionId,
    id: auctionId,
    userId: userId || "",
    timestamp: Date.now(),
  });

  const encrypted = CryptoJS.AES.encrypt(payload, key, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  }).toString();

  return encodeURIComponent(encrypted);
};

// Proper error handling + 24 hour expiry verification
export const verifyShareToken = (token: string) => {
  try {
    if (!token) {
      console.log("❌ Token is empty");
      return null;
    }

    const bytes = CryptoJS.AES.decrypt(decodeURIComponent(token), key, {
      iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    const json = bytes.toString(CryptoJS.enc.Utf8);
    
    if (!json) {
      console.log("❌ Decryption failed - empty result");
      return null;
    }

    const parsed = JSON.parse(json);

    // 24 hour expiry check
    const EXPIRY_TIME = 24 * 60 * 60 * 1000;
    const isExpired = Date.now() - parsed.timestamp > EXPIRY_TIME;

    if (isExpired) {
      console.log("❌ Token expired");
      return null;
    }

    console.log(" Token verified:", parsed);
    return parsed;
  } catch (error) {
    console.log("❌ Token verification error:", error);
    return null;
  }
};
