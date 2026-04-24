import { Nunito } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-nunito",
});

export const metadata = {
  metadataBase: new URL('https://shoposbd.com'),
  title: {
    default: "ShopOS BD | প্রফেশনাল ডিজিটাল শপ ম্যানেজমেন্ট",
    template: "%s | ShopOS BD"
  },
  description: "বাংলাদেশের কম্পিউটার শপ ও স্টেশনারি দোকানের জন্য সবচেয়ে আধুনিক ডিজিটাল ম্যানেজমেন্ট প্ল্যাটফর্ম। সিভি, ক্যাশ মেমো, হিসাব খাতা থেকে শুরু করে সব কিছুই এক জায়গায়।",
  keywords: ["ShopOS BD", "Computer Shop Management", "CV Maker BD", "Cash Memo Generator", "Digital Khata", "ডিজিটাল খাতা", "ক্যাশ মেমো তৈরি", "hishabpati", "itlancerbd", "Teachfosys"],
  authors: [{ name: 'ShopOS BD' }],
  creator: 'ShopOS BD',
  publisher: 'ShopOS BD',
  openGraph: {
    title: "ShopOS BD | প্রফেশনাল ডিজিটাল শপ ম্যানেজমেন্ট",
    description: "বাংলাদেশের কম্পিউটার শপ ও স্টেশনারি দোকানের জন্য সবচেয়ে আধুনিক ডিজিটাল ম্যানেজমেন্ট প্ল্যাটফর্ম।",
    url: 'https://shoposbd.com',
    siteName: 'ShopOS BD',
    images: [
      {
        url: '/shoposbd.png', // Ideally an OG image that is 1200x630
        width: 800,
        height: 600,
        alt: 'ShopOS BD Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ShopOS BD | প্রফেশনাল ডিজিটাল শপ ম্যানেজমেন্ট',
    description: 'বাংলাদেশের কম্পিউটার শপ ও স্টেশনারি দোকানের জন্য সবচেয়ে আধুনিক ডিজিটাল ম্যানেজমেন্ট প্ল্যাটফর্ম।',
    images: ['/shoposbd.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: "/shoposbd.png",
    apple: "/shoposbd.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${nunito.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-nunito">{children}</body>
    </html>
  );
}
