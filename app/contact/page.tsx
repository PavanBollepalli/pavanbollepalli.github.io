import type { Metadata } from "next";
import { ContactPage } from "@/components/reference-pages";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata("Contact", "Get in touch about backend and AI engineering roles or project work.", "/contact");
export default function Page() { return <ContactPage/>; }
