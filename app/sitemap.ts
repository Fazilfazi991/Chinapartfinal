import type {MetadataRoute} from 'next';
import {publicContentClient} from '../lib/public-content';
import {readPublicSitemap,staticSitemap} from '../lib/public-index.mjs';
export const dynamic='force-dynamic';
export default async function sitemap():Promise<MetadataRoute.Sitemap>{try{return await readPublicSitemap(publicContentClient());}catch{return staticSitemap();}}
