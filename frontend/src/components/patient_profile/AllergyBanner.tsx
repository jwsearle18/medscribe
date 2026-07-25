"use client";

import { ExclamationTriangleIcon, ShieldCheckIcon } from "@heroicons/react/24/solid";
import type { NoteField } from "../../lib/note";
import { isMeaningfulAllergy } from "../../lib/note";
import ProvenancePopover from "./ProvenancePopover";

interface AllergyBannerProps {
  field: NoteField;
  onLocate: (source: string) => void;
}

/**
 * Allergies get pulled to the top of the note, never buried in a row. A real
 * allergy is the loudest, rarest signal on the screen (Alert). A clean slate is
 * shown as a quiet confirmation, so "reviewed, none" is legible at a glance.
 * Color is always paired with an icon and text, never carried alone.
 */
export default function AllergyBanner({ field, onLocate }: AllergyBannerProps) {
  const meaningful = isMeaningfulAllergy(field.value);

  if (meaningful) {
    return (
      <div className="flex items-start gap-2.5 rounded-md bg-alert-surface px-3.5 py-2.5">
        <ExclamationTriangleIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-alert" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.07em] text-alert">
              Allergy
            </span>
            {field.source && (
              <ProvenancePopover source={field.source} onLocate={() => onLocate(field.source!)} />
            )}
          </div>
          <p className="mt-0.5 text-[0.9375rem] leading-snug text-ink">{field.value}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2.5 rounded-md bg-chart px-3.5 py-2">
      <ShieldCheckIcon className="h-4 w-4 flex-shrink-0 text-verified" />
      <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.07em] text-graphite">
        Allergies
      </span>
      <span className="text-[0.875rem] text-ink">{field.value}</span>
    </div>
  );
}
