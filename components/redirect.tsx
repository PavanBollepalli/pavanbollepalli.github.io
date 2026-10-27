"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Static-export stand-in for a server redirect.
 *
 * `output: "export"` produces a folder of files and no server to answer with a 3xx, so
 * an alias route ships a page that forwards itself: the router for visitors with
 * JavaScript, a meta refresh for anything reading the raw HTML, and a real link for
 * whatever is left.
 */
export function RedirectTo({ href, label }: { href: string; label: string }) {
  const router = useRouter();
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH?.trim() ?? "";

  useEffect(() => {
    router.replace(href);
  }, [href, router]);

  return (
    <div className="alias-page">
      <meta httpEquiv="refresh" content={`0;url=${basePath}${href}`} />
      <p className="eyebrow">THIS PAGE MOVED</p>
      <p>{label}</p>
      <Link href={href} className="text-link">Continue</Link>
    </div>
  );
}
