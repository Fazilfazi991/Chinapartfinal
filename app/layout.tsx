import type { Metadata, Viewport } from "next";
import "./fonts.css";
import "./globals.css";
import "./request/request.css";
import {approvedSiteOrigin} from '../lib/site-indexing.mjs';

export const metadata: Metadata = { title: "China Parts Shop | Chinese Automotive & Heavy Equipment Spare Parts", icons: { icon: "/cps-logo.png" }, description: "Source Genuine, OE, OEM, aftermarket, and replacement parts for Chinese vehicles, trucks, heavy equipment, and machinery. Request a quote from China Parts Shop.",robots:approvedSiteOrigin()?{index:true,follow:true}:{index:false,follow:false},metadataBase:approvedSiteOrigin()?new URL(approvedSiteOrigin()!):undefined };
export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }

