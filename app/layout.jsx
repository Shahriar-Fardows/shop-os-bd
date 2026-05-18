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
  keywords: [
    "ShopOS BD", "shoposbd", "shop os bd", "shopos bd", "shop osbd", "Shop OS Bangladesh", "ShopOS", "শপ ওএস বিডি", "শপ ওএস বাংলাদেশ", "সপ ওএস বিডি", "sop os bd", "sap os bd", "shoposbd.com",
    "Computer Shop Management", "Store Management Software Bangladesh", "POS system BD", "Point of Sale BD", "Inventory Management BD", "Dokan Management Software", "Business Management Software BD",
    "CV Maker BD", "Resume Maker Bangladesh", "Cash Memo Generator", "Digital Cash Memo BD", "Online Cash Memo Maker", "Digital Khata", "Hishab Khata Online", "Shop Hishab", "Dokander Hisab", "Dokani Hisab", "QR Code Maker BD", "Image Background Remover BD", "NID Print Format",
    "দোকান ম্যানেজমেন্ট সফটওয়্যার", "কম্পিউটার দোকান ম্যানেজমেন্ট", "ডিজিটাল খাতা", "হিসাব খাতা", "হিসাব নিকাশ সফটওয়্যার", "দোকানের হিসাব", "বাকি খাতা", "বাকি খাতা অ্যাপ", "ক্যাশ মেমো তৈরি", "ক্যাশ মেমো তৈরির সফটওয়্যার", "সিভি তৈরি", "সিভি মেকার", "কিউআর কোড মেকার", "অনলাইন হিসাব খাতা", "দোকানদারের সফটওয়্যার", "আবেদন পত্র তৈরি",
    "hishabpati", "itlancerbd", "Teachfosys", "tally khata", "hishab rakkhok", "free pos bd"
  ],
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
      lang="bn"
      className={`${nunito.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-nunito">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "ShopOS BD",
              "operatingSystem": "Web",
              "applicationCategory": "BusinessApplication",
              "url": "https://shoposbd.com",
              "description": "বাংলাদেশের কম্পিউটার শপ ও স্টেশনারি দোকানের জন্য সবচেয়ে আধুনিক ডিজিটাল ম্যানেজমেন্ট প্ল্যাটফর্ম।",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "BDT"
              }
            })
          }}
        />
        {children}
      </body>
    </html>
  );
}
