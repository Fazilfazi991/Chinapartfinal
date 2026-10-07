"use client";
import { useState } from "react";
import { ArrowUpRight, Paperclip } from "lucide-react";
import {
  categories,
  enquiryHref,
  subcategories,
} from "../lib/sourcing-config.mjs";
export default function FindPart() {
  const [data, setData] = useState({
    description: "",
    oem: "",
    brand: "",
    category: "",
    model: "",
  });
  const update = (key: string, value: string) =>
    setData((old) => ({ ...old, [key]: value }));
  return (
    <form
      className="find-part-form"
      action="/request"
      onSubmit={(e) => {
        e.preventDefault();
        window.location.assign(enquiryHref(data));
      }}
    >
      <div className="find-fields">
        <div className="find-wide">
          <label htmlFor="find-description">What part do you need?</label>
          <textarea
            id="find-description"
            name="description"
            rows={2}
            maxLength={2000}
            placeholder="Part name, function or the information you have"
            value={data.description}
            onChange={(e) => update("description", e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="find-oem">
            OEM / OE / part number <span>(if known)</span>
          </label>
          <input
            id="find-oem"
            name="oem"
            maxLength={200}
            value={data.oem}
            onChange={(e) => update("oem", e.target.value)}
            placeholder="Copy the number exactly"
          />
        </div>
        <div>
          <label htmlFor="find-brand">
            Brand <span>(if known)</span>
          </label>
          <input
            id="find-brand"
            name="brand"
            maxLength={200}
            value={data.brand}
            onChange={(e) => update("brand", e.target.value)}
            placeholder="Vehicle or equipment brand"
          />
        </div>
        <div>
          <label htmlFor="find-category">Vehicle / equipment category</label>
          <select
            id="find-category"
            name="category"
            value={data.category}
            onChange={(e) => update("category", e.target.value)}
          >
            <option value="">Choose if known</option>
            {categories.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
            <option>Other</option>
          </select>
        </div>
        <div>
          <label htmlFor="find-model">
            Equipment / model details <span>(optional)</span>
          </label>
          <input
            id="find-model"
            name="model"
            maxLength={200}
            placeholder="Model, equipment type or series"
            value={data.model}
            onChange={(e) => update("model", e.target.value)}
          />
        </div>
      </div>
      <div className="find-actions">
        <p>
          <Paperclip size={18} aria-hidden="true" />
          Photos and parts lists belong in the same enquiry. Upload availability
          is shown there.
        </p>
        <button className="cps-action" type="submit">
          Find Part <ArrowUpRight size={20} />
        </button>
      </div>
      <p className="find-help">
        Your details carry into the enquiry. Add your contact information and
        review before sending.
      </p>
      <div className="find-subcategories">
        <span>Start with a part system:</span>
        {subcategories.map((item) => (
          <button
            type="button"
            key={item}
            onClick={() =>
              update(
                "description",
                data.description ? data.description + " · " + item : item,
              )
            }
          >
            {item}
          </button>
        ))}
      </div>
    </form>
  );
}
