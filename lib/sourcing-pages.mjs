import { categories, enquiryHref } from "./sourcing-config.mjs";
export const categorySlugs = [
  "passenger-vehicles",
  "suv-4x4",
  "trucks-trailers",
  "buses-minibuses",
  "heavy-equipment",
  "cranes",
  "construction-machinery",
  "agricultural-machinery",
  "industrial-components",
];
const images = [
  "engine",
  "suv",
  "truck",
  "bus",
  "equipment",
  "crane",
  "construction",
  "agriculture",
  "workshop",
];
const families = [
  ["Engine & cooling", "Braking & suspension", "Electrical & service parts"],
  [
    "Drivetrain & transmission",
    "Steering & suspension",
    "Cooling & filtration",
  ],
  ["Engine & driveline", "Braking & chassis", "Trailer & service components"],
  ["Engine & transmission", "Braking & suspension", "Cooling & electrical"],
  ["Hydraulic components", "Undercarriage & wear parts", "Engine & filtration"],
  [
    "Hydraulics & lifting components",
    "Drivetrain & controls",
    "Engine & service parts",
  ],
  [
    "Hydraulics & motion",
    "Wear & maintenance components",
    "Engine & electrical",
  ],
  [
    "Engine & filtration",
    "Transmission & driveline",
    "Hydraulic & service components",
  ],
  [
    "Pumps & fluid systems",
    "Gears & bearings",
    "Motors & mechanical assemblies",
  ],
];
export const categoryPages = categories.map((category, i) => ({
  ...category,
  slug: categorySlugs[i],
  image: "/sourcing/" + images[i] + ".webp",
  families: families[i],
}));
export function findPartHref(input = {}) {
  return enquiryHref(input).replace(/^\/request/, "/find-your-part");
}
export const articles = [
  {
    slug: "genuine-oe-oem",
    title: "Genuine, OE or OEM?",
    summary: "Clarify the quality language before comparing an offer.",
    image: "/sourcing/engine.webp",
    legacy: "quality-options",
    sections: [
      [
        "Start with the offered item",
        "Genuine generally describes a part presented through the vehicle or equipment brand’s packaging and supply channel. Ask for the source and documentation for the particular item.",
      ],
      [
        "Understand the supplier relationship",
        "OE describes an original-equipment producer or supplier relationship. A supplier name alone does not establish that a specific part is correct for your application. OEM terminology varies by product and supplier; ask who makes the item and what the term means in the offer.",
      ],
      [
        "Confirm more than the label",
        "None of these labels establishes fitment, availability or warranty. Confirm the exact reference, manufacturer, application, documentation and agreed terms before accepting an offer. Select “Please advise” when unsure.",
      ],
    ],
  },
  {
    slug: "find-part-number",
    title: "Getting the part number right",
    summary:
      "Read the markings, preserve the suffix and add equipment context.",
    image: "/parts-inspection.png",
    legacy: "oem-number",
    sections: [
      [
        "Look in more than one place",
        "Check the existing component, equipment nameplate and vehicle or machine documentation. Record letters, punctuation and suffixes exactly as printed.",
      ],
      [
        "Distinguish a marking from a reference",
        "A casting mark, serial number and orderable part reference can be different. If unsure, describe where the number appears rather than treating it as a confirmed order code.",
      ],
      [
        "Add the application",
        "Provide make, model and the relevant equipment or chassis details. Similar appearance alone does not establish compatibility. Ask the sourcing team to review the application.",
      ],
    ],
  },
  {
    slug: "prepare-parts-enquiry",
    title: "Preparing a useful parts enquiry",
    summary: "Turn the information at hand into a clear sourcing requirement.",
    image: "/sourcing/workshop.webp",
    legacy: "request-information",
    sections: [
      [
        "Describe the requirement",
        "Include the equipment category, make/model, part description or reference, quantity and contact details. Explain the component’s function if its name is uncertain.",
      ],
      [
        "Keep each parts-list item distinct",
        "Use one line per item with reference, description and quantity. Describe the list within the enquiry while attachments are unavailable; a spreadsheet format should be agreed before sharing.",
      ],
      [
        "Make supporting details readable",
        "Where secure uploads are available, show the whole component, a close-up of its markings and the equipment nameplate in clear light. Upload availability is stated by the form. A selected file is not proof of receipt; avoid unrelated personal information.",
      ],
    ],
  },
];
export const mainRoutes = [
  "/",
  "/find-your-part",
  "/categories",
  "/resources",
  "/suppliers",
  "/customer-access",
  "/contact",
];
