---
name: MedScribe
description: A clinical note is the artifact; the conversation is its evidence.
colors:
  bone: "#f9f6f2"
  chart: "#f0ece7"
  rule: "#dbd7d1"
  rule-strong: "#c2bdb7"
  ink: "#211c17"
  graphite: "#5c5752"
  mute: "#6d6863"
  alert: "#bc2826"
  alert-surface: "#ffe7e4"
  caution: "#905500"
  caution-surface: "#feedd7"
  verified: "#2e734b"
  verified-surface: "#e0f5e6"
typography:
  display:
    fontFamily: "'Newsreader', Georgia, 'Times New Roman', serif"
    fontSize: "1.75rem"
    fontWeight: 400
    lineHeight: 1.15
    letterSpacing: "-0.01em"
  title:
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.006em"
  body:
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "0"
  label:
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.07em"
  mono:
    fontFamily: "'Berkeley Mono', 'JetBrains Mono', ui-monospace, 'SF Mono', monospace"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0"
rounded:
  sm: "3px"
  md: "5px"
  lg: "8px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "20px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.bone}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  button-primary-hover:
    backgroundColor: "{colors.graphite}"
    textColor: "{colors.bone}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  button-ghost:
    backgroundColor: "{colors.bone}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  field:
    backgroundColor: "{colors.bone}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "8px 10px"
  chip-verified:
    backgroundColor: "{colors.verified-surface}"
    textColor: "{colors.verified}"
    rounded: "{rounded.sm}"
    padding: "1px 6px"
---

# Design System: MedScribe

## 1. Overview

**Creative North Star: "The Attending's Chart"**

Picture the paper chart a senior physician actually kept: warm off-white stock, printed in a dense monochrome hand, where the only ink that was ever a different color meant something clinical, an allergy underlined in red, a flag in the margin. MedScribe is that chart rebuilt as fast software. The surface is quiet, warm, and achromatic. Color is not decoration and never sets a mood; color is a clinical signal with a fixed vocabulary. When a field turns red on this screen, a clinician should feel the same small jolt they feel seeing red on a real chart.

The system is dense the way a well-set page is dense, through typographic hierarchy and spacing rhythm, never through shrinking or cramming. It borrows Linear's discipline (restraint, keyboard reach, transitions quick enough to feel like direct manipulation) but not Linear's palette or its dark chrome. It is light because a clinician reads it in a bright room, and it is warm-neutral because cold grey is the color of the EHR it replaces.

This system explicitly rejects two things. It rejects **generic AI-startup SaaS**: no purple-to-blue gradients, no glassmorphism, no translucent cards floating on a mesh, no gradient text, no hero-metric template. It rejects the **legacy hospital EHR**: no grey-on-grey chrome, no native 1998 form controls, no density achieved by making text unreadable. If the interface looks like it could belong to any AI tool, or like it belongs to Epic, it has failed.

**Key Characteristics:**
- Light, warm, achromatic canvas; the only color is clinical meaning.
- A serif for the patient's name and the note's identity; a sans for everything operational.
- Density earned through hierarchy and rhythm, not compression.
- Structure carried by hairline rules and tonal layers, not shadows or cards.
- Every generated claim is visibly traceable back to what was said.

## 2. Colors

A warm greyscale carrying three, and only three, saturated clinical signals. The chroma budget is spent entirely on meaning.

### Primary
The primary "color" of this system is **Ink** used against **Bone**. There is no brand accent; the strongest emphasis on the screen is dark text and dark fills, not a hue.
- **Ink** (`#211c17`, `oklch(23% 0.012 70)`): Primary text, the note body, primary button fills, active states. A near-black warmed toward the paper so it never reads as cold pure black. Contrast 15.7:1 on Bone.

### Semantic (the only saturated colors permitted)
Each has a foreground (for text and icons) and a tinted surface (for backgrounds and inline highlights). Never use a semantic color decoratively.
- **Alert** (`#bc2826` on `#ffe7e4`): Allergies, contraindications, drug interactions, hard clinical stops. The rarest and loudest signal. 5.6:1 on Bone.
- **Caution** (`#905500` on `#feedd7`, an amber-brown): Low-confidence extraction, an inferred value the model was not certain about, a field needing clinician review. 5.6:1 on Bone.
- **Verified** (`#2e734b` on `#e0f5e6`): A field the clinician has confirmed, or a value quoted verbatim from the transcript with high confidence. 5.3:1 on Bone.

