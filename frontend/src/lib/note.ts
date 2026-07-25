// Shared model for the clinical note. Fields are stored either as a plain
// string (legacy notes) or as a provenance object {value, source, confidence}
// (current extraction). Everything downstream works off the normalized shape.

export type Confidence = "high" | "medium" | "low";

export type RawField =
  | string
  | null
  | {
      value?: string | null;
      source?: string | null;
      confidence?: Confidence | null;
      verified?: boolean;
    };

export type Forms = Record<string, RawField> | null;

export interface Visit {
  id: string;
  patient_id: string;
  transcript: string;
  title: string;
  time_completed: string;
  forms: Forms;
}

export interface NoteField {
  value: string;
  source: string | null;
  confidence: Confidence;
  verified: boolean;
}

export function normalizeField(raw: RawField): NoteField {
  if (raw && typeof raw === "object") {
    return {
      value: (raw.value ?? "").toString(),
      source: raw.source ?? null,
      confidence: raw.confidence ?? "high",
      verified: raw.verified ?? false,
    };
  }
  return {
    value: (raw ?? "").toString(),
    source: null,
    confidence: "high",
    verified: false,
  };
}

// SOAP + Coding grouping of the 20 note fields. `allergies` is deliberately
// absent: it gets its own banner at the top of the note, never a buried row.
export interface Section {
  id: string;
  label: string;
  fields: string[];
}

export const SECTIONS: Section[] = [
  {
    id: "subjective",
    label: "Subjective",
    fields: [
      "reason_for_visit",
      "history_of_present_illness",
      "review_of_systems",
      "current_medications",
      "past_medical_history",
      "surgical_history",
      "family_history",
      "hospitalizations_major_diagnostics",
      "preventive_medicine",
    ],
  },
  {
    id: "objective",
    label: "Objective",
    fields: ["vital_signs", "examination"],
  },
  {
    id: "assessment",
    label: "Assessment",
    fields: ["assessments"],
  },
  {
    id: "plan",
    label: "Plan",
    fields: ["procedures", "treatment_plan", "follow_up_detailed", "follow_up_short"],
  },
  {
    id: "coding",
    label: "Coding",
    fields: ["visit_codes", "procedure_codes"],
  },
];

export const FIELD_LABELS: Record<string, string> = {
  reason_for_visit: "Reason for visit",
  history_of_present_illness: "History of present illness",
  review_of_systems: "Review of systems",
  current_medications: "Current medications",
  past_medical_history: "Past medical history",
  surgical_history: "Surgical history",
  family_history: "Family history",
  allergies: "Allergies",
  hospitalizations_major_diagnostics: "Hospitalizations / diagnostics",
  preventive_medicine: "Preventive medicine",
  vital_signs: "Vital signs",
  examination: "Examination",
  assessments: "Assessment",
  procedures: "Procedures",
  treatment_plan: "Treatment plan",
  follow_up_detailed: "Follow-up (detailed)",
  follow_up_short: "Follow-up",
  visit_codes: "Visit code",
  procedure_codes: "Procedure codes",
  other_notes: "Other notes",
};

export const FOOTER_FIELD = "other_notes";

// A present, non-empty field. Empty extraction fields are simply omitted, but
// legacy notes sometimes store "" — treat those as absent too.
export function hasContent(field: NoteField): boolean {
  return field.value.trim().length > 0;
}

// Is this allergy value an actual allergy, or a "none on file" confirmation?
// Real allergies get the loud red band; a clean slate gets a quiet confirm.
export function isMeaningfulAllergy(value: string): boolean {
  const v = value.trim().toLowerCase();
  if (!v) return false;
  const negations = ["none", "no known", "nkda", "nka", "denies", "n/a", "no allergies"];
  return !negations.some((n) => v.startsWith(n) || v === n);
}
