"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, Search } from "lucide-react";
import { notes } from "@/lib/content";
import { EASE, SpotlightCard, useReducedMotionPreference } from "./motion";

const topics = ["ALL POSTS", ...Array.from(new Set(notes.map(note => note.category)))];

export function BlogExplorer() {
  const soft = useReducedMotionPreference();
  const [topic, setTopic] = useState("ALL POSTS");
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => notes.filter(note => {
    const matchesTopic = topic === "ALL POSTS" || note.category === topic;
    const haystack = `${note.title} ${note.subtitle} ${note.category} ${note.paragraphs.join(" ")}`.toLowerCase();
    return matchesTopic && haystack.includes(query.trim().toLowerCase());
  }), [topic, query]);

  return <section className="blog-explorer framed">
    <div className="blog-controls"><div className="blog-topics" role="group" aria-label="Filter articles by topic">{topics.map(item => <button type="button" key={item} aria-pressed={topic === item} onClick={() => setTopic(item)}>{item}</button>)}</div><label className="blog-search"><Search size={16}/><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search articles" aria-label="Search articles"/></label></div>
    <div className="blog-results-count" aria-live="polite">{filtered.length} {filtered.length === 1 ? "ARTICLE" : "ARTICLES"}</div>
    {filtered.length ? <motion.div layout className="notes-grid texture">{<AnimatePresence mode="popLayout" initial={false}>{filtered.map((note,index) => <motion.div key={note.slug} layout initial={soft ? { opacity: 0 } : { opacity: 0, y: 18, scale: .97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={soft ? { opacity: 0 } : { opacity: 0, y: -12, scale: .97 }} transition={{ duration: .45, delay: soft ? 0 : index * .05, ease: EASE }}><SpotlightCard className="note-spot"><Link href={`/blog/${note.slug}`} className={`note-card note-${note.theme}`}>
      <div className="note-art" aria-hidden="true"><span className="note-art-index">FIELD NOTES / {note.number}</span>{note.number === "01" ? <div className="note-bars"><i/><i/><i/><i/><span>9.6s → 0.48s</span></div> : note.number === "02" ? <div className="note-shield"><span>EVIDENCE &gt; CONFIDENCE</span></div> : <div className="note-code"><span>CREATE INDEX</span><strong>better_answers</strong><span>ON the_fundamentals;</span></div>}</div>
      <div className="note-copy"><span className="eyebrow">{note.category}</span><h3>{note.title}</h3><p>{note.subtitle}</p><span className="note-read">Read article <ArrowUpRight size={16}/></span></div>
    </Link></SpotlightCard></motion.div>)}</AnimatePresence>}</motion.div> : <div className="blog-empty"><span className="eyebrow">NO MATCHES</span><p>Try a different search or topic.</p></div>}
  </section>;
}