### Neutral
- **Bone** (`#f9f6f2`): The primary canvas. Warm off-white paper stock.
- **Chart** (`#f0ece7`): The secondary surface, one tonal step down. Panels, the transcript column, table header rows, inset regions. This is how we layer without shadows or cards.
- **Graphite** (`#5c5752`): Secondary text, field labels, metadata. 6.6:1 on Bone.
- **Mute** (`#6d6863`): Tertiary text, timestamps, placeholder, disabled-but-legible. 5.1:1 on Bone, the floor for meaningful text.
- **Rule** (`#dbd7d1`): The default hairline. Dividers, field underlines, table gridlines, panel edges.
- **Rule-strong** (`#c2bdb7`): A heavier hairline for primary structural divisions and focus-adjacent borders.

### Named Rules
**The Clinical Color Rule.** Saturated color appears on screen if and only if it carries one of the three fixed meanings: Alert, Caution, Verified. There is no fourth color and no decorative use. A screen at rest should be entirely warm-neutral; the appearance of any hue is information. This is the whole reason the palette works, and breaking it once destroys it everywhere.

**The Warm Neutral Rule.** Every neutral is tinted toward hue 70-75 (chroma 0.006-0.012). Pure `#000`, pure `#fff`, and any cold blue-grey are forbidden. Cold grey is the color of the incumbent EHR; we are not that.

## 3. Typography

**Display Font:** Newsreader (with Georgia, then Times New Roman, serif)
**Body / UI Font:** Inter (with system-ui, then -apple-system, sans-serif)
**Mono Font:** Berkeley Mono (with JetBrains Mono, ui-monospace, monospace)

**Character:** A working serif carries identity, the patient's name, the note's title, the sense that this is a document with a subject. Inter carries every operational surface: labels, buttons, tables, the structured fields themselves. The pairing says "this is a record about a person," while keeping the machinery in a clean, dense sans. Mono is reserved for verbatim transcript quotes and identifiers (MRN, patient ID), where character-level precision reads as evidence.

### Hierarchy
- **Display** (Newsreader, 400, 1.75rem, 1.15): The patient name and the note title only. The one place a serif appears. Never on buttons, never on labels.
- **Title** (Inter, 600, 1.0625rem/17px, 1.3): Section headings within a note (Subjective, Assessment, Plan), panel titles.
- **Body** (Inter, 400, 0.9375rem/15px, 1.55): The note content, the substance of every field. Prose fields cap at 68ch; dense data may run wider.
- **Label** (Inter, 600, 0.6875rem/11px, 0.07em tracking, UPPERCASE): Field labels, column headers, the small caps-y taxonomy of the chart. Tracking and case do the work; never bold-shout with size.
- **Mono** (Berkeley Mono, 400, 0.8125rem/13px, 1.5): Verbatim transcript excerpts, patient/encounter identifiers, timestamps in provenance views.

### Named Rules
**The Serif-Is-Sacred Rule.** Newsreader appears only for the patient's name and the note's title. Every additional serif dilutes the one signal it carries: this record is about a person. If a serif shows up on a button or a field label, it is wrong.

**The Label-Is-Not-Loud Rule.** Field labels earn distinction through uppercase and letter-spacing at 11px in Graphite, not through size or heavy weight. Labels recede; the clinical values they name are what the eye should land on.

## 4. Elevation

This system is **flat by structural intent**. Depth is conveyed through tonal layering (Bone against Chart) and hairline rules (Rule, Rule-strong), not through shadows. A panel is not a card that floats; it is a region of Chart bounded by a hairline, sitting inside a field of Bone. This is the paper-chart logic: pages do not cast shadows on each other, they sit in sections divided by ruled lines.

Shadows are permitted in exactly one situation: a genuinely transient overlay that must visually detach from the plane beneath it (a dropdown menu, a hover-triggered provenance popover, a command palette). These are the only elements allowed to leave the plane, because they are the only elements that are truly temporary.

### Shadow Vocabulary
- **Overlay** (`box-shadow: 0 8px 24px -8px rgba(33,28,23,0.18), 0 2px 6px -2px rgba(33,28,23,0.12)`): Transient popovers, dropdowns, the command palette. Warm-tinted (based on Ink, never on pure black), soft, and directional-down.

### Named Rules
**The No-Card Rule.** Content is organized by tonal layer and hairline rule, not by rounded floating cards with drop shadows. If you are reaching for a white card with a shadow on a grey background, you are drawing the anti-reference. Use a Chart-toned region with a Rule border instead. Nested cards are always forbidden.

**The Shadow-Means-Temporary Rule.** If it casts a shadow, it must be dismissable and transient. Persistent structure never casts a shadow.

## 5. Components

