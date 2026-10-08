---
name: China Parts Shop
description: The original photo-rich CPS industrial sourcing world, restored for actual requirement capture.
colors:
  cps-yellow: "#ffcc05"
  cps-yellow-hover: "#eabc00"
  request-amber: "#f5b512"
  request-amber-hover: "#e5a710"
  ink-charcoal: "#20221f"
  ink-hover: "#383b33"
  request-ink: "#111315"
  warm-paper: "#faf9f5"
  request-paper: "#f6f6f2"
  capture-surface: "#efeee7"
  white: "#fff"
  muted-olive: "#595c55"
  muted-slate: "#4a4e52"
  dark-muted: "#d3d6cd"
  divider: "#d9dbd3"
  request-divider: "#d7d9d6"
  field-border: "#9c9f93"
  request-field-border: "#898e91"
  outline-hover: "#eeede7"
  focus-red: "#aa3023"
  request-red: "#b51621"
  error-red: "#a10e1b"
  warning-paper: "#fff3cf"
  selection-yellow: "#ffdc52"
  sales-green: "#225c3c"
  sales-green-hover: "#18462c"
  discovery-paper: "#f1f1eb"
  component-paper: "#f3f3ee"
  photo-ink: "#15181a"
  closing-charcoal: "#292c26"
  footer-charcoal: "#191c18"
  restoration-border: "#e1e2db"
  footer-divider: "#45483f"
  photo-muted: "#e7e9e3"
  hero-muted: "#eceee7"
  technical-ochre: "#7b5b00"
  editorial-ochre: "#72612b"
  eyebrow-muted: "#696c61"
  brand-hover-border: "#9b7b00"
typography:
  display:
    fontFamily: "Manrope, sans-serif"
    fontSize: "clamp(48px, 5.4vw, 80px)"
    fontWeight: 700
    lineHeight: 1.06
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Manrope, sans-serif"
    fontSize: "clamp(34px, 3.5vw, 50px)"
    fontWeight: 750
    lineHeight: 1.13
    letterSpacing: "-0.035em"
  title:
    fontFamily: "Manrope, sans-serif"
    fontSize: "22px"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "-0.035em"
  body:
    fontFamily: "Manrope, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.7
  label:
    fontFamily: "Manrope, sans-serif"
    fontSize: "13px"
    fontWeight: 700
    lineHeight: 1.6
  action:
    fontFamily: "Manrope, sans-serif"
    fontSize: "14px"
    fontWeight: 750
  navigation:
    fontFamily: "Manrope, sans-serif"
    fontSize: "13px"
    fontWeight: 650
  request-headline:
    fontFamily: "Manrope, Arial, sans-serif"
    fontSize: "clamp(32px, 5vw, 48px)"
    fontWeight: 800
    lineHeight: 1.15
    letterSpacing: "-0.03em"
  request-title:
    fontFamily: "Manrope, Arial, sans-serif"
    fontSize: "26px"
    fontWeight: 800
    lineHeight: 1.3
    letterSpacing: "-0.02em"
  request-body:
    fontFamily: "Manrope, Arial, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.6
rounded:
  header-submit: "3px"
  process-marker: "6px"
  control: "4px"
  utility: "8px"
  circle: "50%"
spacing:
  gap-small: "8px"
  control-inset: "12px"
  gap-base: "16px"
  gap-medium: "20px"
  mobile-gutter: "22px"
  content-inset: "24px"
  gap-large: "28px"
  tablet-gutter: "32px"
  compact-section: "40px"
  desktop-gutter: "48px"
  tablet-section: "56px"
  desktop-section: "76px"
  finder-inset: "36px"
  composition-gap: "64px"
