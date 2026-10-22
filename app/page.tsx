import type { Metadata } from "next";
import Image from "next/image";
import { ArrowUpRight, MessageCircle } from "lucide-react";
import { salesContact } from "../lib/sourcing-config.mjs";
import styles from "./launching-soon.module.css";

export const metadata: Metadata = {
  title: "Launching Soon | China Parts Shop",
  description: "Our new website is launching soon. Contact China Parts Shop for sales enquiries and technical support.",
  robots: { index: false, follow: false },
};

export default function Home() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <img src="/cps-logo.png" width="52" height="52" alt="China Parts Shop" />
        <div className={styles.brand}>CHINA PARTS <strong>SHOP</strong></div>
      </header>
      <main className={styles.content}>
        <div className={styles.introduction}>
          <h1>Launching <span>soon.</span></h1>
          <p>We’re preparing our new website.</p>
          <figure className={styles.banner}>
            <Image
              src="/sourcing/launch-banner.png"
              alt="China Parts Shop banner featuring automotive parts, a truck, excavator and SUV"
              width={901}
              height={334}
              sizes="(max-width:760px) calc(100vw - 48px), 60vw"
              priority
            />
          </figure>
        </div>
        <section className={styles.contact} aria-labelledby="sales-heading">
          <h2 id="sales-heading">For sales enquiries &amp; technical support</h2>
          <p className={styles.number}>{salesContact.display}</p>
          <a className={styles.email} href="mailto:parts@chinapartsshop.com">parts@chinapartsshop.com</a>
          <a className={styles.whatsapp} href={`https://wa.me/${salesContact.number}`} target="_blank" rel="noopener noreferrer" aria-label={`WhatsApp sales on ${salesContact.display} (opens in a new tab)`}>
            <MessageCircle size={21} aria-hidden="true" />
            WhatsApp
            <ArrowUpRight size={20} aria-hidden="true" />
          </a>
        </section>
      </main>
      <footer className={styles.footer}>Automotive &amp; equipment parts sourcing</footer>
    </div>
  );
}
