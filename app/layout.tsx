import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/theme-provider";
import { AuthProvider } from "@/providers/auth-provider";
import { FirebaseProvider } from "@/providers/firebase-provider";
import { AuthGuard } from "@/components/shared/auth-guard";
import { Toaster } from "sonner";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://selvo.app";

export const metadata: Metadata = {
  title: {
    default: "Selvo — Personal Finance Tracker | Own Your Data",
    template: "%s | Selvo",
  },
  description:
    "Track income, expenses, and budgets with full data ownership. Bring your own Firebase — no ads, no tracking. Sync across mobile and web in real time.",
  keywords: [
    "personal finance tracker",
    "expense tracker",
    "budget tracker",
    "firebase finance app",
    "income expense manager",
    "money management",
    "splitwise integration",
    "open source finance",
    "privacy first finance",
    "selvo",
  ],
  authors: [{ name: "Selvo" }],
  creator: "Selvo",
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "Selvo",
    title: "Selvo — Personal Finance Tracker | Own Your Data",
    description:
      "Track income, expenses, and budgets with full data ownership. Bring your own Firebase — no ads, no tracking.",
    images: [
      {
        url: "/assets/dashboard-preview.png",
        width: 1920,
        height: 1024,
        alt: "Selvo Dashboard Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Selvo — Personal Finance Tracker | Own Your Data",
    description:
      "Track income, expenses, and budgets with full data ownership. Bring your own Firebase — no ads, no tracking.",
    images: ["/assets/dashboard-preview.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/assets/logo.png", type: "image/png", sizes: "192x192" },
    ],
    apple: { url: "/assets/logo.png", sizes: "180x180" },
  },
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} ${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-background text-foreground antialiased">
        <ThemeProvider>
          <AuthProvider>
            <FirebaseProvider>
              <AuthGuard>
                {children}
              </AuthGuard>
            </FirebaseProvider>
            <Toaster richColors position="bottom-right" />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
