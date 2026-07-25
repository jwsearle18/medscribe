"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownTrayIcon,
  ChevronDownIcon,
  DocumentTextIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import {
  FIELD_LABELS,
  FOOTER_FIELD,
  SECTIONS,
  hasContent,
  normalizeField,
  type Forms,
  type NoteField as NoteFieldModel,
  type Visit,
} from "../../lib/note";
import NoteField from "./NoteField";
import AllergyBanner from "./AllergyBanner";
import TranscriptPanel from "./TranscriptPanel";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL;

// Local, un-persisted edits and confirmations, keyed by visit then field. Edits
// to an existing note stay in the browser so the shared demo record stays
// pristine for the next viewer; the download reflects them.
type Override = { value?: string; verified?: boolean };
type Overrides = Record<string, Record<string, Override>>;

const PatientProfile = () => {
  const searchParams = useSearchParams();
  const patientId = searchParams.get("patient_id");

  const [visits, setVisits] = useState<Visit[]>([]);
  const [currentVisitId, setCurrentVisitId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [overrides, setOverrides] = useState<Overrides>({});
  const [generated, setGenerated] = useState<Record<string, Forms>>({});
  const [generating, setGenerating] = useState<string | null>(null);
  const [genError, setGenError] = useState<string | null>(null);

  const [transcriptOpen, setTranscriptOpen] = useState(false);
  const [highlight, setHighlight] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!patientId) return;
    const fetchPatientData = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${BACKEND}/api/get-patient-data?patient_id=${patientId}`);
        if (!res.ok) throw new Error("Failed to load patient data");
        const data: Visit[] = await res.json();
        setVisits(data);
        if (data.length > 0) setCurrentVisitId(data[0].id);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    fetchPatientData();
  }, [patientId]);

  const currentVisit = useMemo(
    () => visits.find((v) => v.id === currentVisitId) ?? null,
    [visits, currentVisitId],
  );

  // The forms actually shown: a freshly generated (unsaved) note wins over the
  // stored one for a not-yet-documented visit.
  const effectiveForms: Forms = currentVisit
    ? generated[currentVisit.id] ?? currentVisit.forms
    : null;

  // Resolve a stored field through any local edit/confirm.
  const resolveField = (fieldKey: string, raw: unknown): NoteFieldModel => {
    const base = normalizeField(raw as never);
    const ov = currentVisit ? overrides[currentVisit.id]?.[fieldKey] : undefined;
    if (!ov) return base;
    return {
      ...base,
      value: ov.value ?? base.value,
      verified: ov.verified ?? base.verified,
    };
  };

  const setOverride = (fieldKey: string, patch: Override) => {
    if (!currentVisit) return;
    setOverrides((prev) => ({
      ...prev,
      [currentVisit.id]: {
        ...prev[currentVisit.id],
        [fieldKey]: { ...prev[currentVisit.id]?.[fieldKey], ...patch },
      },
    }));
  };

  const openTranscript = (source: string | null) => {
    setHighlight(source);
    setTranscriptOpen(true);
  };

  const handleGenerate = async () => {
    if (!currentVisit) return;
    try {
      setGenError(null);
      setGenerating(currentVisit.id);
      const res = await fetch(`${BACKEND}/ai/extract_form_data`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcription: currentVisit.transcript }),
      });
      if (!res.ok) throw new Error("The note could not be generated. Try again.");
      const forms: Forms = await res.json();
      setGenerated((prev) => ({ ...prev, [currentVisit.id]: forms }));
    } catch (err) {
      setGenError((err as Error).message);
    } finally {
      setGenerating(null);
    }
  };

  const handleDownload = async () => {
    if (!currentVisit || !effectiveForms) return;
    try {
      setDownloading(true);
      // Send the effective (edited) values so the PDF matches what's on screen.
      const flat: Record<string, string> = {};
      for (const key of Object.keys(effectiveForms)) {
        flat[key] = resolveField(key, effectiveForms[key]).value;
      }
      const res = await fetch(`${BACKEND}/pdf/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(flat),
      });
      if (!res.ok) throw new Error("PDF generation failed");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${patientId ?? "patient"}-note.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setGenError((err as Error).message);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-3xl px-6 py-10">
        <NoteSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-3xl px-6 py-16 text-center">
        <p className="text-ink">{error}</p>
        <p className="mt-1 text-sm text-mute">Patient {patientId}</p>
      </div>
    );
  }

  if (!currentVisit) {
    return (
      <div className="w-full max-w-3xl px-6 py-16 text-center">
        <p className="text-ink">No visits found for patient {patientId}.</p>
      </div>
    );
  }

  const visitDate = new Date(currentVisit.time_completed);

  return (
    <div className="w-full max-w-3xl px-6 py-8">
      {/* Visit header: patient identity + visit switcher + actions */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-rule pb-4">
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="font-serif text-[1.75rem] leading-tight tracking-[-0.01em] text-ink">
              {patientId}
            </h1>
          </div>

          {/* Visit switcher */}
          <div className="relative mt-1">
            <button
              type="button"
              onClick={() => setSwitcherOpen((o) => !o)}
              aria-expanded={switcherOpen}
              className="focus-ring flex items-center gap-1.5 rounded-sm text-left text-graphite hover:text-ink"
            >
              <span className="text-[0.9375rem]">{currentVisit.title}</span>
              <span className="text-mute">·</span>
              <span className="text-[0.8125rem] text-mute">
                {visitDate.toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
              {visits.length > 1 && <ChevronDownIcon className="h-3.5 w-3.5 text-mute" />}
            </button>

            {switcherOpen && visits.length > 1 && (
              <ul className="overlay-shadow absolute left-0 top-8 z-30 w-80 max-w-[80vw] overflow-hidden rounded-md border border-rule bg-bone py-1">
                {visits.map((v) => {
                  const documented = !!(generated[v.id] ?? v.forms);
                  return (
                    <li key={v.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentVisitId(v.id);
                          setSwitcherOpen(false);
                        }}
                        className={`flex w-full items-center justify-between gap-3 px-3 py-2 text-left hover:bg-chart ${
                          v.id === currentVisit.id ? "bg-chart" : ""
                        }`}
                      >
                        <span className="min-w-0">
                          <span className="block truncate text-[0.875rem] text-ink">{v.title}</span>
                          <span className="block text-[0.75rem] text-mute">
                            {new Date(v.time_completed).toLocaleDateString(undefined, {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </span>
                        {!documented && (
                          <span className="flex-shrink-0 rounded-sm bg-caution-surface px-1.5 py-px text-[0.625rem] font-semibold uppercase tracking-wide text-caution">
                            No note
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => openTranscript(null)}
            className="focus-ring inline-flex items-center gap-1.5 rounded-md border border-rule bg-transparent px-3 py-1.5 text-[0.875rem] font-medium text-ink hover:bg-chart"
          >
            <DocumentTextIcon className="h-4 w-4" />
            Transcript
          </button>
          {effectiveForms && (
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              className="focus-ring inline-flex items-center gap-1.5 rounded-md bg-ink px-3 py-1.5 text-[0.875rem] font-semibold text-bone hover:bg-graphite disabled:opacity-60"
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
              {downloading ? "Preparing…" : "Download"}
            </button>
          )}
        </div>
      </div>

      {/* Note body, or the generate affordance for an undocumented visit */}
      {effectiveForms ? (
        <Note
          forms={effectiveForms}
          resolveField={resolveField}
          onEdit={(k, value) => setOverride(k, { value, verified: true })}
          onVerify={(k) => setOverride(k, { verified: true })}
          onLocate={openTranscript}
        />
      ) : (
        <EmptyNote
          generating={generating === currentVisit.id}
          error={genError}
          onGenerate={handleGenerate}
        />
      )}

      <TranscriptPanel
        open={transcriptOpen}
        transcript={currentVisit.transcript}
        highlight={highlight}
        onClose={() => setTranscriptOpen(false)}
      />
    </div>
  );
};

// --- Note body ---------------------------------------------------------------

interface NoteProps {
  forms: NonNullable<Forms>;
  resolveField: (fieldKey: string, raw: unknown) => NoteFieldModel;
  onEdit: (fieldKey: string, value: string) => void;
  onVerify: (fieldKey: string) => void;
  onLocate: (source: string | null) => void;
}

function Note({ forms, resolveField, onEdit, onVerify, onLocate }: NoteProps) {
  const allergy = "allergies" in forms ? resolveField("allergies", forms.allergies) : null;
  const footerRaw = FOOTER_FIELD in forms ? resolveField(FOOTER_FIELD, forms[FOOTER_FIELD]) : null;

  return (
    <div className="pt-5">
      {allergy && hasContent(allergy) && (
        <div className="mb-6">
          <AllergyBanner field={allergy} onLocate={(s) => onLocate(s)} />
        </div>
      )}

      {SECTIONS.map((section) => {
        const present = section.fields
          .filter((key) => key in forms)
          .map((key) => ({ key, field: resolveField(key, forms[key]) }))
          .filter(({ field }) => hasContent(field));
        if (present.length === 0) return null;

        return (
          <section key={section.id} className="mb-7">
            <h2 className="mb-1 border-b border-rule pb-1.5 text-[0.6875rem] font-semibold uppercase tracking-[0.09em] text-graphite">
              {section.label}
            </h2>
            <div className="divide-y divide-rule">
              {present.map(({ key, field }) => (
                <NoteField
                  key={key}
                  fieldKey={key}
                  label={FIELD_LABELS[key] ?? key}
                  field={field}
                  onEdit={(value) => onEdit(key, value)}
                  onVerify={() => onVerify(key)}
                  onLocate={(s) => onLocate(s)}
                />
              ))}
            </div>
          </section>
        );
      })}

      {footerRaw && hasContent(footerRaw) && (
        <p className="mt-6 border-t border-rule pt-4 text-[0.8125rem] italic leading-relaxed text-mute">
          {footerRaw.value}
        </p>
      )}
    </div>
  );
}

// --- Empty / generate state --------------------------------------------------

interface EmptyNoteProps {
  generating: boolean;
  error: string | null;
  onGenerate: () => void;
}

function EmptyNote({ generating, error, onGenerate }: EmptyNoteProps) {
  if (generating) {
    return (
      <div className="pt-5">
        <div className="mb-6 flex items-center gap-2.5 text-graphite">
          <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-rule border-t-ink" />
          <span className="text-[0.875rem]">Reading the transcript and drafting the note…</span>
        </div>
        <NoteSkeleton />
      </div>
    );
  }

  return (
    <div className="pt-12 pb-8 text-center">
      <p className="text-[0.9375rem] text-graphite">No note has been generated for this visit.</p>
      <p className="mx-auto mt-1 max-w-sm text-[0.8125rem] text-mute">
        MedScribe reads the encounter transcript and drafts a structured note, with every field
        traceable back to what was said.
      </p>
      <button
        type="button"
        onClick={onGenerate}
        className="focus-ring mt-5 inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2 text-[0.9375rem] font-semibold text-bone hover:bg-graphite"
      >
        <SparklesIcon className="h-4 w-4" />
        Generate note
      </button>
      {error && <p className="mt-3 text-[0.8125rem] text-alert">{error}</p>}
    </div>
  );
}

// --- Skeleton ----------------------------------------------------------------

function NoteSkeleton() {
  return (
    <div className="space-y-6" aria-hidden="true">
      {[3, 2, 1].map((rows, s) => (
        <div key={s}>
          <div className="mb-3 h-2.5 w-24 rounded bg-rule" />
          <div className="space-y-3">
            {Array.from({ length: rows }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <div className="h-2 w-28 rounded bg-chart" />
                <div className="h-3 w-full rounded bg-chart" />
                <div className="h-3 w-4/5 rounded bg-chart" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default PatientProfile;
