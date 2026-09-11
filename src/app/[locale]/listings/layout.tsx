import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Live Property Listings & Rental Properties in Dubai | CMP Dubai",
  description: "Browse verified live property listings for rent and sale, apartments, luxury villas, townhouses, and commercial real estate in Dubai & UAE.",
  keywords: [
    "Dubai Properties for Rent",
    "Dubai Properties for Sale",
    "Luxury Villas Dubai",
    "Apartments Dubai Marina",
    "Downtown Dubai Rentals",
    "CMP Dubai Listings"
  ],
  openGraph: {
    title: "Live Property Listings & Rental Properties in Dubai | CMP Dubai",
    description: "Browse verified live property listings for rent and sale, apartments, luxury villas, townhouses, and commercial real estate in Dubai & UAE.",
    url: "https://cmpdubai.com/listings",
    siteName: "CMP Dubai - Cash My Property",
    images: [
      {
        url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "CMP Property Listings Dubai",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Live Property Listings & Rental Properties in Dubai | CMP Dubai",
    description: "Browse verified live property listings for rent and sale, apartments, luxury villas, townhouses, and commercial real estate in Dubai & UAE.",
    images: ["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"],
  },
  alternates: {
    canonical: "https://cmpdubai.com/listings",
  },
};

export default function ListingsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
