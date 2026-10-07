import RfqForm from '../../components/RfqForm';
import {backendMode,uploadsEnabled} from '../../lib/config.mjs';
export const dynamic='force-dynamic';
export const metadata = {title:'Request a part | China Parts Shop'};
export default function RequestPage(){const mode=backendMode();return <RfqForm mode={mode} allowUploads={uploadsEnabled()} siteKey={mode==='supabase'?process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY:undefined}/>;}
