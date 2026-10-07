import {notFound,redirect} from "next/navigation";
import {articles} from "../../../lib/sourcing-pages.mjs";
export function generateStaticParams(){return articles.map(a=>({slug:a.legacy}));}
export default async function LegacyGuide({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const article=articles.find(a=>a.legacy===slug);if(!article)notFound();redirect("/resources/"+article.slug);}
