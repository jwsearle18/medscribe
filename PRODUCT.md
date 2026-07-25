# Product

## Register

product

## Users

**Primary: a practicing clinician, mid-encounter or just after it.**

They are standing in an exam room or sitting down in the ten minutes between patients. They are tired, they are behind, and documentation is the part of the job they resent. They have used Epic or Cerner for years and have low expectations of medical software, which means they are fast to distrust and slow to forgive. They will not read documentation, they will not watch an onboarding video, and they will abandon anything that costs them more time than it saves.

Their job to be done: **turn a spoken conversation into a defensible clinical note without retyping it.** Success is measured in seconds saved per encounter and in how little of the generated note they have to correct.

The secondary audience is an engineer evaluating this as a portfolio piece, specifically at Voquill. That audience is served by designing honestly for the clinician, not by designing for the reviewer. A tool that a real doctor would trust reads as engineering; a tool that explains itself to a visitor reads as a demo. Accommodations for cold visitors (the seeded patient, the sample conversation) exist, but they stay at the edges and never distort the primary workflow.

## Product Purpose

MedScribe records a doctor and patient talking, transcribes it with speaker separation, and routes what was said into the structured fields of a clinical note. It exists because the structured note is the actual deliverable of a medical encounter, and today clinicians produce it by hand from memory, hours later, badly.

The product is not a transcription viewer and not a chatbot. The transcript is evidence; the structured note is the output. Every design decision should reinforce that the note is the artifact and the conversation is its source.

Success looks like: a clinician finishes an encounter, glances at a note that is already correct, fixes one field, and moves on.

## Brand Personality

**Confident, precise, unhurried.**

The interface has a clear point of view and does not hedge. It commits to a structured note rather than presenting options; it shows its state plainly rather than reassuring. Nothing apologizes, nothing celebrates, nothing explains itself twice.

Voice in UI copy: direct and clinical without being cold. Short labels. Verbs for actions. No exclamation marks, no "oops", no personality-in-microcopy. The tone a good colleague uses when handing you something they already checked.

Closest reference in feel: **Linear.** Dense without clutter, keyboard-reachable, restrained color, transitions that are quick enough to feel like direct manipulation. Opinionated, but the opinion shows in structure and restraint rather than in decoration.

## Anti-references

**1. Generic AI-startup SaaS.** Purple-to-blue gradients, glassmorphism, floating translucent cards over a mesh or illustrated background, the hero-metric template, gradient text. This is the single most likely "AI made that" tell, and the current codebase already commits several of these (`.glass-card`, the full-bleed background SVG, the skyblue accent on a slate field). Removing them is part of the work, not a matter of taste.

**2. Legacy hospital EHR.** Epic and Cerner: grey chrome stacked on grey chrome, nested tab bars, native form controls from 1998, density achieved by shrinking everything until it is unreadable. This is the incumbent the product argues against. Dense is the goal; cramped is the failure.

Also out of bounds: stock medical templates (teal on white, stethoscope iconography, pill buttons everywhere) and consumer health app softness (pastel cards, illustrations, progress rings, emoji).

## Design Principles

**1. Provenance over assertion.** The system generates clinical claims, so every generated field must be traceable to what was actually said. A clinician should be able to get from any field in the note to the moment in the transcript that produced it. Confidence, uncertainty, and "the model inferred this" are states worth showing; a note that looks equally certain everywhere is lying.

**2. The note is the artifact, the conversation is evidence.** Structured output gets primary hierarchy and primary screen real estate. Transcripts, audio, and raw text are supporting material and should be reachable without becoming the interface.

**3. Commit, then make correction cheap.** Do not ask the clinician to configure, choose a template, or confirm intent before the system does its work. Produce a complete structured note, then make every field fast to edit in place. Confidence with a cheap undo beats a wizard.

**4. Earn density.** A clinician wants to see the whole note at once, not click through it. Density is achieved with typographic hierarchy, spacing rhythm, and alignment, never by shrinking type or removing whitespace. If a screen needs a modal to show something, that is usually a layout failure.

**5. Motion reports state, never decorates.** Recording, transcribing, and generating are genuinely asynchronous, and the interface should make the current state obvious at a glance. That is the entire motion budget. No page-load choreography, no animated ornament.

## Accessibility & Inclusion

Target: **WCAG 2.1 AA.**

- AA contrast minimums for all text and meaningful UI (4.5:1 body, 3:1 large text and interactive boundaries).
- Every interactive element is keyboard reachable with a visible, deliberately designed focus state. Focus is never removed without an equivalent replacement.
- Never color alone to carry meaning. Recording state, field confidence, and validation all need a second channel (icon, label, shape, or text).
- `prefers-reduced-motion` respected. State changes remain legible when animation is off, which follows from principle 5.
- Clinical-safety corollary: destructive actions (discarding a recording, overwriting a generated note) require explicit confirmation, and no AI-generated text is ever presented as clinician-authored without being visibly marked as generated.
