import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: 'GeoSnap',
  description: 'Map your memories',
};

declare global {
  interface Window {
    _AMapSecurityConfig: any;
    AMap: any;
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const amapApiKey = process.env.NEXT_PUBLIC_AMAP_API_KEY || '';
  const amapSecurityCode = process.env.NEXT_PUBLIC_AMAP_SECURITY_CODE || '';

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter&display=swap" rel="stylesheet" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window._AMapSecurityConfig = {
                securityJsCode: '${amapSecurityCode}',
              };
            `,
          }}
        />
        <script
          type="text/javascript"
          src={`https://webapi.amap.com/maps?v=2.0&key=${amapApiKey}`}
        ></script>
      </head>
      <body className="font-body antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