components:
  button-primary:
    backgroundColor: "{colors.cps-yellow}"
    textColor: "{colors.ink-charcoal}"
    typography: "{typography.action}"
    rounded: "{rounded.control}"
    padding: "14px 22px"
  button-primary-hover:
    backgroundColor: "{colors.cps-yellow-hover}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.ink-charcoal}"
    typography: "{typography.action}"
    rounded: "{rounded.control}"
    padding: "14px 22px"
  button-outline-hover:
    backgroundColor: "{colors.outline-hover}"
  button-dark:
    backgroundColor: "{colors.ink-charcoal}"
    textColor: "{colors.white}"
    typography: "{typography.action}"
    rounded: "{rounded.control}"
    padding: "14px 22px"
  button-dark-hover:
    backgroundColor: "{colors.ink-hover}"
  button-request-primary:
    backgroundColor: "{colors.request-amber}"
    textColor: "{colors.request-ink}"
    rounded: "{rounded.control}"
    padding: "12px 18px"
  button-request-primary-hover:
    backgroundColor: "{colors.request-amber-hover}"
  input-find:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink-charcoal}"
    rounded: "{rounded.control}"
    padding: "{spacing.control-inset}"
    width: "100%"
  input-request:
    backgroundColor: "{colors.white}"
    typography: "{typography.request-body}"
    rounded: "{rounded.control}"
    padding: "{spacing.control-inset}"
    width: "100%"
  navigation-public:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink-charcoal}"
    typography: "{typography.navigation}"
    padding: "16px 32px"
  chip-part-system:
    backgroundColor: "transparent"
    textColor: "{colors.ink-charcoal}"
    rounded: "{rounded.control}"
    padding: "10px 14px"
  container-attachment-unavailable:
    rounded: "{rounded.utility}"
    padding: "{spacing.content-inset}"
  control-sales:
    backgroundColor: "{colors.sales-green}"
    textColor: "{colors.white}"
    rounded: "{rounded.utility}"
    padding: "14px 18px"
  control-sales-hover:
    backgroundColor: "{colors.sales-green-hover}"
  finder-panel:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink-charcoal}"
    rounded: "{rounded.utility}"
    padding: "{spacing.finder-inset}"
---

# Design System: China Parts Shop

## Overview

**Creative North Star: "The original industrial sourcing world"**

Photo-rich, substantial and practical: the preserved CPS logo, Manrope, yellow, charcoal and warm white anchor industrial scenes, technical imagery and actual requirement capture. White capture panels overlap darker photography. Circular brand disks, overlay mosaics, connected process markers and framed editorial cards restore physical presence while retaining readable, spacious layouts.

The owner's explicit restoration brief supersedes the earlier minimal flat-desk direction. Original demo commit `2d7e7ae4ec84f08a039babd9b8dc0315886d6330` is the visual anchor. Actual authority is the composite cascade in app/layout.tsx: globals, request, public, home, sourcing-pages, then restored-demo. The scoped final stylesheet is not a wholesale replacement. Frontmatter names reused actual literals semantically; it does not canonize every legacy value. Surface composition and evidence remain in VISUAL_RESTORATION_AUDIT.md and the surface brief.

**Key Characteristics:**
- CPS identity and modern Manrope hierarchy.
- Industrial photography and contained component imagery.
- Raised capture panels and circular brand discovery.
- Dark process, editorial, closing and footer passages.
- Honest forms, mobile imagery and visible keyboard focus.

Finish disposition: **ship to owner review**, with the scoped pale-notice foreground issue resolved. This is the implemented review system, not client approval or production authorization. Brand lists, logo rights and imagery remain pending client approval and provenance/licensing review. Illustrative imagery does not establish stock, brand authorization or owned facilities. No generated visual concept replaces the original demo.

## Colors

### Primary
CPS Yellow drives public actions, process markers and technical passages. Its hover provides feedback. Request Amber and its hover remain the operational enquiry/supplier variant.

### Secondary
Sales Green belongs to the single WhatsApp utility. Focus Red and Request Red distinguish public and operational focus/progress; Error Red accompanies failed validation. Technical Ochre and Editorial Ochre make small light-surface accents readable. The supplied CPS logo remains the identity source.

