---
name: China Parts Shop
description: A clear, practical sourcing desk in CPS yellow, charcoal and warm paper.
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
typography:
  display:
    fontFamily: "Manrope, sans-serif"
    fontSize: "clamp(42px, 4.7vw, 72px)"
    fontWeight: 700
    lineHeight: 1.08
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Manrope, sans-serif"
    fontSize: "clamp(30px, 3.1vw, 46px)"
    fontWeight: 650
    lineHeight: 1.15
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
    backgroundColor: "{colors.warm-paper}"
    textColor: "{colors.ink-charcoal}"
    typography: "{typography.navigation}"
    padding: "18px 4%"
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
---

# Design System: China Parts Shop

## Overview

**Creative North Star: "A sourcing desk organized around the visitor's requirement"**

The CPS world feels like a clear working desk: warm paper, ink charcoal, precise labels and a bright yellow action surface. Manrope gives the interface a plain, confident voice. The established red CPS mark remains an identity asset; red in the interface signals focus, identification or correction rather than competing with yellow actions.

The material character comes from machined-metal inspection photography, flat tonal passages and visible rules. Generous section space sits beside compact, useful forms. An asymmetric editorial image and yellow action bar give the world its recognizable signature; related screens carry the same typography, restrained corners and border-led structure. The chosen direction rejects page-wide hiding, endless brand marquees, parallax, form entrances and animated counters.

**Key Characteristics:**
- Warm paper and charcoal surfaces with confident yellow actions.
- Clean Manrope hierarchy and legible, above-field labels.
- Flat editorial sections, fine dividers and restrained corners.
- Illustrative inspection imagery with visible context.
- Immediate feedback and readable mobile task layouts.

This is a record of the final implemented review world, extracted from `app/home.css`, `app/public.css`, `app/request/request.css`, `app/globals.css`, `app/fonts.css`, `app/layout.tsx`, `app/page.tsx` and the shared public/form components. The frontmatter records reused literal values; its spacing names describe observed roles, not an existing CSS-variable scale. The finish review closed three specified corrections. Neither that disposition nor this document approves future production behavior.

## Colors

The palette combines workshop yellow, warm white and olive-tinted charcoal, with quieter amber and slate variants inside request forms. Sidecar tonal strips are synthesized OKLCH display aids; they do not define additional implementation colors.

### Primary
- **CPS Yellow** (`cps-yellow`): homepage primary actions, connected process markers and the technical-help landmark; **CPS Yellow Hover** provides action feedback.
- **Request Amber** (`request-amber`): the existing enquiry and supplier submission treatment; its warmer hover is preserved as a separate request variant.

### Secondary
- **Sales Green** (`sales-green`): the single WhatsApp Sales utility, with a darker hover. Its role is human contact rather than the page's main enquiry action.
- **Focus Red / Request Red** (`focus-red`, `request-red`): public focus outlines and request progress/focus/checkbox accents. **Error Red** marks invalid fields and their adjacent messages. Preserve the red CPS logo asset without inferring a new UI color from its pixels.

### Neutral
- **Ink Charcoal / Request Ink**: primary text and dark passages; request pages retain their darker ink.
- **Warm Paper / Request Paper**: public and task-page backgrounds. **Capture Surface** separates the requirement panel and contact area without a raised card.
- **White**: editable fields and text on dark actions.
- **Muted Olive / Muted Slate**: supporting public and request copy. **Dark Muted** keeps supporting text readable on charcoal.
- **Divider / Request Divider**: list, rail and review-section rules. **Field Border / Request Field Border** distinguish editable surfaces.
- **Outline Hover / Ink Hover**: quiet state surfaces for outline and dark actions.
- **Warning Paper**: availability, mode and recovery notices. **Selection Yellow** is the final public/request selection background after the public stylesheet override.

**The Action Yellow Rule.** Use CPS Yellow for public primary actions and Request Amber for the existing request variant; preserve their distinct source values.

## Typography

**Display Font:** Manrope, with sans-serif fallback on the homepage.
**Body Font:** Manrope, with Arial and sans-serif fallback globally and on request pages.

**Character:** One clean sans-serif family carries the active public world. The local Manrope files support weights from 400 to 800 with `font-display: swap`. DM Mono and Playfair Display remain loaded for legacy styles; they are not the active public heading or label treatment.

