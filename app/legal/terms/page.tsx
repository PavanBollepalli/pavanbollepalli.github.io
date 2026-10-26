import type { Metadata } from "next";
import { LegalPage } from "@/components/reference-pages";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata("Terms", "Terms for using this portfolio website.", "/legal/terms");
export default function Page() { return <LegalPage kind="terms"/>; }
