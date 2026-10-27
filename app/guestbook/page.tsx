import type { Metadata } from "next";
import { GuestbookPage } from "@/components/reference-pages";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata("Guestbook", "Leave a note for Pavan and start a conversation.", "/guestbook");
export default function Page() { return <GuestbookPage/>; }
