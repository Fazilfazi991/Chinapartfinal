'use client';
import {useActionState} from 'react';
import {requestCustomerRecovery} from '../app/customer-access/actions';
export default function CustomerRecoveryForm(){
 const [state,action,pending]=useActionState(requestCustomerRecovery,{message:'',error:false});
 return <form action={action} className="request-fields"><fieldset disabled={pending}><div><label htmlFor="recovery-email">Account email</label><input id="recovery-email" name="email" type="email" autoComplete="email" required maxLength={254}/></div><button className="request-primary" type="submit">{pending?'Requesting reset.':'Request password reset'}</button></fieldset>{state.message&&<p role={state.error?'alert':'status'}>{state.message}</p>}</form>;
}
