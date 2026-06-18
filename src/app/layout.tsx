import type { Metadata } from "next";
import { Toaster } from "sonner";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { Providers } from "@/components/providers";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: {
    default: "TrendyCart | Premium Multi-vendor Marketplace",
    template: "%s | TrendyCart"
  },
  description: "Shop fashion, electronics, beauty, sneakers, and creator-led stores on TrendyCart.",
  openGraph: {
    title: "TrendyCart",
    description: "A premium multi-vendor marketplace built with Next.js, Prisma, Razorpay, and Cloudinary.",
    type: "website"
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <Header />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <Toaster richColors position="top-right" />
        </Providers>
      </body>
    </html>
  );
}
