import Link from 'next/link';
import {authConfigured} from '../../../lib/supabase/server';
import {customerRecoveryEnabled} from '../../../lib/customer-auth.mjs';
import CustomerRecoveryForm from '../../../components/CustomerRecoveryForm';
export const dynamic='force-dynamic';
export default function Recovery(){const enabled=authConfigured()&&customerRecoveryEnabled();return <main className="request-page"><section className="request-shell"><Link href="/customer-access">Back to sign in</Link><h1>Reset your account password</h1>{enabled?<><p>Enter your account email. If it belongs to an eligible account, the provider will email a reset link. This does not register an account or change company access.</p><CustomerRecoveryForm/></>:<p>Password recovery is not activated yet. Contact the sourcing team through its approved support channel.</p>}</section></main>;}
