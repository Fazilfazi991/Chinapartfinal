// Explicitly synthetic local workspace. No provider auth or real RFQ records.
import { randomUUID, createHash } from 'node:crypto';
import {validCatalogueAsset} from './catalogue-assets.mjs';
import {extendPreviewState,previewIdentity,previewAdministration,applyPreviewAdministration,withdrawPreviewChildren} from './preview-administration.mjs';
import { previewActors } from './preview-actors.mjs';
export { previewActors } from './preview-actors.mjs';

export {PreviewError} from './preview-error.mjs';
import {PreviewError} from './preview-error.mjs';
export const sections = ['overview', 'requests', 'catalogue', 'customers', 'orders', 'invoices', 'payments', 'support', 'content', 'audit', 'administration'];
const now = () => new Date().toISOString();
const fail = (message, status = 400) => { throw new PreviewError(message, status); };
const text = (value, label, max = 200, optional = false) => {
  if (typeof value !== 'string') return fail(`${label} must be text.`);
  const trimmed = value.trim();
  if ((!optional && !trimmed) || trimmed.length > max || /[\x00-\x08\x0b\x0c\x0e-\x1f]/.test(trimmed)) fail(`${label} must contain ${optional ? '0' : '1'}–${max} characters.`);
  return trimmed;
};
const choice = (value, values, label) => values.includes(value) ? value : fail(`Select a valid ${label}.`);
const integer = (value, label, min = 0, max = 100000000) => Number.isSafeInteger(value) && value >= min && value <= max ? value : fail(`${label} must be a whole number between ${min} and ${max}.`);
const actorFor = id => previewActors.find(actor => actor.id === id) || fail('Select a synthetic preview actor.', 401);
const staff = actor => actor.role !== 'customer' || fail('Staff access required.', 403);
const admin = actor => actor.role === 'admin' || fail('Administrator access required.', 403);
const accessible = (actor, row) => actor.role === 'admin' || (actor.role === 'customer' ? row.company === actor.company : row.office === actor.office);
const record = (state, collection, id, actor) => {
  const row = state[collection].find(item => item.id === id);
  if (!row || !accessible(actor, row)) fail('Record unavailable.', 404);
  return row;
};
const expected = (row, version) => { if (row.version !== version) fail('This record changed. Reload before saving.', 409); };
const row = data => ({ id: randomUUID(), version: 0, createdAt: now(), ...data });
const lines = input => {
  if (!Array.isArray(input) || !input.length || input.length > 50) fail('Provide between 1 and 50 parts.');
  return input.map(line => { if (!line || typeof line !== 'object') fail('Invalid part line.'); return { description: text(line.description, 'Part description', 300), partNumber: text(line.partNumber ?? '', 'Part number', 100, true), quantity: integer(line.quantity, 'Quantity', 1, 999999) }; });
};
export function initialPreviewState() {
  const stamp = '2026-10-04T08:00:00.000Z';
  return {
    schema: 1, synthetic: true, revision: 0,
    customers: [
      { id: 'company-a', name: 'Demo Workshop A', contact: 'Synthetic contact A', email: 'workshop-a@example.test', office: 'north', company: 'company-a', note: '', version: 0, createdAt: stamp },
      { id: 'company-b', name: 'Demo Workshop B', contact: 'Synthetic contact B', email: 'workshop-b@example.test', office: 'south', company: 'company-b', note: 'Staff-only synthetic note', version: 0, createdAt: stamp },
    ],
    requests: [
      { id: 'request-a', reference: 'DEMO-RFQ-001', company: 'company-a', office: 'north', status: 'Under review', items: [{ description: 'Demo hydraulic filter', partNumber: 'SAMPLE-FILTER-A', quantity: 2 }], internalNote: 'Synthetic sourcing note — never customer-visible', comments: [{ id: 'comment-a', body: 'Please confirm the nameplate details.', author: 'Demo North office agent', visibility: 'customer', createdAt: stamp }], version: 0, createdAt: stamp },
      { id: 'request-b', reference: 'DEMO-RFQ-002', company: 'company-b', office: 'south', status: 'Submitted', items: [{ description: 'Demo engine seal', partNumber: 'SAMPLE-SEAL-B', quantity: 1 }], internalNote: 'Other office only', comments: [], version: 0, createdAt: stamp },
    ],
    catalogue: [
      { id: 'product-a', title: 'Sample hydraulic filter', partNumber: 'SAMPLE-FILTER-A', brand: 'Demo equipment make', category: 'Filters', description: 'Synthetic catalogue entry for reviewing the request workflow. Fitment and availability require verification.', visibility: 'preview', version: 0, createdAt: stamp },
      { id: 'product-b', title: 'Unreviewed sample seal', partNumber: 'SAMPLE-SEAL-B', brand: 'Demo equipment make', category: 'Engine', description: 'Staff draft, excluded from the customer catalogue.', visibility: 'draft', version: 0, createdAt: stamp },
    ],
    orders: [
      { id: 'order-a', reference: 'DEMO-ORDER-001', requestId: 'request-a', company: 'company-a', office: 'north', status: 'Draft', items: [{ description: 'Demo hydraulic filter', partNumber: 'SAMPLE-FILTER-A', quantity: 2 }], shippingNote: 'Destination and shipping terms awaiting review.', tracking: [{ id: 'tracking-a', label: 'Sample preparation event', detail: 'Synthetic timeline only; no shipment has been booked.', createdAt: stamp }], version: 0, createdAt: stamp },
    ],
    invoices: [{ id: 'invoice-a', reference: 'DEMO-DRAFT-001', orderId: 'order-a', company: 'company-a', office: 'north', status: 'Draft', currency: 'AED', scale: 2, lines: [{ description: 'Synthetic filter line', quantity: 2, unitMinor: 12500 }], taxMinor: null, version: 0, createdAt: stamp }],
    payments: [{ id: 'payment-a', invoiceId: 'invoice-a', company: 'company-a', office: 'north', status: 'Sample event', amountMinor: 0, currency: 'AED', scale: 2, description: 'Gateway history placeholder — no money received.', createdAt: stamp }],
    support: [],
    content: [{ id: 'content-about', title: 'About the sourcing service', slug: 'about', body: 'Review company-approved business copy here before publication. This local draft does not change the public site.', status: 'Draft', version: 0, createdAt: stamp }],
    audit: [], commands: [],
  };
}
export function invoiceTotals(invoice) {
  const subtotal = invoice.lines.reduce((sum, line) => sum + line.quantity * line.unitMinor, 0);
  if (!Number.isSafeInteger(subtotal) || subtotal > 10000000000) fail('Draft amount is too large.');
  return { subtotal, tax: invoice.taxMinor, total: invoice.taxMinor === null ? null : subtotal + invoice.taxMinor };
}
export function previewSnapshot(state, actorId) {
  state=extendPreviewState(state);
  const actor = previewIdentity(state,actorId);
  const filter = collection => state[collection].filter(item => accessible(actor, item));
  const requests = filter('requests').map(item => actor.role === 'customer'
    ? Object.fromEntries(Object.entries(item).filter(([key]) => !['internalNote', 'office','assignedTo'].includes(key)).map(([key, value]) => [key, key === 'comments' ? value.filter(comment => comment.visibility === 'customer') : value])) : item);
  return {
    synthetic: true, revision: state.revision, actor, actors: previewActors,
    customers: actor.role === 'customer' ? filter('customers').map(({ note, office, ...customer }) => customer) : filter('customers'),
    requests, catalogue: state.catalogue.filter(item => actor.role !== 'customer' || item.visibility === 'preview'),
    administration:actor.role==='admin'?previewAdministration(state):undefined,
    orders: filter('orders').filter(item=>actor.role!=='customer'||item.customerVisible!==false&&!item.archived).map(item=>({...item,tracking:item.tracking.filter(event=>actor.role!=='customer'||event.customerVisible!==false&&!event.archived).map(event=>({...event,version:event.version??0}))})), invoices: filter('invoices').filter(item=>actor.role!=='customer'||item.customerVisible!==false&&!item.archived&&state.orders.some(order=>order.id===item.orderId&&order.customerVisible!==false&&!order.archived)).map(invoice => ({ ...invoice, totals: invoiceTotals(invoice) })),
    payments: filter('payments'), support: filter('support'),
    content: actor.role === 'admin' ? state.content : [],
    audit: actor.role === 'customer' ? [] : state.audit.filter(event => actor.role === 'admin' || event.office === actor.office),
    integrations: { auth: 'Not connected', database: 'Local synthetic fixture only', payments: 'Disabled', email: 'Disabled', whatsapp: 'Click-through only', shipping: 'Manual preview events only', issuance: 'Disabled pending business rules' },
  };
}
export function applyPreviewCommand(original, actorId, command) {
  original=extendPreviewState(original);
  const actor = previewIdentity(original,actorId);
  if (!command || typeof command !== 'object' || !/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(command.key ?? '')) fail('A valid operation key is required.');
  const digest = createHash('sha256').update(JSON.stringify({ actorId, command })).digest('hex');
  const previous = original.commands.find(item => item.key === command.key);
  if (previous) {
    if (previous.digest !== digest) fail('This operation key was already used for different data.', 409);
    return { state: original, result: previous.result, repeated: true };
  }
  const state = structuredClone(original), input = command.input ?? {};
  if (typeof input !== 'object' || Array.isArray(input)) fail('Invalid operation fields.');
  let saved;
  let office = actor.office;
  switch (command.type) {
    case 'request.create': {
      if (actor.role !== 'customer') fail('Select a customer preview actor to submit a request.', 403);
      const customer = record(state, 'customers', actor.company, actor);
      saved = row({ reference: `DEMO-RFQ-${randomUUID().slice(0, 8)}`, company: actor.company, office: customer.office, status: 'Submitted', items: lines(input.items), internalNote: '', comments: [] });
      office = saved.office; state.requests.unshift(saved); break;
    }
    case 'request.update': {
      staff(actor); saved = record(state, 'requests', input.id, actor); expected(saved, input.version);
      saved.status = choice(input.status, ['Submitted', 'Under review', 'Needs information', 'Closed'], 'review status');
      saved.internalNote = text(input.internalNote ?? '', 'Internal note', 2000, true); saved.version++; office = saved.office; break;
    }
    case 'request.comment': {
      saved = record(state, 'requests', input.id, actor); expected(saved, input.version);
      const visibility = actor.role === 'customer' ? 'customer' : choice(input.visibility, ['customer', 'internal'], 'comment visibility');
      saved.comments.push(row({ body: text(input.body, 'Comment', 2000), author: actor.label, visibility }));
      saved.version++; office = saved.office; break;
    }
    case 'catalogue.save': {
      admin(actor);
      if(!validCatalogueAsset(input.imageAsset??''))fail('Choose a managed illustration.');
      const values = { imageAsset:input.imageAsset??'',title: text(input.title, 'Product name'), partNumber: text(input.partNumber ?? '', 'Part number', 100, true), brand: text(input.brand ?? '', 'Brand', 100, true), category: text(input.category, 'Category', 100), description: text(input.description, 'Description', 2000), visibility: choice(input.visibility, ['draft', 'preview', 'archived'], 'visibility') };
      if (input.id) { saved = state.catalogue.find(item => item.id === input.id) || fail('Record unavailable.', 404); expected(saved, input.version); Object.assign(saved, values); saved.version++; }
      else { saved = row(values); state.catalogue.unshift(saved); } break;
    }
    case 'customer.update': {
      staff(actor); saved = record(state, 'customers', input.id, actor); expected(saved, input.version);
      saved.contact = text(input.contact, 'Contact'); saved.note = text(input.note ?? '', 'Internal CRM note', 2000, true); saved.version++; office = saved.office; break;
    }
    case 'order.create': {
      staff(actor); const request = record(state, 'requests', input.requestId, actor);
      saved = row({ reference: `DEMO-ORDER-${randomUUID().slice(0, 8)}`, requestId: request.id, company: request.company, office: request.office, status: 'Draft', customerVisible:false,reviewVersion:null, items: structuredClone(request.items), shippingNote: '', tracking: [] });
      office = saved.office; state.orders.unshift(saved); break;
    }
    case 'order.update': {
      staff(actor); saved = record(state, 'orders', input.id, actor); expected(saved, input.version);
      if(saved.archived)fail('Restore the archived draft first.',409);saved.customerVisible=false;saved.reviewVersion=null;withdrawPreviewChildren(state,saved.id);
      saved.status = choice(input.status, ['Draft', 'Ready for internal review'], 'draft status');
      saved.shippingNote = text(input.shippingNote ?? '', 'Shipping note', 2000, true); saved.version++; office = saved.office; break;
    }
    case 'order.tracking': {
      staff(actor); saved = record(state, 'orders', input.id, actor); expected(saved, input.version);
      if(saved.archived)fail('Restore the archived draft first.',409);saved.customerVisible=false;saved.reviewVersion=null;withdrawPreviewChildren(state,saved.id);
      saved.tracking.push(row({ customerVisible:false,reviewVersion:null,label: text(input.label, 'Event title', 100), detail: text(input.detail, 'Event description', 1000) })); saved.version++; office = saved.office; break;
    }
    case 'invoice.save': {
      staff(actor); const order = record(state, 'orders', input.orderId, actor);
      if (!Array.isArray(input.lines) || !input.lines.length || input.lines.length > 50) fail('Provide 1–50 invoice lines.');
      const currency = text(input.currency, 'Currency', 3); if (!/^[A-Z]{3}$/.test(currency)) fail('Use an explicit three-letter currency code.');
      const values = { orderId: order.id, company: order.company, office: order.office, status: 'Draft', customerVisible:false,reviewVersion:null,currency, scale: integer(input.scale, 'Currency decimal places', 0, 3), lines: input.lines.map(item => {if(!item||typeof item!=='object')fail('Invalid invoice line.');return { description: text(item.description, 'Line description', 300), quantity: integer(item.quantity, 'Quantity', 1, 999999), unitMinor: integer(item.unitMinor, 'Unit amount in minor units') };}), taxMinor: input.taxMinor === null ? null : integer(input.taxMinor, 'Draft tax amount') };
      invoiceTotals(values); office = order.office;
      if (input.id) { saved = record(state, 'invoices', input.id, actor); expected(saved, input.version); if(saved.archived)fail('Restore the archived draft first.',409);Object.assign(saved, values); saved.version++; }
      else { saved = row({ ...values, reference: `DEMO-DRAFT-${randomUUID().slice(0, 8)}` }); state.invoices.unshift(saved); } break;
    }
    case 'invoice.issue': case 'payment.start': case 'message.send': case 'content.publish':
      fail('Live execution is disabled. Provider setup and approved business rules are required.', 503); break;
    case 'support.create': {
      if (actor.role !== 'customer') fail('Use a customer preview actor for a support request.', 403);
      const customer = record(state, 'customers', actor.company, actor);
      saved = row({ company: actor.company, office: customer.office, subject: text(input.subject, 'Subject'), body: text(input.body, 'Message', 2000), status: 'Open', replies: [] }); office = saved.office; state.support.unshift(saved); break;
    }
    case 'support.reply': {
      saved = record(state, 'support', input.id, actor); expected(saved, input.version);
      saved.replies.push(row({ body: text(input.body, 'Reply', 2000), author: actor.label })); saved.version++; office = saved.office; break;
    }
    case 'support.status': {
      staff(actor); saved = record(state, 'support', input.id, actor); expected(saved, input.version);
      saved.status = choice(input.status, ['Open', 'Under review', 'Closed'], 'support status'); saved.version++; office = saved.office; break;
    }
    case 'content.save': {
      admin(actor); const values = { title: text(input.title, 'Page title'), slug: text(input.slug, 'Page slug', 80), body: text(input.body, 'Page body', 10000), status: 'Draft' };
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(values.slug)) fail('Use lowercase words separated by hyphens for the slug.');
      if (state.content.some(item => item.slug === values.slug && item.id !== input.id)) fail('A draft with this slug already exists.', 409);
      if (input.id) { saved = state.content.find(item => item.id === input.id) || fail('Record unavailable.', 404); expected(saved, input.version); Object.assign(saved, values); saved.version++; }
      else { saved = row(values); state.content.unshift(saved); } break;
    }
    default: saved=applyPreviewAdministration(state,actor,command.type,input);if(!saved)fail('Unsupported preview operation.');
  }
  if (state.requests.length > 500 || state.catalogue.length > 500 || state.orders.length > 500 || state.invoices.length > 500 || state.support.length > 500 || state.content.length > 100 || state.audit.length > 10000 || (saved.comments?.length ?? 0) > 500 || (saved.replies?.length ?? 0) > 500 || (saved.tracking?.length ?? 0) > 500) fail('Local preview capacity reached. Preserve the fixture and start a new preview dataset.', 409);
  const result = { id: saved.id, revision: state.revision + 1 };
  state.revision++;
  state.audit.unshift(row({ actor: actor.label, type: command.type, resource: saved.id, office, description: 'Synthetic local operation' }));
  // Do not expire idempotency receipts silently. This bounded preview needs a new dataset when full.
  if (state.commands.length >= 10000) fail('Local preview operation limit reached.', 409);
  state.commands.push({ key: command.key, digest, result });
  return { state, result, repeated: false };
}
