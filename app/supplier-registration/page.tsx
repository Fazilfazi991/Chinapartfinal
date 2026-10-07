import SupplierForm from "../../components/SupplierForm";
import { vendorBackendMode } from "../../lib/config.mjs";
export const dynamic = "force-dynamic";
export const metadata = { title: "Supplier Registration | China Parts Shop" };
export default function SupplierRegistration() {
  const mode = vendorBackendMode();
  return (
    <SupplierForm
      mode={mode}
      siteKey={
        mode === "supabase"
          ? process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
          : undefined
      }
    />
  );
}
