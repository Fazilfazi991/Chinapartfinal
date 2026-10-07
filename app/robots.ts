import type {MetadataRoute} from 'next';
import {approvedSiteOrigin} from '../lib/site-indexing.mjs';
export const dynamic='force-dynamic';
export default function robots():MetadataRoute.Robots{const origin=approvedSiteOrigin();return origin?{rules:{userAgent:'*',allow:'/',disallow:['/staff','/customer-access','/preview','/api/','/request']},sitemap:origin+'/sitemap.xml'}:{rules:{userAgent:'*',disallow:'/'}};}
