import type { Metadata } from "next";
import { LegalPage } from "@/components/reference-pages";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata("Privacy", "Privacy information for this portfolio website.", "/legal/privacy");
export default function Page() { return <LegalPage kind="privacy"/>; }
