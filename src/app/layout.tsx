import ReduxProvider from "@/components/Providers/ReduxProvider";
import "./globals.css";
import { Metadata, Viewport } from "next";
import { Suspense } from "react";
import Loading from "./loading";

export const metadata: Metadata = {
  title: "Personal Weather Tracker",
  description: "Track weather in your favorite cities",
  keywords: ["weather", "forecast", "cities", "temperature"],
  authors: [{ name: "Olena Hrynko" }],
  creator: "Weather App",
  publisher: "Weather App",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: "/favicon.svg",
    apple: "/apple-touch-icon.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#1E40AF",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.svg" />

        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Weather App" />

        <meta
          name="Cache-Control"
          content="public, max-age=31536000, immutable"
        />
        <link rel="preconnect" href="https://api.openweathermap.org" />
        <link rel="preconnect" href="https://openweathermap.org" />
      </head>
      <body>
        <ReduxProvider>
          <Suspense fallback={<Loading />}>{children}</Suspense>
        </ReduxProvider>
      </body>
    </html>
  );
}
