import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verified Real Estate Sellers & Licensed Brokers | CMP Dubai",
  description: "Find and connect with RERA-licensed real estate agents, agencies, and verified property sellers across Dubai & UAE.",
  keywords: [
    "Verified Real Estate Brokers Dubai",
    "RERA Licensed Agents",
    "Dubai Real Estate Agencies",
    "CMP Verified Sellers",
    "Dubai Property Agents",
    "Brokerage Directory UAE"
  ],
  openGraph: {
    title: "Verified Real Estate Sellers & Licensed Brokers | CMP Dubai",
    description: "Find and connect with RERA-licensed real estate agents, agencies, and verified property sellers across Dubai & UAE.",
    url: "https://cmpdubai.com/sellers",
    siteName: "CMP Dubai - Cash My Property",
    images: [
      {
        url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "CMP Verified Sellers Directory",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Verified Real Estate Sellers & Licensed Brokers | CMP Dubai",
    description: "Find and connect with RERA-licensed real estate agents, agencies, and verified property sellers across Dubai & UAE.",
    images: ["https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"],
  },
  alternates: {
    canonical: "https://cmpdubai.com/sellers",
  },
};

export default function SellersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
