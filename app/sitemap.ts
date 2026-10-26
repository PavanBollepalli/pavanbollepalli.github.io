import type { MetadataRoute } from "next";
import { projects,notes } from "@/lib/content";
export default function sitemap():MetadataRoute.Sitemap{return ["","/about","/work","/notes",...projects.map(project=>`/work/${project.slug}`),...notes.map(note=>`/notes/${note.slug}`)].map(path=>({url:`https://pavanbollepalli.me${path}`,changeFrequency:"monthly",priority:path===""?1:.7}));}
