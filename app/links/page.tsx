import type { Metadata } from "next";
import { LinksPage } from "@/components/reference-pages";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata("Links", "Connect with Pavan and explore selected projects.", "/links");
export default function Page() { return <LinksPage/>; }
