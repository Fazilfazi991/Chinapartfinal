export const vendorFields = [
  "company",
  "contact",
  "mobile",
  "email",
  "country",
  "products",
  "brands",
  "categories",
  "remarks",
];
export const vendorBlank = Object.fromEntries(
  vendorFields.map((key) => [key, ""]),
);
export const vendorStatuses = ["New", "UnderReview", "Approved", "Inactive"];
export const vendorLabels = {
  company: "Company name",
  contact: "Contact person",
  mobile: "Mobile / WhatsApp number",
  email: "Email",
  country: "Country / location",
  products: "Products you supply",
  brands: "Brands you supply",
  categories: "Categories you supply",
  remarks: "Remarks",
};
export function validateVendor(input) {
  if (!input || typeof input !== "object" || Array.isArray(input))
    return { form: "Invalid supplier registration." };
  const errors = {};
  if (Object.keys(input).some((key) => !vendorFields.includes(key)))
    errors.form = "Use the listed registration fields.";
  for (const key of vendorFields)
    if (
      typeof input[key] !== "string" ||
      input[key].length >
        (["products", "brands", "categories", "remarks"].includes(key)
          ? 2000
          : 200)
    )
      errors[key] = "Enter valid text within the field limit.";
  if (Object.keys(errors).length) return errors;
  for (const key of ["company", "contact", "country", "products"])
    if (!input[key].trim()) errors[key] = "This field is required.";
  if (!input.email.trim() && !input.mobile.trim())
    errors.email = "Enter an email address or mobile number.";
  if (
    input.email.trim() &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim())
  )
    errors.email = "Enter a valid email address.";
  if (
    input.mobile.trim() &&
    (!/^\+?[\d ()-]{7,25}$/.test(input.mobile.trim()) ||
      input.mobile.replace(/\D/g, "").length < 7)
  )
    errors.mobile = "Enter a valid mobile number with country code.";
  return errors;
}