### Buttons
- **Shape:** Gently squared (5px radius, `rounded.md`). Not pill-shaped, not sharp-cornered.
- **Primary:** Ink fill (`#211c17`), Bone text, 8px/16px padding, Inter 600 at body size. This is the darkest thing on the screen, which is how emphasis is signaled without a hue.
- **Hover / Focus:** Hover lifts the fill to Graphite (`#5c5752`) over 150ms. Focus shows a 2px Ink ring offset 2px from the element (`box-shadow: 0 0 0 2px #f9f6f2, 0 0 0 4px #211c17`), never a removed outline.
- **Ghost:** Bone (or transparent) background, Ink text, 1px Rule border. Hover fills to Chart. For secondary and tertiary actions.
- **Destructive:** Ghost shape with Alert text and an Alert-surface hover. Discarding a recording or overwriting a generated note additionally requires an inline confirmation, never a bare click.

### Fields (the signature component)
The structured note is a stack of editable fields, and this is the most important component in the system.
- **At rest:** The field value in Body Ink, sitting under a Label. Separated from the next field by a Rule hairline, not boxed. The field looks like a line in a chart, not a form input.
- **Editing:** Click-to-edit in place. The value's background lifts to Chart, a Rule-strong underline appears, caret in Ink. No modal, ever, for editing a field.
- **Confidence channel:** A field extracted with low confidence carries a Caution left-edge marker (a 2px Caution rule is the one permitted colored edge, because here it is data, not decoration) plus a Caution "review" label. A clinician-confirmed field carries a small Verified chip. Confidence is never signaled by color alone; the chip and label carry text.
- **Provenance:** Each generated field has an affordance (a small mono "¶" or hover target) that reveals the transcript span that produced it, in a transient Overlay popover with the source text in Mono.

### Chips
- **Style:** Small, low, 3px radius, Label typography. Semantic surface background with matching foreground text (e.g. Verified chip: `#e0f5e6` bg, `#2e734b` text).
- **State:** Status only (Verified, Review, Allergy). Chips are read-only signals, not interactive filters, unless explicitly a filter control.

### Panels / Regions
- **Corner Style:** 8px (`rounded.lg`) on the outermost regions, square internal divisions.
- **Background:** Chart (`#f0ece7`) against a Bone page.
- **Border:** 1px Rule; no shadow (see Elevation).
- **Internal Padding:** 20px (`spacing.lg`) for content regions, tightened to 12px in dense lists.

### Inputs (search, text entry)
- **Style:** Bone background, 1px Rule border, 5px radius, Ink text, Mute placeholder. Replaces the current heavy `border-2 border-black` search box.
- **Focus:** Border shifts to Ink, plus a 2px Ink ring at 2px offset. No glow, no color-shift to an accent hue (there is no accent hue).

### Navigation
- **Style:** A single top bar on Bone with a 1px Rule bottom border. Brand in Newsreader-adjacent weight, search on the right. No side nav for the demo's scope.
- **States:** Active nav item in Ink; inactive in Graphite; hover to Ink. Underline or weight for active, never a colored pill.

## 6. Do's and Don'ts

### Do:
- **Do** keep the resting screen entirely warm-neutral. If you see a hue, it must mean Alert, Caution, or Verified.
- **Do** tint every neutral toward hue 70-75 (Bone `#f9f6f2`, Ink `#211c17`). Warm, never cold.
- **Do** layer with Chart-on-Bone and hairline Rules to create structure.
- **Do** reserve Newsreader for the patient name and note title, nothing else.
- **Do** edit fields in place with click-to-edit; keep the whole note visible while editing.
- **Do** give every generated field a visible path back to its transcript source (provenance principle).
- **Do** pair every color signal with a text or icon channel, so meaning survives color blindness and greyscale.
- **Do** keep transitions at 150-250ms and reserve motion for genuine state changes (recording, transcribing, generating).

### Don't:
- **Don't** use purple-to-blue gradients, glassmorphism, translucent floating cards, gradient text, or the hero-metric template. This is the generic-AI-SaaS anti-reference, and the current code (`.glass-card`, the mesh background SVG, the `#5680E9` skyblue accent) commits it. Delete it.
- **Don't** reintroduce cold grey-on-grey chrome, native 1998 form controls, or unreadable compression. That is the legacy-EHR anti-reference.
- **Don't** use `#000` or `#fff` anywhere.
- **Don't** introduce a fourth accent color or use any semantic color decoratively. The palette breaks the moment color stops meaning something.
- **Don't** put content in rounded white cards with drop shadows on a grey field. Use Chart regions with Rule borders. Never nest cards.
- **Don't** open a modal to view or edit a note field. A modal for field editing is a layout failure (Design Principle 4).
- **Don't** use a colored `border-left` greater than 1px as decoration. The one exception is the 2px Caution/Alert field marker, where the edge is clinical data, not styling.
- **Don't** signal confidence, recording state, or validation with color alone.
- **Don't** animate layout properties or add page-load choreography.
