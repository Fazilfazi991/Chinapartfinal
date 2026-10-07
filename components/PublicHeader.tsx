"use client";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import {publicCopy} from '../lib/locale.mjs';
const links=publicCopy().navigation;
export default function PublicHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="public-header">
      <a className="public-brand" href="/" aria-label="China Parts Shop home">
        <img src="/cps-logo.png" width="44" height="44" alt="" />
        <span>
          CHINA PARTS <strong>SHOP</strong>
        </span>
      </a>
      <nav
        id="public-nav"
        className={open ? "public-nav is-open" : "public-nav"}
        aria-label="Main navigation"
      >
        {links.map(([label, href]) => (
          <a key={label} href={href} onClick={() => setOpen(false)}>
            {label}
          </a>
        ))}
      </nav>
      <button
        className="public-menu"
        aria-label={open ? "Close navigation" : "Open navigation"}
        aria-expanded={open}
        aria-controls="public-nav"
        onClick={() => setOpen(!open)}
      >
        {open ? <X /> : <Menu />}
      </button>
    </header>
  );
}
