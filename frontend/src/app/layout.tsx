import type { Metadata } from "next";
import "./globals.css";
import { Gotham } from "@/app/fonts";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ClientProviders from "./ClientProviders";
import PageTransitionWrapper from "@/components/PageTransitionWrapper";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: {
    default: "ZaytounaMart  – Motion-first E-commerce",
    template: "%s | MZaytounaMart ",
  },
  description:
    "A beautifully crafted motion-enhanced e-commerce experience built with Next.js 15 + GSAP.",
  keywords: [
    "ecommerce",
    "frontend",
    "motion ui",
    "GSAP",
    "Next.js",
    "Tailwind CSS",
    "UX/UI",
  ],
  authors: [{ name: "Code404", url: "https://github.com/yourgithub" }],
  creator: "Code404",
  metadataBase: new URL("https://ZaytounaMart-three.vercel.app"),
  openGraph: {
    title: "ZaytounaMart  – Motion-first E-commerce",
    description:
      "Clean UI, GSAP animation, and real-time filtering – built for the modern shopper.",
    url: "https://ZaytounaMart-three.vercel.app",
    siteName: "ZaytounaMart",
    images: [
      {
        url: "/Logo2.png", // public folder
        width: 1200,
        height: 630,
        alt: "ZaytounaMart – Premium Motion UI Store",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ZaytounaMart – Motion-first E-commerce",
    description:
      "Experience smooth interactions and beautiful design powered by GSAP + Next.js.",
    images: ["/Logo2.png"],
  },
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${Gotham.variable}`}>
      <body className="min-h-screen flex flex-col font-gotham">
        <ClientProviders>
          <Header />

          <PageTransitionWrapper>
            <main className="flex-grow">{children}</main>
          </PageTransitionWrapper>

          <Footer />
        </ClientProviders>

        {/* ✅ Toaster */}
        <Toaster position="top-right" reverseOrder={false} />
      </body>
    </html>
  );
}
