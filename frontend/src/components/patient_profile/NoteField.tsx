"use client";

import { useEffect, useRef, useState } from "react";
import { CheckIcon } from "@heroicons/react/24/solid";
import type { NoteField as NoteFieldModel } from "../../lib/note";
import ProvenancePopover from "./ProvenancePopover";

interface NoteFieldProps {
  fieldKey: string;
  label: string;
  field: NoteFieldModel;
  onEdit: (value: string) => void;
  onVerify: () => void;
  onLocate: (source: string) => void;
}

/**
 * One field of the structured note. Reads like a line in a chart, not a boxed
 * form input. Carries its confidence and its provenance inline, and edits in
 * place — never in a modal (DESIGN.md, principle 4).
 */
export default function NoteField({
  fieldKey,
  label,
  field,
  onEdit,
  onVerify,
  onLocate,
}: NoteFieldProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(field.value);
  const areaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editing && areaRef.current) {
      const el = areaRef.current;
      el.focus();
      el.setSelectionRange(el.value.length, el.value.length);
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight}px`;
    }
  }, [editing]);

  const needsReview = !field.verified && (field.confidence === "low" || field.confidence === "medium");
  const isLow = field.confidence === "low";

  const commit = () => {
    setEditing(false);
    if (draft.trim() !== field.value.trim()) onEdit(draft.trim());
  };

  const cancel = () => {
    setDraft(field.value);
    setEditing(false);
  };

  return (
    <div
      className={`group py-3 ${isLow && !field.verified ? "border-l-2 border-caution pl-3" : ""}`}
      data-field={fieldKey}
    >
      <div className="mb-1 flex items-center gap-2">
        <span className="label">{label}</span>

        {field.verified ? (
          <span className="inline-flex items-center gap-1 rounded-sm bg-verified-surface px-1.5 py-px text-[0.625rem] font-semibold uppercase tracking-[0.06em] text-verified">
            <CheckIcon className="h-2.5 w-2.5" />
            Verified
          </span>
        ) : needsReview ? (
          <span className="rounded-sm bg-caution-surface px-1.5 py-px text-[0.625rem] font-semibold uppercase tracking-[0.06em] text-caution">
            {isLow ? "Review" : "Inferred"}
          </span>
        ) : null}

        <span className="ml-auto flex items-center gap-2">
          {field.source && (
            <ProvenancePopover source={field.source} onLocate={() => onLocate(field.source!)} />
          )}
          {!editing && needsReview && (
            <button
              type="button"
              onClick={onVerify}
              className="focus-ring rounded-sm text-[0.75rem] font-semibold text-graphite underline decoration-rule-strong underline-offset-2 hover:text-verified"
            >
              Confirm
            </button>
          )}
        </span>
      </div>

      {editing ? (
        <textarea
          ref={areaRef}
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            e.target.style.height = "auto";
            e.target.style.height = `${e.target.scrollHeight}px`;
          }}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) commit();
            if (e.key === "Escape") cancel();
          }}
          rows={1}
          className="focus-ring w-full resize-none rounded-md border-b-2 border-rule-strong bg-chart px-2 py-1.5 text-[0.9375rem] leading-relaxed text-ink"
        />
      ) : (
        <button
          type="button"
          onClick={() => {
            setDraft(field.value);
            setEditing(true);
          }}
          className="focus-ring block w-full whitespace-pre-line rounded-sm text-left text-[0.9375rem] leading-relaxed text-ink hover:bg-chart"
          title="Click to edit"
        >
          {field.value}
        </button>
      )}
    </div>
  );
}
