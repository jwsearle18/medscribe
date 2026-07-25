"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { XMarkIcon } from "@heroicons/react/24/solid";

interface TranscriptPanelProps {
  open: boolean;
  transcript: string;
  highlight: string | null;
  onClose: () => void;
}

const norm = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();

// Does this transcript line overlap the highlighted source span? Sources are
// quoted close to verbatim, so containment either way is a reliable match
// without depending on exact whitespace.
function lineMatches(line: string, highlight: string | null): boolean {
  if (!highlight) return false;
  const l = norm(line);
  const h = norm(highlight);
  if (!l || !h) return false;
  return h.includes(l) || l.includes(h);
}

export default function TranscriptPanel({ open, transcript, highlight, onClose }: TranscriptPanelProps) {
  const markRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open && highlight && markRef.current) {
      markRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [open, highlight]);

  const lines = transcript.split("\n").filter((l) => l.trim().length > 0);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-ink/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
          />
          <motion.aside
            className="overlay-shadow fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-rule bg-bone"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.24, ease: [0.25, 1, 0.5, 1] }}
            role="dialog"
            aria-label="Encounter transcript"
          >
            <div className="flex items-center justify-between border-b border-rule px-5 py-3.5">
              <div>
                <span className="label block">Encounter transcript</span>
                <span className="mt-0.5 block text-[0.8125rem] text-mute">
                  The evidence behind the note
                </span>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close transcript"
                className="focus-ring rounded-md p-1 text-graphite hover:bg-chart hover:text-ink"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {lines.map((line, i) => {
                const match = line.match(/^(Speaker\s+\d+):\s*(.*)$/i);
                const speaker = match ? match[1] : null;
                const text = match ? match[2] : line;
                const active = lineMatches(line, highlight);
                return (
                  <p
                    key={i}
                    ref={active ? markRef : undefined}
                    className={`mb-3 rounded-md px-2 py-1.5 text-[0.875rem] leading-relaxed transition-colors ${
                      active ? "bg-caution-surface text-ink" : "text-graphite"
                    }`}
                  >
                    {speaker && (
                      <span className="mr-2 font-mono text-[0.6875rem] uppercase tracking-wide text-mute">
                        {speaker}
                      </span>
                    )}
                    <span className={active ? "text-ink" : "text-ink/85"}>{text}</span>
                  </p>
                );
              })}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
