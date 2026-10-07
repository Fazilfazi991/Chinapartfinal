"use client";
import { useEffect, useRef, useState } from "react";
import {
  vendorBlank,
  vendorFields,
  vendorLabels,
  validateVendor,
} from "../lib/vendor-domain.mjs";
import PublicHeader from "./PublicHeader";
import Challenge from "./Challenge";
export default function SupplierForm({
  mode,
  siteKey,
  embedded=false,
}: {
  mode: "local" | "supabase" | "disabled";
  embedded?:boolean;
  siteKey?: string;
}) {
  const [data, setData] = useState({ ...vendorBlank }),
    [id, setId] = useState(""),
    [errors, setErrors] = useState<Record<string, string>>({}),
    [notice, setNotice] = useState(""),
    [pending, setPending] = useState(false),
    [reference, setReference] = useState(""),
    [local, setLocal] = useState(mode === "local"),
    [challenge, setChallenge] = useState(""),
    [resetKey, setResetKey] = useState(0);
  const busy = useRef(false),
    heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => setId(crypto.randomUUID()), []);
  async function submit() {
    if (busy.current) return;
    const found = validateVendor(data);
    setErrors(found);
    if (Object.keys(found).length) {
      setNotice("Please correct the marked fields.");
      document
        .getElementById("supplier-" + vendorFields.find((key) => found[key]))
        ?.focus();
      return;
    }
    if (mode === "disabled") {
      setNotice(
        "Supplier registration submission is not available yet. Your details remain on this page.",
      );
      return;
    }
    busy.current = true;
    setPending(true);
    setNotice("");
    try {
      const response = await fetch("/api/vendors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data,
          submissionId: id,
          challenge,
          website: "",
        }),
        signal: AbortSignal.timeout(30000),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(
          result.error ||
            "Supplier registration could not be saved. Please retry.",
        );
      if (
        typeof result.localTest !== "boolean" ||
        !/^CPS-(?:LOCAL-)?VEN-[A-Z0-9]+$/.test(result.reference || "")
      )
        throw new Error("Registration could not be confirmed. Please retry.");
      setReference(result.reference);
      setLocal(result.localTest);
      requestAnimationFrame(() => heading.current?.focus());
    } catch (error) {
      setNotice(
        error instanceof Error && error.name !== "TimeoutError"
          ? error.message
          : "The connection timed out. Your details are retained; please retry.",
      );
    } finally {
      busy.current = false;
      setPending(false);
      setResetKey((old) => old + 1);
    }
  }
  const PageContainer=embedded?"div":"main";
  const SuccessHeading=embedded?"h2":"h1";
  return (
    <>
      {!embedded && <PublicHeader />}
      <PageContainer className={embedded?"request-page embedded-supplier":"request-page"}>
        <section className="request-shell supplier-shell">
          {reference ? (
            <div className="request-success">
              <SuccessHeading ref={heading} tabIndex={-1}>
                {local
                  ? "Your test registration is saved"
                  : "Supplier registration received"}
              </SuccessHeading>
              <p>
                Vendor reference:{" "}
                <strong className="supplier-reference">{reference}</strong>
              </p>
              <p>
                {local
                  ? "Stored on this development computer for testing. No registration has been sent to the company."
                  : "Keep this reference for correspondence. The team will review your company information. Registration does not establish approval or a supply agreement."}
              </p>
              <p>This reference is not a login or access credential.</p>
              <a href="/">Return to website</a>
            </div>
          ) : (
            <>
              {embedded?<h2>Supplier Registration</h2>:<h1>Supplier Registration</h1>}
              <p className="supplier-intro">
                Tell us about your company and the parts you supply. The
                sourcing team reviews registrations individually.
              </p>
              {mode !== "supabase" && (
                <p className="request-mode">
                  {mode === "local"
                    ? "Local testing · synthetic company details only"
                    : "Registration submission is not available in this review build. Do not enter confidential information."}
                </p>
              )}
              <p className="supplier-required">
                Company, contact person, country and product range are required.
                Provide an email address or mobile number.
              </p>
              <form
                className="supplier-form"
                noValidate
                onSubmit={(e) => {
                  e.preventDefault();
                  submit();
                }}
              >
                {[
                  ["Your company & contact", vendorFields.slice(0, 5)],
                  ["Your supply capabilities", vendorFields.slice(5)],
                ].map(([title, fields]) => (
                  <section className="supplier-group" key={title as string}>
                    <h2>{title}</h2>
                    <div className="request-fields">
                      {(fields as string[]).map((key) => (
                        <div
                          key={key}
                          className={
                            ["products", "remarks"].includes(key)
                              ? "request-full"
                              : undefined
                          }
                        >
                          <label htmlFor={"supplier-" + key}>
                            {vendorLabels[key]}
                            {[
                              "company",
                              "contact",
                              "country",
                              "products",
                            ].includes(key)
                              ? " *"
                              : ["brands", "categories", "remarks"].includes(
                                    key,
                                  )
                                ? " (optional)"
                                : ""}
                          </label>
                          {[
                            "products",
                            "brands",
                            "categories",
                            "remarks",
                          ].includes(key) ? (
                            <textarea
                              id={"supplier-" + key}
                              value={data[key]}
                              maxLength={2000}
                              rows={3}
                              disabled={pending}
                              onChange={(e) =>
                                setData((old) => ({
                                  ...old,
                                  [key]: e.target.value,
                                }))
                              }
                              aria-invalid={!!errors[key]}
                              aria-describedby={
                                errors[key]
                                  ? "supplier-" + key + "-error"
                                  : undefined
                              }
                            />
                          ) : (
                            <input
                              id={"supplier-" + key}
                              value={data[key]}
                              type={
                                key === "email"
                                  ? "email"
                                  : key === "mobile"
                                    ? "tel"
                                    : "text"
                              }
                              required={[
                                "company",
                                "contact",
                                "country",
                              ].includes(key)}
                              maxLength={200}
                              disabled={pending}
                              autoComplete={
                                key === "email"
                                  ? "email"
                                  : key === "mobile"
                                    ? "tel"
                                    : key === "company"
                                      ? "organization"
                                      : key === "contact"
                                        ? "name"
                                        : key === "country"
                                          ? "country-name"
                                          : "off"
                              }
                              onChange={(e) =>
                                setData((old) => ({
                                  ...old,
                                  [key]: e.target.value,
                                }))
                              }
                              aria-invalid={!!errors[key]}
                              aria-describedby={
                                errors[key]
                                  ? "supplier-" + key + "-error"
                                  : undefined
                              }
                            />
                          )}{" "}
                          {errors[key] && (
                            <p
                              id={"supplier-" + key + "-error"}
                              className="request-error"
                            >
                              {errors[key]}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                ))}
                <p className="request-help">
                  Your details stay private to authorized staff. Registration
                  does not create an account or automatically distribute
                  customer enquiries.
                </p>
                {notice && (
                  <p role="alert" className="request-notice">
                    {notice}
                  </p>
                )}
                {mode === "supabase" && siteKey && (
                  <Challenge
                    siteKey={siteKey}
                    action="vendor_registration"
                    onToken={setChallenge}
                    resetKey={resetKey}
                  />
                )}
                <div className="request-actions">
                  <button
                    className="request-primary"
                    disabled={
                      !id ||
                      pending ||
                      mode === "disabled" ||
                      (mode === "supabase" && !challenge)
                    }
                  >
                    {pending
                      ? "Saving registration…"
                      : mode === "local"
                        ? "Save local test registration"
                        : mode === "disabled"
                          ? "Submission not available"
                          : "Send Supplier Registration"}
                  </button>
                  <a href="/">Back to website</a>
                </div>
              </form>
            </>
          )}
        </section>
      </PageContainer>
    </>
  );
}
