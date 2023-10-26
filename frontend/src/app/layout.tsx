import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from "./providers";


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Flame Minter",
  description: "Flames NFT Collection Minting Website",
  applicationName: "Flame Minter",
  twitter: {
    card: "summary_large_image",
    site: "@site",
    creator: "@creator",
    images: "https://app.buyholdearn.com/FLAMES.jpg",
  },
  openGraph: {
    type: "website",
    url: "https://app.buyholdearn.com",
    title: "Flame Minter",
    description: "Flames NFT Collection Minting Website",
    siteName: "Flame Minter",
    images: [
      {
        url: "https://app.buyholdearn.com/FLAMES.jpg",
      },
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-body">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
