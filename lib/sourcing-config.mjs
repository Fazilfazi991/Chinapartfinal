// Existing CPS review content. Final taxonomy and logos await the client.
export const categories = [
  {
    value: "Passenger Vehicle",
    label: "Passenger vehicles",
    detail: "Cars and light vehicles",
  },
  {
    value: "SUV or 4x4",
    label: "SUV & 4×4",
    detail: "Utility and off-road vehicles",
  },
  {
    value: "Truck or Trailer",
    label: "Trucks & trailers",
    detail: "Commercial transport",
  },
  { value: "Bus", label: "Buses & minibuses", detail: "Passenger transport" },
  {
    value: "Heavy Equipment",
    label: "Heavy equipment",
    detail: "Earthmoving and site equipment",
  },
  { value: "Crane", label: "Cranes", detail: "Lifting equipment" },
  {
    value: "Construction Machinery",
    label: "Construction machinery",
    detail: "Construction equipment",
  },
  {
    value: "Agricultural Machinery",
    label: "Agricultural machinery",
    detail: "Farm equipment",
  },
  {
    value: "Industrial Component",
    label: "Industrial components",
    detail: "Machinery requirements",
  },
];
export const subcategories = ["Engine", "Transmission", "Hydraulics"];
export const brands = [
  { name: "Dongfeng", asset: "dongfeng.png" },
  { name: "SINOTRUK", asset: "sinotruk.png" },
  { name: "FOTON", asset: "foton.svg" },
  { name: "JAC Motors", asset: "jac.png", darkBacking: true },
  { name: "Chery", asset: "chery.png", darkBacking: true },
  { name: "Geely", asset: "geely.png" },
  { name: "XCMG", asset: "xcmg.svg" },
  { name: "ZOOMLION", asset: "zoomlion.svg" },
  { name: "SANY", asset: "sany.svg" },
];
export const qualityOptions = ["Genuine", "OE", "OEM"];
export const salesContact = {
  number: "447520688566",
  display: "+44 7520 688566",
  approval: "client-review",
};
export const locales = {
  authoritative: "en",
  available: ["en"],
  planned: ["ar", "zh"],
};
export const futureCatalogue = { brandRoutingEnabled: false };
export function brandHref(name, { catalogueEnabled = false } = {}) {
  if (!brands.some((brand) => brand.name === name)) return "/request";
  return futureCatalogue.brandRoutingEnabled && catalogueEnabled
    ? "/catalogue?brand=" + encodeURIComponent(name)
    : enquiryHref({ brand: name });
}
export function enquiryHref(input = {}) {
  const query = new URLSearchParams();
  for (const key of [
    "description",
    "oem",
    "brand",
    "category",
    "model",
    "year",
    "vin",
    "purpose",
  ]) {
    const value = input[key];
    if (typeof value !== "string" || !value.trim()) continue;
    if (key === "purpose" && value !== "technical") continue;
    if (
      key === "category" &&
      !categories.some((item) => item.value === value) &&
      value !== "Other"
    )
      continue;
    query.set(key, value.trim().slice(0, key === "description" ? 2000 : 200));
  }
  return "/request" + (query.size ? "?" + query.toString() : "");
}
export function salesHref(context = {}) {
  const parts = ["Hello China Parts Shop, I have a parts sourcing enquiry."];
  if (brands.some((item) => item.name === context.brand))
    parts.push("Brand: " + context.brand + ".");
  const category = categories.find((item) => item.value === context.category);
  if (category) parts.push("Category: " + category.label + ".");
  return (
    "https://wa.me/" +
    salesContact.number +
    "?text=" +
    encodeURIComponent(parts.join(" "))
  );
}
export function entryData(search) {
  const query = new URLSearchParams(search),
    result = {};
  for (const key of [
    "description",
    "oem",
    "brand",
    "category",
    "model",
    "year",
    "vin",
  ]) {
    const value =
      query.get(key) ?? (key === "description" ? query.get("part") : null);
    if (value)
      result[key] = value.trim().slice(0, key === "description" ? 2000 : 200);
  }
  if (
    result.category &&
    !categories.some((item) => item.value === result.category) &&
    result.category !== "Other"
  )
    delete result.category;
  if (query.get("purpose") === "technical")
    result.description = (
      "Technical assistance — " +
      (result.description ||
        "Help identifying the correct part or equipment requirement.")
    ).slice(0, 2000);
  return result;
}
