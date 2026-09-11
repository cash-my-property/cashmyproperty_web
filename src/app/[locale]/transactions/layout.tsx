import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Property Transactions & Closed Deals Register | CMP Dubai",
  description: "Explore verified historical property transaction records, transacted prices, sold and rented deal histories across Dubai & UAE.",
  keywords: [
    "Dubai Property Transactions",
    "UAE Closed Deals",
    "Transacted Prices",
    "Dubai Real Estate Historical Deals",
    "DLD Records",
    "Rented Properties Dubai",
    "Sold Properties Dubai",
    "CMP Dubai Transactions"
  ],
  openGraph: {
    title: "Property Transactions & Closed Deals Register | CMP Dubai",
    description: "Explore verified historical property transaction records, transacted prices, sold and rented deal histories across Dubai & UAE.",
    url: "https://cmpdubai.com/transactions",
    siteName: "CMP Dubai - Cash My Property",
    images: [
      {
        url: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "CMP Property Transactions Register",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Property Transactions & Closed Deals Register | CMP Dubai",
    description: "Explore verified historical property transaction records, transacted prices, sold and rented deal histories across Dubai & UAE.",
    images: ["https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"],
  },
  alternates: {
    canonical: "https://cmpdubai.com/transactions",
  },
};

export default function TransactionsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
