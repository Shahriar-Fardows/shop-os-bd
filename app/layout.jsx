import { Nunito } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-nunito",
});

export const metadata = {
  title: "ShopOS BD",
  description: "ShopOS BD - Your Premium Shop Management Suite",
  icons: {
    icon: "/shoposbd.png",
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
