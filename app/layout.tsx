import type { Metadata, Viewport } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CookieConsent } from "@/components/cookie-consent";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://thestartupbillboard.com"),
  title: {
    default: "The Startup Billboard — Own the Spot",
    template: "%s — The Startup Billboard",
  },
  description:
    "The internet's billboard for ambitious startups, SaaS products, AI companies and brands.",
  applicationName: "The Startup Billboard",
  alternates: { canonical: "/" },
  openGraph: {
    title: "The Startup Billboard — Own the Spot",
    description: "Scarce digital billboard space for ambitious startups and brands.",
    type: "website",
    siteName: "The Startup Billboard",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Startup Billboard — Own the Spot",
    description: "The internet's billboard for ambitious startups and brands.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#080808",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
        <CookieConsent />
      </body>
    </html>
  );
}