import type { Metadata, Viewport } from "next";
import "./fonts.css";
import "./globals.css";
import "./request/request.css";
import "./public.css";
import PublicContact from "../components/PublicContact";
import { approvedSiteOrigin } from "../lib/site-indexing.mjs";

export const metadata: Metadata = {
  title: "China Parts Shop | Automotive & Equipment Parts Sourcing",
  icons: { icon: "/cps-logo.png" },
  description:
    "Tell us the part you need. Send an automotive or equipment parts enquiry with your part number, brand or equipment details.",
  robots: approvedSiteOrigin()
    ? { index: true, follow: true }
    : { index: false, follow: false },
  metadataBase: approvedSiteOrigin()
    ? new URL(approvedSiteOrigin()!)
    : undefined,
};
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        {children}
        <PublicContact />
      </body>
    </html>
  );
}
