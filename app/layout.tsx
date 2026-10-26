import type { Metadata } from "next";
import { MotionProvider, ScrollProgress } from "@/components/motion";
import { Footer, Navigation } from "@/components/shell";
import { profile } from "@/lib/content";
import { siteDescription, siteUrl } from "@/lib/seo";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Pavan Bollepalli — Backend & AI Engineer", template: "%s | Pavan Bollepalli" },
  description: siteDescription,
  authors: [{ name: profile.name, url: siteUrl }],
  creator: profile.name,
  robots: { index: true, follow: true },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "Person", "@id": `${siteUrl}/#person`, name: profile.name, url: siteUrl, image: `${siteUrl}/assets/avatar.jpg`, jobTitle: "Backend & AI Engineer", sameAs: [profile.github, profile.linkedin] },
    { "@type": "WebSite", "@id": `${siteUrl}/#website`, name: "Pavan Bollepalli — Backend & AI Engineer", url: siteUrl, description: siteDescription, author: { "@id": `${siteUrl}/#person` } },
  ],
};

const themeScript = `try{var t=localStorage.getItem('portfolio-theme');document.documentElement.dataset.theme=t==='light'?'light':'dark'}catch(e){document.documentElement.dataset.theme='dark'}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en" data-theme="dark" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{__html:themeScript}}/><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(structuredData).replace(/</g,"\\u003c")}}/></head><body><a href="#main-content" className="skip-link">Skip to content</a><MotionProvider><ScrollProgress/><Navigation/><div className="site-shell"><main id="main-content" tabIndex={-1}>{children}</main><Footer/></div></MotionProvider></body></html>;
}
