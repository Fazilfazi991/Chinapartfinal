"use client";
import { useEffect, useRef, useState } from "react";
import {
  blank,
  fields,
  requiredFields,
  restoreDraft,
  validate,
} from "../lib/rfq.mjs";
import Challenge from "./Challenge";
import PublicHeader from "./PublicHeader";
import {
  categories as sourcingCategories,
  qualityOptions,
  entryData,
} from "../lib/sourcing-config.mjs";
const titles = [
  "Contact details",
  "Vehicle or equipment",
  "Part requirement",
  "Attachments",
  "Review your request",
];
const labels: Record<string, string> = {
  name: "Full name",
  company: "Company",
  email: "Email",
  phone: "Telephone with country code",
  country: "Country",
  category: "Vehicle or equipment category",
  brand: "Brand",
  model: "Model",
  year: "Year",
  vin: "VIN or chassis number",
  description: "Part description",
  oem: "OEM number",
  quantity: "Quantity",
  quality: "Quality preference",
};
const groups = [
  ["name", "company", "email", "phone", "country"],
  ["category", "brand", "model", "year", "vin"],
  ["description", "oem", "quantity", "quality"],
];
const categories = [...sourcingCategories.map((item) => item.value), "Other"];
const qualities = [...qualityOptions, "Please advise"];
const optionalFields = new Set([
  "company",
  "brand",
  "model",
  "year",
  "vin",
  "quality",
]);
export default function RfqForm({
  mode = "local",
  allowUploads = true,
  siteKey,
  embedded=false,
}: {
  mode?: "local" | "supabase" | "disabled";
  embedded?: boolean;
  allowUploads?: boolean;
  siteKey?: string;
}) {
  const [data, setData] = useState<Record<string, string>>({ ...blank });
  const [step, setStep] = useState(1),
    [id, setId] = useState(""),
    [ready, setReady] = useState(false);
  const [files, setFiles] = useState<File[]>([]),
    [errors, setErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState(""),
    [pending, setPending] = useState(false),
    [reference, setReference] = useState("");
  const [localTest, setLocalTest] = useState(mode === "local"),
    [challenge, setChallenge] = useState(""),
    [challengeReset, setChallengeReset] = useState(0);
  const [remember, setRemember] = useState(false),
    [storageError, setStorageError] = useState("");
  const heading = useRef<HTMLHeadingElement>(null),
    submitting = useRef(false);
  useEffect(() => {
    let restored = null;
    try {
      restored = restoreDraft(localStorage.getItem("cps-rfq-draft"));
    } catch {
      setStorageError(
        "Browser storage is unavailable. Keep this page open to retain your request.",
      );
    }
    const entry = entryData(window.location.search);
    let requirement: Record<string, string> = {};
    if (!Object.keys(entry).length) {
      try {
        const navigation = performance.getEntriesByType("navigation")[0] as
          | PerformanceNavigationTiming
          | undefined;
        if (
          navigation?.type === "reload" ||
          navigation?.type === "back_forward"
        ) {
          const saved = JSON.parse(
            sessionStorage.getItem("cps-requirement-entry") || "null",
          );
          if (saved && Date.now() - saved.savedAt < 86400000)
            requirement = entryData(new URLSearchParams(saved.data).toString());
        }
      } catch {
        /* Optional requirement continuity; contact data is never stored here. */
      }
    }
    const merged = { ...blank, ...requirement, ...restored?.data, ...entry };
    if (merged.quality && !qualities.includes(merged.quality))
      merged.quality = "Please advise";
    setData(merged);
    if (restored) {
      setRemember(true);
      setNotice(
        Object.keys(entry).length
          ? "Your selected requirement was added. Saved contact details are retained; review before sending."
          : "Your saved draft was restored. Reselect attachments before submitting.",
      );
    }
    setStep(Object.keys(entry).length ? 1 : restored?.step || 1);
    setId(
      Object.keys(entry).length
        ? crypto.randomUUID()
        : restored?.id || crypto.randomUUID(),
    );
    if (window.location.search)
      window.history.replaceState(window.history.state, "", "/request");
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try {
      if (remember && !reference)
        localStorage.setItem(
          "cps-rfq-draft",
          JSON.stringify({ version: 1, data, step, id, savedAt: Date.now() }),
        );
      else localStorage.removeItem("cps-rfq-draft");
    } catch {
      setStorageError(
        "Your draft could not be saved on this device. Keep this page open.",
      );
    }
  }, [data, step, id, remember, ready, reference]);
  useEffect(() => {
    if (!ready) return;
    try {
      if (reference) sessionStorage.removeItem("cps-requirement-entry");
      else
        sessionStorage.setItem(
          "cps-requirement-entry",
          JSON.stringify({
            savedAt: Date.now(),
            data: Object.fromEntries(
              [
                "description",
                "oem",
                "brand",
                "category",
                "model",
                "year",
                "vin",
              ].map((key) => [key, data[key]]),
            ),
          }),
        );
    } catch {
      /* Reload continuity is optional; visible values remain usable. */
    }
  }, [data, ready, reference]);
  useEffect(() => {
    if (ready) heading.current?.focus();
  }, [step, reference, ready]);
  function focusInvalid(found: Record<string, string>) {
    requestAnimationFrame(() => {
      const key = fields.find(
        (field) => found[field] && document.getElementById(field),
      );
      if (key) document.getElementById(key)?.focus();
    });
  }
  function update(key: string, value: string) {
    setData((old) => ({ ...old, [key]: value }));
    setErrors((old) => {
      const copy = { ...old };
      delete copy[key];
      return copy;
    });
  }
  function next() {
    const found = validate(data, step);
    setErrors(found);
    if (Object.keys(found).length) {
      setNotice("Please correct the marked fields.");
      focusInvalid(found);
      return;
    }
    setNotice("");
    setStep(step + 1);
  }
  function chooseFiles(selected: FileList | null) {
    const list = Array.from(selected || []);
    const max = mode === "local" ? 5 : 1;
    if (
      list.length > 3 ||
      list.some(
        (file) =>
          file.size === 0 ||
          file.size > max * 1024 * 1024 ||
          !["image/png", "image/jpeg", "application/pdf"].includes(file.type),
      )
    ) {
      setErrors((old) => ({
        ...old,
        attachments: `Choose up to three PNG, JPEG or PDF files, each no larger than ${max} MB.`,
      }));
      return;
    }
    setFiles(list);
    setErrors((old) => {
      const copy = { ...old };
      delete copy.attachments;
      return copy;
    });
  }
  async function submit() {
    if (submitting.current) return;
    if (mode === "disabled") {
      setNotice(
        "Request submission is not yet available. Your draft can be retained on this device.",
      );
      return;
    }
    const found = validate(data);
    setErrors(found);
    if (Object.keys(found).length) {
      setNotice("Review the marked fields before submitting.");
      setStep(
        found.name || found.email || found.phone || found.country
          ? 1
          : found.category || found.year
            ? 2
            : 3,
      );
      focusInvalid(found);
      return;
    }
    submitting.current = true;
    setPending(true);
    setNotice("");
    try {
      const form = new FormData();
      form.set("data", JSON.stringify(data));
      form.set("submissionId", id);
      form.set("challenge", challenge);
      files.forEach((file) => form.append("attachments", file));
      const response = await fetch("/api/rfq", {
        method: "POST",
        body: form,
        signal: AbortSignal.timeout(mode === "local" ? 20000 : 120000),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(
          result.error || "We could not save your request. Please retry.",
        );
      if (
        typeof result.reference !== "string" ||
        typeof result.localTest !== "boolean"
      )
        throw new Error("Submission could not be confirmed. Please retry.");
      setLocalTest(result.localTest);
      setReference(result.reference);
      setFiles([]);
    } catch (error) {
      setNotice(
        error instanceof Error && error.name !== "TimeoutError"
          ? error.message
          : "The connection timed out. Your draft is retained; please retry.",
      );
    } finally {
      submitting.current = false;
      setPending(false);
      setChallengeReset((old) => old + 1);
    }
  }
  function reset() {
    setData({ ...blank });
    setStep(1);
    setId(crypto.randomUUID());
    setFiles([]);
    setErrors({});
    setReference("");
    setNotice("");
    setRemember(false);
  }
  const PageContainer=embedded?"div":"main";
  const SuccessHeading=embedded?"h2":"h1";
  return (
    <>
      {!embedded && <PublicHeader />}
      <PageContainer className={embedded ? "request-page embedded-enquiry" : "request-page"}>
        <section className="request-shell">
          {mode !== "supabase" && (
            <p className="request-mode">
              {mode === "local"
                ? "Local testing · no request is sent to the company"
                : "Request submission is not yet available. Do not enter confidential information."}
            </p>
          )}
          {reference ? (
            <div className="request-success">
              <SuccessHeading ref={heading} tabIndex={-1}>
                {localTest
                  ? "Your test request is saved"
                  : "Your request has been received"}
              </SuccessHeading>
              <p>
                Reference: <strong>{reference}</strong>
              </p>
              <p>
                {localTest
                  ? "The request is stored on this development computer. It has not been delivered to China Parts Shop."
                  : "Keep this reference for your enquiry. Fitment, availability, pricing and delivery will be confirmed by the sourcing team."}
              </p>
              <button className="request-primary" onClick={reset}>
                Start another request
              </button>
              <a href="/">Return to website</a>
            </div>
          ) : (
            <>
              {embedded ? <h2>Complete your sourcing enquiry</h2> : <h1>
                {data.description.startsWith("Technical assistance — ")
                  ? "Technical assistance"
                  : "Send Your Enquiry"}
              </h1>}
              <p className="request-intro">
                {data.description.startsWith("Technical assistance — ")
                  ? "Ask for human help identifying your part or equipment requirement. Add the details you have below."
                  : "Send the information you have. Part fitment, availability and price require review by the sourcing team."}
              </p>
              <ol className="request-steps" aria-label="Request progress">
                {titles.map((title, i) => (
                  <li
                    key={title}
                    aria-current={step === i + 1 ? "step" : undefined}
                  >
                    <span>{i + 1}</span>
                    <b>{title}</b>
                  </li>
                ))}
              </ol>
              <h2 ref={heading} tabIndex={-1}>
                {titles[step - 1]}
              </h2>
              <p className="request-help">
                {
                  [
                    "Name and country are required. Enter at least one contact method.",
                    "Choose a category; add any identification details you know.",
                    "Enter a part description or OEM number, and the required quantity.",
                    allowUploads
                      ? `Optional: up to three PNG, JPEG or PDF files, ${mode === "local" ? 5 : 1} MB each. Files must be reselected after a reload.`
                      : "Attachments are not currently accepted. Describe the part or provide its OEM number.",
                    "Check your details before submitting this request.",
                  ][step - 1]
                }
              </p>
              {!ready ? (
                <p>Loading request form…</p>
              ) : (
                <form
                  noValidate
                  onSubmit={(event) => {
                    event.preventDefault();
                    step === 5 ? submit() : next();
                  }}
                >
                  {step === 1 && (
                    <p id="contact-rule" className="request-help">
                      Provide an email address or telephone number. Either
                      contact method is enough.
                    </p>
                  )}
                  {step === 3 && (
                    <p id="part-rule" className="request-help">
                      Provide a part description or OEM / part number. You can
                      leave the other field empty.
                    </p>
                  )}
                  {step <= 3 && (
                    <div className="request-fields">
                      {groups[step - 1].map((key) => {
                        const required = requiredFields.includes(key);
                        const groupHelp = ["email", "phone"].includes(key)
                          ? "contact-rule"
                          : ["description", "oem"].includes(key)
                            ? "part-rule"
                            : "";
                        const describedBy =
                          [groupHelp, errors[key] ? `${key}-error` : ""]
                            .filter(Boolean)
                            .join(" ") || undefined;
                        return (
                          <div
                            key={key}
                            className={
                              key === "description" ? "request-full" : ""
                            }
                          >
                            <label htmlFor={key}>
                              {labels[key]}
                              {required && <span aria-hidden="true"> *</span>}
                              {optionalFields.has(key) && (
                                <span className="request-optional">
                                  {" "}
                                  (optional)
                                </span>
                              )}
                            </label>
                            {key === "description" ? (
                              <textarea
                                id={key}
                                value={data[key]}
                                maxLength={2000}
                                rows={4}
                                onChange={(event) =>
                                  update(key, event.target.value)
                                }
                                aria-invalid={!!errors[key]}
                                aria-describedby={describedBy}
                              />
                            ) : ["category", "quality"].includes(key) ? (
                              <select
                                id={key}
                                required={required}
                                value={data[key]}
                                onChange={(event) =>
                                  update(key, event.target.value)
                                }
                                aria-invalid={!!errors[key]}
                                aria-describedby={describedBy}
                              >
                                <option value="">
                                  {key === "quality"
                                    ? "No preference"
                                    : "Choose a category"}
                                </option>
                                {(key === "category"
                                  ? categories
                                  : qualities
                                ).map((value) => (
                                  <option key={value}>{value}</option>
                                ))}
                              </select>
                            ) : (
                              <input
                                id={key}
                                required={required}
                                type={
                                  key === "email"
                                    ? "email"
                                    : key === "phone"
                                      ? "tel"
                                      : "text"
                                }
                                inputMode={
                                  key === "quantity" || key === "year"
                                    ? "numeric"
                                    : undefined
                                }
                                autoComplete={
                                  key === "name"
                                    ? "name"
                                    : key === "email"
                                      ? "email"
                                      : key === "phone"
                                        ? "tel"
                                        : key === "company"
                                          ? "organization"
                                          : key === "country"
                                            ? "country-name"
                                            : "off"
                                }
                                value={data[key]}
                                maxLength={200}
                                onChange={(event) =>
                                  update(key, event.target.value)
                                }
                                aria-invalid={!!errors[key]}
                                aria-describedby={describedBy}
                              />
                            )}
                            {errors[key] && (
                              <p id={`${key}-error`} className="request-error">
                                {errors[key]}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {step === 4 && allowUploads && (
                    <div className="request-upload">
                      <label htmlFor="attachments">Choose attachments</label>
                      <input
                        id="attachments"
                        type="file"
                        accept="image/png,image/jpeg,application/pdf"
                        multiple
                        onChange={(event) => chooseFiles(event.target.files)}
                        aria-describedby="attachment-help"
                      />
                      <p id="attachment-help">
                        {mode === "local"
                          ? "Attachments are private local test records. Do not use confidential or real customer files."
                          : "Provide only the part or equipment information needed for your request."}
                      </p>
                      {errors.attachments && (
                        <p className="request-error" role="alert">
                          {errors.attachments}
                        </p>
                      )}
                      <ul>
                        {files.map((file, i) => (
                          <li key={`${file.name}-${i}`}>
                            <span>
                              {file.name} ({Math.ceil(file.size / 1024)} KB)
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                setFiles((old) =>
                                  old.filter((_, index) => index !== i),
                                )
                              }
                              aria-label={`Remove ${file.name}`}
                            >
                              Remove
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {step === 4 && !allowUploads && (
                    <div className="request-attachment-unavailable">
                      <h3>Photos & parts lists</h3>
                      <p>
                        Uploads are not available in this review build. Add the
                        part number or describe the information in your enquiry.
                        No file has been uploaded or scanned.
                      </p>
                      <button type="button" onClick={() => setStep(3)}>
                        Add supporting information to the part description
                      </button>
                    </div>
                  )}
                  {step === 5 && (
                    <div className="request-review">
                      {groups.map((group, index) => (
                        <section key={index}>
                          <div>
                            <h3>{titles[index]}</h3>
                            <button
                              type="button"
                              disabled={pending}
                              onClick={() => setStep(index + 1)}
                            >
                              Edit {titles[index].toLowerCase()}
                            </button>
                          </div>
                          <dl>
                            {group.map((key) => (
                              <div key={key}>
                                <dt>{labels[key]}</dt>
                                <dd>{data[key] || "Not provided"}</dd>
                              </div>
                            ))}
                          </dl>
                        </section>
                      ))}
                      <section>
                        <div>
                          <h3>Attachments</h3>
                          <button
                            type="button"
                            disabled={pending}
                            onClick={() => setStep(4)}
                          >
                            Edit attachments
                          </button>
                        </div>
                        <p>
                          {files.length
                            ? files.map((file) => file.name).join(", ")
                            : "No attachments selected"}
                        </p>
                      </section>
                    </div>
                  )}
                  <label className="request-remember">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(event) => setRemember(event.target.checked)}
                    />
                    Save this draft on this device for up to 24 hours
                  </label>
                  <p className="request-help">
                    Use this only on a private device. Attachments are never
                    saved in browser storage.
                  </p>
                  {storageError && <p role="status">{storageError}</p>}
                  {notice && (
                    <p role="alert" className="request-notice">
                      {notice}
                    </p>
                  )}
                  {step === 5 && mode === "supabase" && siteKey && (
                    <Challenge
                      siteKey={siteKey}
                      onToken={setChallenge}
                      resetKey={challengeReset}
                    />
                  )}
                  <div className="request-actions">
                    <button
                      type="button"
                      disabled={step === 1 || pending}
                      onClick={() => {
                        setStep(step - 1);
                        setErrors({});
                        setNotice("");
                      }}
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="request-primary"
                      disabled={
                        pending ||
                        !!errors.attachments ||
                        (step === 5 &&
                          (mode === "disabled" ||
                            (mode === "supabase" && !challenge)))
                      }
                    >
                      {pending
                        ? "Saving request…"
                        : step === 5
                          ? mode === "local"
                            ? "Save local test request"
                            : mode === "disabled"
                              ? "Submission not available"
                              : "Send Your Enquiry"
                          : "Continue"}
                    </button>
                  </div>
                  <button
                    type="button"
                    className="request-discard"
                    disabled={pending}
                    onClick={reset}
                  >
                    Clear this request and saved draft
                  </button>
                </form>
              )}
            </>
          )}
        </section>
      </PageContainer>
    </>
  );
}
