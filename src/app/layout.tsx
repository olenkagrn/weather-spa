import ReduxProvider from "@/components/Providers/ReduxProvider";
import "./globals.css";
import { Metadata } from 'next';
import { Suspense } from 'react';
import Loading from "./loading";

export const metadata: Metadata = {
  title: 'Personal Weather Tracker',
  description: 'Track weather in your favorite cities',
  keywords: ['weather', 'forecast', 'cities', 'temperature'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ReduxProvider>
          <Suspense fallback={<Loading />}>
            {children}
          </Suspense>
        </ReduxProvider>
      </body>
    </html>
  );
}
