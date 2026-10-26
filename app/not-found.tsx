import Link from "next/link";
import { ArrowRight } from "lucide-react";
export default function NotFound(){return <div className="not-found"><span className="eyebrow">404 / UNCHARTED TERRITORY</span><h1>This path ends here.</h1><p>Let’s take you somewhere worth exploring.</p><Link href="/" className="button button-primary">Back to home <ArrowRight size={17}/></Link></div>;}