### Neutral
Warm Paper is the public base. Discovery Paper frames brands, component families and identification; White contains capture cards and fields. Component Paper backs contained technical imagery. Ink Charcoal drives process, editorial and login panels; Photo Ink protects rich introductions, with Closing Charcoal and Footer Charcoal deepening the final passages. Dark Muted, Photo Muted and Hero Muted are real supporting foreground variants. Restoration Border frames finder/discovery; Footer Divider separates dark groups. Existing request ink, paper, dividers, borders and Warning Paper keep their operational meaning. Capture Surface remains in inherited utility treatments, not the restored finder.

**The Action Yellow Rule.** Keep public CPS Yellow and operational Request Amber distinct.

**The Notice Foreground Rule.** Pale notices inside dark panels explicitly use Ink Charcoal. The customer-panel request-mode foreground is #20221f; never inherit pale dark-panel supporting text into a pale notice.

Sidecar tonal strips are synthesized display aids, not additional shipping palette values. Detector findings for restored colors, type and radius represent the explicitly requested system change, not a reason to revert to the old minimal document.

## Typography

Manrope is active, with sans-serif public and Arial/sans-serif request fallback. Local weights 400–800 use font-display swap. Loaded legacy mono and serif faces do not define active public headings.

Frontmatter display and headline roles now represent the restored homepage. Display inherits line-height 1.06 from sourcing-pages; at 650px it is 44px/1.08. Restored section headlines use weight 750 and line-height 1.13, becoming 34px at 760px. Inner PageHero is clamp(42px, 4.5vw, 66px)/1.09, becoming 40px at 760px. Finder headings are 38px desktop/34px mobile; photo categories use 22px/20px. These scoped variants coexist with inherited base styles.

Body is 16px/1.7, with 12–14px support and 18px hero introductions reducing to 16px. Restoration eyebrows are 11px/750/1.5 with 0.1em uppercase tracking; article labels use 10px/0.07em. Guide prose is 17px/1.85, reducing to 16px. Request headings and labels retain operational typography. Headings inherit -0.035em tracking and balanced wrapping; labels stay above controls.

## Layout

Public sections cap at 1440px with 76px/32px padding. Full-width bands align to max(32px, calc((100vw - 1376px) / 2)); composition gaps are 48–64px and card grids 24px. At 760px sections use 48px/22px and paired layouts stack.

The two-level sticky white header has an 88px main row and 48px navigation. Its requirement GET control carries actual description context to Find Your Part, never inventory search. Below 1150px secondary actions collapse into a 44px menu and the main row becomes 76px. Mobile insets are 10px/22px below 650px. The open menu remains white, immediate and directly below the header.

Homepage hero minimum height is 648px; content inset is 88px/32px/100px. At 650px it becomes 700px with 38px/22px/230px padding and the inherited mobile industrial scene. Finder overlaps by 44px, caps at 1376px, and uses 36px padding with a 0.7:1.3 split. At 760px it overlaps by 24px, uses 24px inset and stacks. Its actual fields and prefill remain operational.

Brand discovery uses five columns, three below 1150px. Circular disks measure 150px desktop, 110px below 760px and 86px below 650px. Category preview uses four columns with wide first/last panels, two below 1150px and one below 650px. Overlay panels are 280–290px tall. Component/audience grids move from three columns to one at 760px; process turns vertical and editorial cards stack.

Inner PageHero is a 510px dark photo-backed passage with a directional overlay and 700px copy limit. At 1100px it becomes 480px with 64px/32px insets. At 760px copy precedes a 280px image with dark transition overlay and stacked actions. Articles retain a 780px reading column and 480px supporting image (290px mobile). Supplier registration uses process aside and real form, then stacks. Customer access pairs industrial story and secure dark gated panel.

