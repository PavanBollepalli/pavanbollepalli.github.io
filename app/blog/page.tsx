import type { Metadata } from "next";
import { BlogIndex } from "@/components/reference-pages";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata("Engineering blog", "Field notes and writing on backend systems, retrieval, AI reliability, and software engineering.", "/blog");
export default function BlogPage() { return <BlogIndex/>; }
