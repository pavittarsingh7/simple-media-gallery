import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider, StatsProvider } from "@/components/providers/theme-provider";
import { HeroUIProvider } from "@/components/providers/heroui-provider";
import { StartupScanner } from "@/components/providers/startup-scanner";
import "./globals.css";

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
    default: "Media Gallery",
    template: "%s | Media Gallery",
  },
  description: "A modern media gallery for photos and videos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <HeroUIProvider>
            <StatsProvider>
              <TooltipProvider>
                <StartupScanner />
                {children}
              </TooltipProvider>
            </StatsProvider>
          </HeroUIProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
