import type { Metadata } from "next";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { ClientProviders } from "@/components/ClientProviders";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://aloraadvisory.com";
const gtmId = process.env.NEXT_PUBLIC_GTM_CONTAINER_ID;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Alora Advisory | Market Research and Strategic Advisory",
    template: "%s | Alora Advisory",
  },
  description:
    "Alora Advisory is a premier management consulting firm helping Fortune 500 companies navigate complexity and achieve transformational results through strategy, operations, and digital transformation.",
  alternates: {
    canonical: siteUrl,
    types: {
      "application/rss+xml": [
        { url: "/insights/rss.xml", title: "Alora Advisory Insights" },
        { url: "/newsroom/rss.xml", title: "Alora Advisory Newsroom" },
      ],
    },
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    title: "Alora Advisory | Market Research and Strategic Advisory",
    description:
      "Partnering with leading organizations to solve their most complex challenges and capture their greatest opportunities.",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground">
        {gtmId ? (
          <>
            <Script id="gtm-init" strategy="afterInteractive">
              {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
 j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
 'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmId}');`}
            </Script>
            <noscript>
              <iframe
                src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
                height="0"
                width="0"
                style={{ display: "none", visibility: "hidden" }}
              />
            </noscript>
          </>
        ) : null}
        {children}
        <ClientProviders />
        <Analytics />
      </body>
    </html>
  );
}
