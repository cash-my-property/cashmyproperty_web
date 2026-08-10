import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display, Inter } from "next/font/google";
import "../globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { DictionaryProvider } from "@/components/DictionaryProvider";
import { AuthProvider } from "@/context/AuthContext";
import RouteLayout from "@/components/RouteLayout";
import { Locale } from "@/dictionaries";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "NexusClients | Modern Client Portal & Agency Engine",
  description: "Enterprise web client portal, real-time project dashboards, cloud architecture, and quote estimator built on Next.js 15.",
};

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <html
      lang={locale}
      dir={dir}
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} ${inter.variable} h-full antialiased`}
    >
      <body suppressHydrationWarning className="min-h-screen flex flex-col bg-[#F4F5F7] dark:bg-[#091711] text-gray-900 dark:text-gray-100 font-sans selection:bg-green-500/20 selection:text-green-900 transition-colors">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <DictionaryProvider locale={locale as Locale}>
              <RouteLayout>
                {children}
              </RouteLayout>
            </DictionaryProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}


