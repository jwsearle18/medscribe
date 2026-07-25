"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface ProvenancePopoverProps {
  source: string;
  onLocate?: () => void;
}

/**
 * The provenance affordance: a small control that reveals the verbatim
 * transcript span a note field was drawn from. This is the interaction that
 * makes every generated claim traceable to what was actually said.
 *
 * The popover is the one kind of element allowed to cast a shadow, because it
 * is genuinely transient (see DESIGN.md, Shadow-Means-Temporary).
 */
export default function ProvenancePopover({ source, onLocate }: ProvenancePopoverProps) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  return (
    <span ref={wrapRef} className="relative inline-block align-middle">
      <button
        type="button"
        aria-label="Show transcript source for this field"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={`focus-ring inline-flex h-5 items-center gap-1 rounded-sm border px-1.5 text-[0.625rem] font-semibold uppercase tracking-[0.06em] transition-colors ${
          open
            ? "border-ink bg-ink text-bone"
            : "border-rule bg-transparent text-mute hover:border-rule-strong hover:text-graphite"
        }`}
      >
        Source
      </button>

      <AnimatePresence>
        {open && (
          <motion.span
            role="tooltip"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.16, ease: [0.25, 1, 0.5, 1] }}
            className="overlay-shadow absolute left-0 top-7 z-30 block w-80 max-w-[75vw] rounded-md border border-rule bg-bone p-3"
          >
            <span className="label block text-mute">From the transcript</span>
            <span className="mt-1.5 block font-mono text-[0.8125rem] leading-relaxed text-ink">
              {source}
            </span>
            {onLocate && (
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onLocate();
                }}
                className="focus-ring mt-2.5 rounded-sm text-[0.75rem] font-semibold text-graphite underline decoration-rule-strong underline-offset-2 hover:text-ink"
              >
                Find in transcript
              </button>
            )}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}
