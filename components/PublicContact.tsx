"use client";
import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { salesHref } from "../lib/sourcing-config.mjs";
export default function PublicContact() {
  const path = usePathname();
  if (/^\/(?:staff|workspace|preview|api|auth)(?:\/|$)/.test(path)) return null;
  return (
    <a
      className="public-whatsapp"
      data-floating-whatsapp
      href={salesHref()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp Sales (opens WhatsApp)"
    >
      <MessageCircle size={22} />
      <span>WhatsApp Sales</span>
    </a>
  );
}
