import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./context/ThemeContext";
import { ServiceWorkerRegistration, OfflineIndicator } from "./components";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "NeuralNews · AI-curated tech news",
    template: "%s",
  },
  description:
    "AI-curated tech news from 20+ sources. AI/ML breakthroughs, model releases, benchmarks, and industry news scored for relevance.",
  keywords: ["AI news", "machine learning", "LLM", "tech news", "Anthropic", "OpenAI", "benchmarks"],
  applicationName: "NeuralNews",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "NeuralNews",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <OfflineIndicator />
          {children}
          <ServiceWorkerRegistration />
        </ThemeProvider>
      </body>
    </html>
  );
}
