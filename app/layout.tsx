import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AppLayoutClient } from "@/components/app-layout-client";

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_APP_NAME || "H2H DO Listener & Viewer",
  description: "Production-ready Webhook Listener, JSON Payload Viewer & H2H Delivery Order Monitoring Dashboard.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <AppLayoutClient>{children}</AppLayoutClient>
        </ThemeProvider>
      </body>
    </html>
  );
}