Operational shells, field/review grids and security gates remain governed by request CSS and components. The single Sales utility moves to top 14px/right 76px at 600px with a 48px icon target; mobile footer reserves 96px bottom padding. Preserve narrow-screen wrapping, imagery and fixed-control clearances.

## Elevation & Depth

Depth combines photo overlays, tonal bands and selective structural lift. Finder is intentionally raised; ordinary cards remain shadow-free. Header has no resting shadow.

- Finder: 0 16px 48px #20221f12.
- Embedded enquiry: 0 16px 48px #20221f0a; removed at 760px.
- Brand disk hover: 0 5px 16px #20221f0f with Brand Hover Border.
- Open mobile menu: 0 12px 24px #20221f12.
- Sales utility: 0 5px 18px #20221f26.

**The Structural Lift Rule.** Raise capture and contact utilities deliberately; use photo and tonal layering for other content.

## Shapes

Controls/photo cards use 4px corners; finder, discovery, embedded forms and customer panel use 8px. Header submit uses 3px. Process markers are 46px squares with 6px corners; supplier markers are 36px with 4px corners. Brand disks are circles. Preserve contained cutouts and supplied logo geometry; white brand artwork needs charcoal backing. Cover photography uses readable overlays. Fields have visible borders; errors strengthen the stroke and attachment-unavailable surfaces retain dashed outlines.

## Components

Public primary/outline/dark buttons retain 14px/22px padding, 50px minimum height and 14px/750 text. Primary hover darkens yellow; dark hover uses Ink Hover. Dark heroes use white-outline variants. Public focus is 3px Focus Red offset 4px. Request buttons retain 12px/18px padding, amber, weight 700, explicit disabled states and Request Red focus. Chips remain bordered 10px/14px controls with 44px targets and no invented persistent selection.

Public fields are white with Field Border, 12px padding and 48px minimum height; focus is 2px Focus Red offset 2px. Request/supplier fields keep their border, validation and entered values during failure. Reference text wraps with tabular numerals. Success appears only after persistence acknowledges a business reference. Vendor ID is a business reference; customer access remains gated Auth, never reference-only access.

Finder combines technical imagery with actual description, OEM/part number, brand, category and model context. Category mosaic primary clicks prefill enquiry; separate detail links retain real pages. Circular brand links preserve brand prefill. Component families illustrate enquiry shortcuts without inventory. Dark connected process/editorial passages, image audience panels, yellow technical landmark, warehouse supplier story, substantial dark CTA and grouped footer are the rich reusable vocabulary.

Articles combine narrow reading with a dark/yellow explanatory callout. Supplier pages retain process and real registration form. Customer panel uses white labels/Dark Muted copy, with explicit Ink Charcoal on its pale request-mode notice. Navigation retains aria-current underline, hover underline, Escape close and focus return.

Image hover is scale(1.025) over 160ms ease-out, only on fine hover pointers with no reduced-motion preference. Public button background changes use 160ms, press scale(0.98) uses 120ms. Reduced motion removes transitions and smooth scrolling; inherited press scale applies immediately. Menus and operational feedback appear immediately. No entrance hiding, marquees or parallax.

## Do's and Don'ts

### Do:
- **Do** preserve the original photo-rich CPS industrial identity and supplied logo.
- **Do** use raised capture panels, circular discovery and varied dark/photo/yellow passages where appropriate.
- **Do** retain enquiry prefill, operational amber and honest recovery states.
- **Do** pair pale notices with explicit Ink Charcoal inside dark panels.
- **Do** preserve mobile imagery, keyboard focus, reduced motion and clearances.
- **Do** keep illustrative images and brand rights visibly tied to review provenance.

### Don't:
- **Don't** return to uniformly minimal text-and-rule sections.
- **Don't** turn component imagery into stock, price, availability or authorization claims.
- **Don't** hide content behind repeated reveals or automatic brand motion.
- **Don't** bypass submission, upload, Auth or publication gates for visual completion.
- **Don't** show success before acknowledged persistence.
