import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { FloatingAddButton } from "@/components/FloatingAddButton";
import { PWAInstaller } from "@/components/PWAInstaller";
import { ToastProvider } from "@/components/ui/toast";
import { LoaderProvider } from "@/components/ui/loader";
import { ThemeProvider } from "@/components/ThemeProvider";
import { QuickAddTransaction } from "@/components/QuickAddTransaction";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MoneyTrackr - Smart Financial Tracking",
  description: "Take control of your finances with our intuitive expense tracker. Monitor income, track expenses, and gain insights.",
  manifest: "/manifest.json",
  themeColor: "#3b82f6",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MoneyTrackr"
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/logo.png"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="MoneyTrackr" />
        <link rel="apple-touch-icon" href="/logo.png" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}>
        <ThemeProvider>
          <ToastProvider>
            <LoaderProvider>
              <Navbar />
              <main className="flex-1">
                {children}
              </main>
              <Footer />
              <FloatingAddButton />
              <PWAInstaller />
              <QuickAddTransaction userEmail="" />
            </LoaderProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