### Hierarchy
- **Display:** the frontmatter's `display` role drives the homepage promise. At the 1100 px breakpoint it becomes 48 px; at 760 px it becomes 44 px with line height 1.1. Headings balance wrapping.
- **Headline:** the `headline` role drives section headings. At 760 px these become 31 px. Inline section headings have a desktop 32 px variant; the contact heading has a desktop 34 px variant.
- **Title:** `title` is the standard homepage subsection heading. The process uses a denser 18 px variant and guidance links a 23 px variant. Default heading weight is inherited where the component does not override it.
- **Body:** `body` is the homepage baseline. The hero introduction is 18 px on desktop and 16 px on mobile; supporting rows and resources use 14 px. Hero, section and form-support copy use observed limits of 48 ch, 56 ch and 65 ch respectively; guidance prose permits 72 ch.
- **Label:** `label` is the homepage above-field treatment. Request labels inherit the 16 px task baseline with weight 700; optional request annotations are 13 px at weight 400. Fine notes range from 11 to 13 px.
- **Navigation / Action:** the frontmatter records the 13 px navigation and 14 px action roles. Public brand type is 14 px with tracking 0.02 em; its second line is weight 800.
- **Request headings:** `request-headline` and `request-title` preserve the task-page hierarchy; supplier group titles use a 22 px variant.

**The Plain Heading Rule.** Keep active public headings in Manrope and let the heading lead the content; the customer-access correction removes its redundant above-heading brand label.

## Layout

The public world alternates open editorial sections with full-width tonal passages. The hero uses a maximum width of 1440 px, a 1.05:1 split, 44 px gap and padding of 48 px vertically at the top, 5% horizontally and 40 px at the bottom. Its inspection frame is 470 px tall, with the image focused at 65% center. Content sections cap at 1280 px with 76 px by 48 px padding; full-width passages align to an inner 1184 px measure through calculated gutters. Two-column section introductions use a 60 px gap.

At 1100 px, public sections use 32 px gutters and 56 px vertical section padding; the hero uses 40 px by 32 px padding and a 28 px gap. At 760 px, the hero and broad paired sections stack. Standard sections use 44 px by 22 px padding, while technical/contact passages use 40 px by 22 px. Actions stretch vertically and the image becomes 250 px tall. Category rows shift from three columns to two, resources from three to one, and the four-step process becomes a connected vertical sequence. The brand rail remains manually scrollable with proximity snapping; item widths fall from 176 px to 150 px.

Homepage fields use two columns with gaps of 22 px vertically and 28 px horizontally, then one column with a 20 px gap at 760 px. Request and supplier pages share a 900 px shell, padded 40 px by 24 px with 64 px below, and a two-column field grid with a 24 px gap. At 600 px the shell becomes 24 px by 16 px with 48 px below, fields stack, and review key/value rows become one column. Request pages reserve 100 px below their content. Public anchored sections use a 100 px scroll margin.

The header compresses at 1180 px, changes to a menu at 1100 px, and keeps 44 px navigation/menu targets. On screens up to 600 px, the sole Sales utility is a 48 px icon control at top 14 px and right 76 px, between the brand and menu; it does not occupy the form or inspection caption area. Staff supplier lists and details also stack at 1100 px, with long identifiers allowed to wrap.

The observed spacing is a practical rhythm rather than a rigid single-step scale: repeated small gaps sit around 8–16 px, controls around 12–24 px, content gaps around 28–48 px, and desktop section space at 76 px. Preserve the actual component relationships when extending the system.

## Elevation & Depth

Depth is mostly tonal and border-led. The header explicitly removes box shadow, although it retains the global header's 12 px backdrop blur. Warm paper, the slightly darker capture surface, charcoal and yellow create clear landmarks without enclosing every section in a raised card. Photography is clipped to a restrained frame. The floating Sales utility is the active public world's limited shadow-bearing exception.

### Shadow Vocabulary
- **Sales utility:** `0 5px 18px #20221f26`; a small functional lift that separates the fixed contact control from content.

**The Flat Desk Rule.** Use tonal passages and rules for content hierarchy; retain the Sales utility's limited lift instead of introducing a general card-shadow system.

## Shapes

Most controls and the editorial photo frame have gently eased corners (`rounded.control`). The Sales utility and unavailable-attachment panel use the slightly rounder utility shape (`rounded.utility`). Circular 36 px process markers use `rounded.circle`; circles communicate numbered progression rather than general container styling.

Fields, menu controls, outline actions and part-system chips use visible one-pixel borders. Invalid request fields strengthen to a two-pixel error stroke. Resource links use a two-pixel ink top rule; categories and brand rails use fine divider rules. The unavailable attachment panel uses a dashed border to distinguish a non-editable recovery surface. Preserve supplied brand geometry; white JAC Motors and Chery artwork receives a charcoal backing with 8 px inset and control-radius corners.

## Components

### Buttons

Confident, compact actions with clear text and restrained state feedback.

- **Public primary / outline / dark:** share the frontmatter's control radius, 14 px by 22 px padding, 16 px icon gap and 50 px minimum height. Primary is yellow/ink; outline is transparent/ink with a `#96988f` stroke; dark is charcoal/white.
- **Hover / press:** public actions change background over 160 ms `ease-out`; a press scales to 0.98 over 120 ms `ease-out`. Public focus is a three-pixel Focus Red outline with four-pixel offset.
- **Request actions:** use 12 px by 18 px padding, weight 700, the inherited 16 px task font, one-pixel border and the same control radius. The primary border is `#856005`; generic buttons are white with a `#63696b` border and `#eee` hover. Disabled buttons use opacity 0.55 and a not-allowed cursor. Request focus is a three-pixel Request Red outline with four-pixel offset. No request transition or press transform is defined.
- **Motion:** reduced motion removes the public action transitions and changes anchor scrolling to automatic; the active scale still applies immediately. Menus and pending states appear immediately. Smooth anchor scrolling applies otherwise. Existing legacy reveal selectors do not define the current public components.

