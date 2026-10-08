# Original demo visual audit — 8 October 2026

Authority: original `chinapartsshop` commit `2d7e7ae4ec84f08a039babd9b8dc0315886d6330`. Current before-state: Final review commit `48a072043ec4ae22244ba75fae206529e9358f7f`. Both were rendered directly in isolated headless Chrome at 1440, 768 and 390px before implementation. The original repository remains clean and read-only; its exact snapshot was run from an ignored temporary directory using the current local runtime.

## Visual losses and restoration map

| Original rendered pattern | Before-state difference | Adaptation in Final |
| --- | --- | --- |
| Substantial two-level header; yellow action; requirement search-shaped control | Single thin navigation row | Two-level branded navigation and a clearly labelled requirement entry leading to Find Your Part; no inventory search |
| Large white/yellow industrial hero and tight headline hierarchy | Scene retained, surrounding composition flatter | Preserve the scene; restore display scale, compact context label, linked finder and original mobile image placement |
| Raised white finder crossing the hero edge | Large grey identification block below categories | White overlapping capture panel with technical imagery and actual description/OEM/brand/category/model fields |
| Circular 126px brand disks on a framed discovery surface | Small rectangular logos in a restrained rail | Larger circle-backed brand grid, correct dark backings for white artwork, retained brand prefill |
| Tall/short photo-overlay category mosaic | Uniform thumbnail-and-rule row | Strong photo-overlay panels and deliberate mosaic scale; primary action preloads category, separate detail links retain real pages |
| Component cutouts and request-led image cards | Little physical component imagery outside the hero | Broad component-family enquiry shortcuts with illustrative imagery, no SKU/reference/stock/price claims |
| Dark connected process section with yellow markers | White ruled process row | Charcoal process band, stronger icons and connecting markers; retain current four-step business flow |
| Image-backed industry resources | Plain open editorial previews | Image-led framed guide cards on a dark editorial passage; genuine article routes remain |
| Image/card RFQ feature and large inspection composition | Mostly flat paired sections | Technical identification imagery beside the real capture flow; yellow technical passage and warehouse supplier-story panel |
| Strong final dark CTA and grouped footer | Small warm-paper contact band | Dark enquiry/WhatsApp close and substantial grouped footer with verified information only |

The original uses the same Manrope identity, charcoal, warm/white surfaces, yellow and small red technical accents. It also contains more whitespace and sections than the brief now requires. Restoration uses its composition and material patterns without copying every section or its fragile tablet clipping. Modern readable tracking, current security notices, keyboard focus and mobile clearances remain authoritative.

## Preserved and excluded truth

The original store cards display invented example references and “Available on Request”; these are not suitable Final inventory evidence. Its “Browse Parts” placeholders, fake modal success, separate upload blocks, duplicate RFQ/quote actions, Aftermarket/Replacement, AI chatbot, public region/service assurances and unverified email are excluded. Requirement capture, quality choices, contact details, category/brand context, technical-help context, supplier persistence/Vendor ID and secure customer foundations remain the current implementation.

## Motion assessment before implementation

The original repeatedly hides content on entering/leaving the viewport. Reject that behavior: it obscures readable material and is unnecessary for identification tasks. Reject automatic brand movement and form/route entrances for the same reason. Restore only subtle card hover feedback: frequent pointer action, feedback purpose, 160ms transform ease-out (2px image scale equivalent 1.025), pointer/fine-only, disabled under reduced motion. Existing button feedback and immediate navigation remain. No motion library or entrance animation is added.

## Evidence before implementation

`evidence/visual-restoration/original-1440.png`, `original-768.png`, `original-390.png` are full-page references. `before-1440.png`, `before-768.png`, `before-390.png` record the previous Final homepage. Matching `*-viewport.png` files show the actual first viewport. Desktop reference crops include finder, discovery, category grid, process, products, RFQ, resources and capability sections. Generated evidence is ignored and excluded from release artifacts.

## Direction contract

THESIS: Restore the client's original photo-rich CPS sourcing presentation while keeping the actual requirement the central transaction.

OWN-WORLD: The exact original industrial hero, white capture panels, circular brand disks, overlay category mosaics, charcoal process/editorial passages, yellow technical accents and Manrope hierarchy. Existing logo, photos and quality truth anchor the page.

STORY: Identify an equipment family or component, carry the selected context to the actual enquiry and understand human sourcing and supplier review without an inventory promise.

FIRST VIEWPORT: Two-level header, industrial hero with a large white/yellow promise and two primary enquiry actions, a raised white technical finder crossing its bottom edge. Mobile keeps the industrial scene, a clear stacked hierarchy and image-supported finder below it.

FORM: Owner-pinned original demo restoration; prior direct code-led preference retained. No alternative visual-world selection or generated comp.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
