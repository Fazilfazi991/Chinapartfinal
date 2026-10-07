export const fields = ['name','company','email','phone','country','category','brand','model','year','vin','description','oem','quantity','quality'];
export const blank = Object.fromEntries(fields.map(k => [k, k === 'quantity' ? '1' : '']));
export const requiredFields = ['name','country','category','quantity'];
export function validate(input, step = 5) {
  const errors = {};
  if (!input || typeof input !== 'object' || Array.isArray(input)) return { form: 'Invalid request.' };
  for (const key of fields) if (typeof input[key] !== 'string' || input[key].length > (key === 'description' ? 2000 : 200)) errors[key] = 'Enter valid text within the field limit.';
  if (Object.keys(errors).length) return errors;
  input = Object.fromEntries(fields.map(key => [key,input[key].trim()]));
  if (step === 1 || step === 5) {
    for (const key of ['name','country']) if (!input[key].trim()) errors[key] = 'This field is required.';
    if (!input.email.trim() && !input.phone.trim()) errors.email = 'Enter an email or telephone number.';
    if (input.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) errors.email = 'Enter a valid email address.';
    if (input.phone && (!/^\+?[\d ()-]{7,25}$/.test(input.phone) || input.phone.replace(/\D/g,'').length < 7)) errors.phone = 'Enter a valid telephone number including country code.';
  }
  if (step === 2 || step === 5) {
    if (!input.category.trim()) errors.category = 'Choose a vehicle or equipment category.';
    if (input.year && !/^(19|20)\d{2}$/.test(input.year)) errors.year = 'Enter a four-digit year.';
  }
  if (step === 3 || step === 5) {
    if (!input.description.trim() && !input.oem.trim()) errors.description = 'Enter a part description or OEM number.';
    if (!/^[1-9]\d{0,5}$/.test(input.quantity)) errors.quantity = 'Enter a whole quantity from 1 to 999999.';
    if (input.quality && !['Genuine','OE','OEM','Aftermarket','Replacement','Please advise'].includes(input.quality)) errors.quality = 'Choose a listed quality option.';
  }
  return errors;
}
export function restoreDraft(raw) {
  try {
    const parsed = JSON.parse(raw);
    const now = Date.now();
    if (parsed.version !== 1 || !parsed.data || typeof parsed.savedAt !== 'number' || !Number.isFinite(parsed.savedAt) || parsed.savedAt > now || now - parsed.savedAt > 86400000) return null;
    if (fields.some(k => typeof parsed.data[k] !== 'string' || parsed.data[k].length > (k === 'description' ? 2000 : 200))) return null;
    return { data: Object.fromEntries(fields.map(k => [k, parsed.data[k]])), step: Number.isInteger(parsed.step) ? Math.max(1, Math.min(5, parsed.step)) : 1, id: typeof parsed.id === 'string' && /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(parsed.id) ? parsed.id : '' };
  } catch { return null; }
}
