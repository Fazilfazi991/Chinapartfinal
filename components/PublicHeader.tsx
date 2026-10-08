"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X, Search, ArrowRight, Wrench } from "lucide-react";
import { publicCopy } from "../lib/locale.mjs";
const links = publicCopy().navigation;
export default function PublicHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  return (
    <header className="public-header restored-header">
      <div className="header-main">
        <a className="public-brand" href="/" aria-label="China Parts Shop home">
          <img src="/cps-logo.png" width="48" height="48" alt="" />
          <span>
            CHINA PARTS <strong>SHOP</strong>
            <small>Your sourcing partner</small>
          </span>
        </a>
        <form
          className="header-requirement"
          action="/find-your-part"
          method="get"
          aria-label="Start a parts requirement"
        >
          <Search size={19} aria-hidden="true" />
          <label className="sr-only" htmlFor="header-part">
            Part description or reference
          </label>
          <input
            id="header-part"
            name="description"
            placeholder="Describe the part or reference you have"
            maxLength={600}
          />
          <button type="submit">
            Find Your Part <ArrowRight size={17} />
          </button>
        </form>
        <a className="header-technical" href="/technical-assistance">
          <Wrench size={18} /> Technical Assistance
        </a>
        <a className="header-enquiry" href="/request">
          Send Your Enquiry <ArrowRight size={17} />
        </a>
        <button
          className="public-menu"
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
          aria-controls="public-nav"
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
      <nav
        id="public-nav"
        className={open ? "public-nav is-open" : "public-nav"}
        aria-label="Main navigation"
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setOpen(false);
            document.querySelector<HTMLButtonElement>(".public-menu")?.focus();
          }
        }}
      >
        {links.map(([label, href]) => (
          <a
            key={label}
            href={href}
            aria-current={
              (
                href === "/"
                  ? pathname === "/"
                  : pathname === href ||
                    pathname.startsWith(href + "/") ||
                    (href === "/find-your-part" && pathname === "/request")
              )
                ? "page"
                : undefined
            }
            onClick={() => setOpen(false)}
          >
            {label}
          </a>
        ))}
      </nav>
    </header>
  );
}
