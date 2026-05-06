import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Forja Store",
  description: "Los mejores productos, los mejores precios.",
  keywords: ["Forja", "Store", "tienda", "online", "productos"],
  icons: {
    icon: "/forja-logo.jpg",
  },
  openGraph: {
    title: "Forja Store",
    description: "Los mejores productos, los mejores precios.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var config = sessionStorage.getItem('store-config');
                  if (config) {
                    var c = JSON.parse(config);
                    if (c.STORE_TITLE) document.title = c.STORE_TITLE;
                    if (c.STORE_FAVICON) {
                      var link = document.querySelector("link[rel~='icon']") || document.createElement('link');
                      link.rel = 'icon';
                      link.href = c.STORE_FAVICON;
                      document.head.appendChild(link);
                    }
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
