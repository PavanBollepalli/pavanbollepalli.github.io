import type { Metadata } from "next";
import { BucketListPage } from "@/components/reference-pages";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata("Milestones", "Work shipped, lessons earned, and what Pavan is moving toward.", "/bucket-list");
export default function Page() { return <BucketListPage/>; }
