import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const display = Instrument_Serif({ variable: "--font-display", subsets: ["latin"], weight: "400", style: ["normal", "italic"] });

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.APP_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000"),
  ),
  title: "Aura Engine: Paste your URL. Get a series, not an ad.",
  description:
    "Aura Engine turns your website into micro-dramas, character series and launch films, built on the formats behind 700M+ organic views on @aurakidzzz. By InkFrame Films.",
  openGraph: {
    title: "Aura Engine by InkFrame Films",
    description: "Paste your URL. Get a series, not an ad. The formats behind 700M+ organic views, productized.",
    images: ["https://www.inkframefilms.com/og/aurakidzzz.jpg"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} ${display.variable} antialiased`}>{children}</body>
    </html>
  );
}
