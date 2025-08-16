import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'GeoSnap',
  description: 'Map your memories',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter&display=swap" rel="stylesheet" />
        <Script
          id="amap-loader"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window._AMapSecurityConfig = {
                securityJsCode: '${process.env.NEXT_PUBLIC_AMAP_SECURITY_KEY}',
              };
            `,
          }}
        />
        <Script
          src={`https://webapi.amap.com/maps?v=2.0&key=${process.env.NEXT_PUBLIC_AMAP_API_KEY}`}
          strategy="beforeInteractive"
        />
      </head>
      <body className="font-body antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
