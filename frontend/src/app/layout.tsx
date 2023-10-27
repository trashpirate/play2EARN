import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from "./providers";


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Play-2-EARN",
  description:
    "Play-2-EARN is a fun lottery game where you can draw NFT cards and win prizes in $EARN tokens.",
  applicationName: "Play-2-EARN",
  twitter: {
    card: "summary_large_image",
    site: "play.buyholdearn.com",
    creator: "buyholdearn",
    images: "https://play.buyholdearn.com/play.jpg",
  },
  openGraph: {
    type: "website",
    url: "https://play.buyholdearn.com",
    title: "Play-2-EARN",
    description:
      "Play-2-EARN is a fun lottery game where you can draw NFT cards and win prizes in $EARN tokens.",
    siteName: "Play-2-EARN",
    images: [
      {
        url: "https://play.buyholdearn.com/play.jpg",
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
