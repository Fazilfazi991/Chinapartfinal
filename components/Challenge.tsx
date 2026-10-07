"use client";
import Script from 'next/script';
import {useEffect,useRef,useState} from 'react';
type Turnstile={render:(element:HTMLElement,options:Record<string,unknown>)=>string;remove:(id:string)=>void};
declare global {interface Window {turnstile?:Turnstile}}
export default function Challenge({siteKey,onToken,resetKey}:{siteKey:string;onToken:(token:string)=>void;resetKey:number}){
  const host=useRef<HTMLDivElement>(null),callback=useRef(onToken);callback.current=onToken;
  const [loaded,setLoaded]=useState(false);
  useEffect(()=>{
    if(!loaded||!host.current||!window.turnstile)return;
    const id=window.turnstile.render(host.current,{sitekey:siteKey,action:'rfq',callback:(token:string)=>callback.current(token),'expired-callback':()=>callback.current(''),'error-callback':()=>callback.current('')});
    return ()=>{window.turnstile?.remove(id);callback.current('');};
  },[loaded,siteKey,resetKey]);
  return <><Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" onReady={()=>setLoaded(true)}/><div ref={host} aria-label="Security check"/></>;
}