### Chips

Part-system shortcuts feel like small tools rather than decorative badges. They are transparent with a `#989c8e` border, control-radius corners, 10 px by 14 px padding and a 44 px minimum height. They append requirement information; no persistent selected-chip treatment is implemented. They receive the common public button focus outline and have no bespoke hover or press effect.

### Cards / Containers

The current public system favors open containers and ruled rows. The light requirement panel is a full-width Capture Surface passage, not a shadow card. The unavailable-attachment container uses utility-radius corners, a `#979b8e` dashed border and 24 px inset. Warning notices use Warning Paper and 16 px inset; the mode banner uses 12 px by 16 px. Review sections use 24 px vertical space and a divider, without a card shadow.

### Inputs / Fields

Border-led, visibly editable fields with labels above the control.

- **Homepage fields:** white/ink, Field Border, 15 px font, 12 px padding and 48 px minimum height. Placeholder text uses `#62665b`. Their focus outline is two-pixel Focus Red with two-pixel offset; the homepage caret is `#b92f20`.
- **Request and supplier fields:** white surfaces, Request Field Border, inherited request typography and 12 px padding. The task container uses Request Ink; editable fields do not declare a separate text-color override. The final public override makes text-field carets Focus Red. Invalid fields use Error Red and adjacent 14 px error text; focus uses the request outline described above.
- **Textareas / references:** homepage textareas resize vertically; supplier textareas have a 100 px minimum height. References use tabular numerals and wrap rather than clipping. Labels and error descriptions stay associated with their controls.
- **State presentation:** pending text changes immediately and blocked actions are visibly disabled. Failure/recovery copy appears in notices while entered values remain visible; acknowledged success replaces the form with a focused heading and reference. Do not add an optimistic success badge.

### Navigation

The public navigation is a warm-paper sticky header, with 18 px by 4% inset, a fine `#dedfd7` bottom border and no shadow. The brand combines the actual CPS image with stacked text. Desktop links use the frontmatter navigation role, a 20 px gap and 44 px minimum height; hover underlines have a five-pixel offset. There is no persistent active-link color treatment in the current header.

At 1180 px, link type becomes 12 px and gaps become 16 px. At 1100 px, the bordered 44 px menu button opens an absolute, full-width warm-paper list directly below the header, with 18 px by 24 px inset, 14 px type and three-pixel gaps. It exposes expanded state and a navigation relationship; the icon changes between menu and close, and choosing a link closes the list. Public focus remains visible.

### Sales Utility

One green contact control carries a 22 px message icon, 12 px bold Manrope label, utility-radius corners, 48 px minimum height and the limited shadow from Elevation & Depth. Desktop placement is bottom 20 px/right 22 px; the 1100 px variant uses 16 px offsets and 12 px by 14 px inset. At 600 px it moves into the header area with the position documented in Layout and visually hides its label while retaining an accessible name. It darkens on hover and keeps the public focus outline.

### Connected Process / Brand Rail

Numbered yellow circles connect through fine `#b8bbaf` rules. Desktop markers sit above four columns; mobile rules turn vertically beside stacked copy, with process icons hidden. The brand rail uses contained 120 px by 48 px supplied marks, generous clickable rows and small text/arrow labels. It has explicit charcoal backing for the white marks, a quiet Capture Surface hover and a thin scrollbar; manual touch and keyboard interaction supplies movement.

## Do's and Don'ts

### Do:
- **Do** preserve the CPS identity asset, Manrope hierarchy and yellow/charcoal/warm-paper world.
- **Do** keep homepage CPS Yellow and request Request Amber as the distinct implemented action variants.
- **Do** use above-field labels, visible focus outlines and adjacent error messages.
- **Do** extend open, ruled and tonal containers before adding raised cards.
- **Do** keep the mobile Sales utility in its clear header position and retain the contrasting backings for white brand artwork.
- **Do** keep immediate pending/recovery feedback and show a success reference only after acknowledgment.

### Don't:
- **Don't** bring legacy serif headings, mono eyebrows or commercial card styling into the active public world.
- **Don't** add page-wide reveal hiding, endless marquees, parallax, form entrances or animated counters.
- **Don't** make every content group a rounded, shadow-bearing card.
- **Don't** cover labels, editable fields or illustrative captions with fixed controls.
- **Don't** turn brand references or illustrative inspection imagery into a visual claim of authorization or available stock.
