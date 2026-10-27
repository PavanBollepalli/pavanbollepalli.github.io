import type { Metadata } from "next";
import { UsesPage } from "@/components/reference-pages";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata("Uses", "Hardware and software used to research, build, review, and ship.", "/uses");
export default function Page() { return <UsesPage/>; }
