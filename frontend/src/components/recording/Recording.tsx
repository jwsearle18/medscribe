"use client";
import React, { useState, useRef, useEffect, FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { MicrophoneIcon, PauseIcon, PlayIcon, StopIcon } from "@heroicons/react/24/solid";
import Waveform from "./Waveform";

// A canned encounter so reviewers can run the full pipeline
// (save → generate note → view → PDF) without a microphone or API keys.
// Mirrors a real diarized Deepgram transcript: speaker-labeled turns.
const SAMPLE_TRANSCRIPT = [
  "Speaker 0: Hi, what can I help you with today?",
  "Speaker 1: I rolled my right ankle playing basketball yesterday. It's swollen and it hurts to put weight on it.",
  "Speaker 0: Did you hear a pop, and were you able to keep playing?",
  "Speaker 1: No pop, but I had to stop right away.",
  "Speaker 0: Any numbness or tingling in the foot?",
  "Speaker 1: No, just the pain and swelling on the outside of the ankle.",
  "Speaker 0: Any medications or allergies I should know about?",
  "Speaker 1: No medications, no allergies.",
  "Speaker 0: Let me examine it. There's swelling and tenderness over the lateral malleolus, but you can bear a little weight and there's no bony tenderness at the back of the ankle, so an X-ray isn't needed by the Ottawa rules. This is a grade one lateral ankle sprain. I want you to follow RICE, rest, ice twenty minutes at a time, compression wrap, and elevation. Take ibuprofen 400 milligrams every six hours as needed. Start gentle range-of-motion exercises in a couple of days. If you still can't bear weight in a week, come back and we'll image it.",
  "Speaker 1: Got it, thanks.",
].join("\n");

type Status = "idle" | "recording" | "paused" | "transcribing";

const formatElapsed = (s: number) =>
  `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

const Recorder: React.FC = () => {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [patientId, setPatientId] = useState("");
  const [title, setTitle] = useState("");
  const [micError, setMicError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isLive = status === "recording" || status === "paused";

  // Elapsed timer runs only while actively recording (pauses when paused).
  useEffect(() => {
    if (status === "recording") {
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status]);

  const teardownAudio = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    setAnalyser(null);
  };

  const handleStart = async () => {
    setMicError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Live amplitude for the waveform. Source is not connected to the
      // destination, so nothing is played back (no echo).
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const node = ctx.createAnalyser();
      node.fftSize = 128;
      node.smoothingTimeConstant = 0.8;
      source.connect(node);
      setAnalyser(node);

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        audioChunksRef.current = [];
        const formData = new FormData();
        formData.append("file", audioBlob, "recording.webm");
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/transcribe`, {
            method: "POST",
            body: formData,
          });
          if (!res.ok) throw new Error("Failed to transcribe audio");
          const data = await res.json();
          setTranscript(data.transcript);
        } catch (error) {
          console.error("Error processing audio:", error);
          setMicError("The recording could not be transcribed. Please try again.");
        } finally {
          setStatus("idle");
        }
        teardownAudio();
      };

      mediaRecorder.start();
      setElapsed(0);
      setStatus("recording");
    } catch (error) {
      console.error("Error accessing microphone:", error);
      setMicError("Microphone access was blocked. Check your browser permissions, or load a sample below.");
      teardownAudio();
    }
  };

  const handlePauseResume = () => {
    const mr = mediaRecorderRef.current;
    if (!mr) return;
    if (status === "recording") {
      mr.pause();
      setStatus("paused");
    } else if (status === "paused") {
      mr.resume();
      setStatus("recording");
    }
  };

  const handleStop = () => {
    const mr = mediaRecorderRef.current;
    if (mr && mr.state !== "inactive") {
      setStatus("transcribing");
      mr.stop();
    } else {
      setStatus("idle");
      teardownAudio();
    }
  };

  useEffect(() => {
    return () => {
      teardownAudio();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleSaveSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/save-transcription`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId, transcript, title }),
      });
      if (!response.ok) throw new Error("Failed to save transcription");
      await response.json();
      router.push(`/patient?patient_id=${encodeURIComponent(patientId)}`);
      setPatientId("");
      setTitle("");
    } catch (error) {
      console.error("Error saving transcription:", error);
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-8 text-center">
      <h1 className="font-serif text-[1.75rem] leading-tight tracking-[-0.01em] text-ink">
        Record a conversation
      </h1>
      <p className="mx-auto mt-1.5 max-w-md text-[0.9375rem] text-graphite">
        Start recording to capture the encounter. MedScribe transcribes it with speaker separation,
        then drafts a structured note.
      </p>

      {/* Recorder surface */}
      <div className="mt-7 rounded-lg border border-rule bg-chart px-6 py-7">
        {status === "idle" && (
          <div className="flex flex-col items-center">
            <button
              type="button"
              onClick={handleStart}
              aria-label="Start recording"
              className="focus-ring group flex h-20 w-20 items-center justify-center rounded-full bg-ink text-bone transition-colors hover:bg-graphite"
            >
              <MicrophoneIcon className="h-8 w-8" />
            </button>
            <span className="mt-3 text-[0.875rem] font-medium text-ink">Start recording</span>
          </div>
        )}

        {isLive && (
          <div className="flex flex-col items-center">
            {/* State line: pulsing dot when live, static when paused, + timer */}
            <div className="mb-4 flex items-center gap-2.5">
              <span className="relative flex h-2.5 w-2.5">
                {status === "recording" && (
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ink opacity-60" />
                )}
                <span
                  className={`relative inline-flex h-2.5 w-2.5 rounded-full ${
                    status === "recording" ? "bg-ink" : "bg-mute"
                  }`}
                />
              </span>
              <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.09em] text-graphite">
                {status === "recording" ? "Recording" : "Paused"}
              </span>
              <span className="font-mono text-[0.9375rem] tabular-nums text-ink">
                {formatElapsed(elapsed)}
              </span>
            </div>

            <div className="w-full max-w-md">
              <Waveform analyser={analyser} paused={status === "paused"} />
            </div>

            {/* Controls: Pause/Resume (secondary) + Stop (primary) */}
            <div className="mt-5 flex items-center gap-3">
              <button
                type="button"
                onClick={handlePauseResume}
                aria-label={status === "paused" ? "Resume recording" : "Pause recording"}
                className="focus-ring flex h-12 w-12 items-center justify-center rounded-full border border-rule-strong bg-bone text-ink transition-colors hover:bg-chart"
              >
                {status === "paused" ? (
                  <PlayIcon className="h-5 w-5" />
                ) : (
                  <PauseIcon className="h-5 w-5" />
                )}
              </button>
              <button
                type="button"
                onClick={handleStop}
                aria-label="Stop and transcribe"
                className="focus-ring flex h-14 items-center gap-2 rounded-full bg-ink px-6 text-bone transition-colors hover:bg-graphite"
              >
                <StopIcon className="h-5 w-5" />
                <span className="text-[0.9375rem] font-semibold">Stop</span>
              </button>
            </div>
          </div>
        )}

        {status === "transcribing" && (
          <div className="flex flex-col items-center py-2">
            <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-rule border-t-ink" />
            <span className="mt-3 text-[0.875rem] text-graphite">
              Transcribing the conversation…
            </span>
          </div>
        )}
      </div>

      {micError && <p className="mt-3 text-[0.8125rem] text-alert">{micError}</p>}

      {status === "idle" && !transcript && (
        <div className="mt-4">
          <button
            type="button"
            className="focus-ring rounded-sm text-[0.8125rem] text-graphite underline decoration-rule-strong underline-offset-2 hover:text-ink"
            onClick={() => setTranscript(SAMPLE_TRANSCRIPT)}
          >
            No microphone? Load a sample conversation
          </button>
        </div>
      )}

      {transcript && (
        <div className="mt-6 rounded-lg border border-rule bg-chart p-5 text-left">
          <div className="mb-2 flex items-center justify-between">
            <span className="label">Transcript</span>
            <button
              type="button"
              className="focus-ring rounded-sm text-[0.8125rem] text-mute underline decoration-rule-strong underline-offset-2 hover:text-ink"
              onClick={() => setTranscript("")}
            >
              Clear
            </button>
          </div>
          <p className="whitespace-pre-line text-[0.875rem] leading-relaxed text-ink">{transcript}</p>
          <button
            type="button"
            className="focus-ring mt-4 inline-flex items-center rounded-md bg-ink px-4 py-2 text-[0.875rem] font-semibold text-bone hover:bg-graphite"
            onClick={() => setShowSaveModal(true)}
          >
            Save to a patient record
          </button>
        </div>
      )}

      <AnimatePresence>
        {showSaveModal && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-ink/25 p-4"
            onClick={() => setShowSaveModal(false)}
          >
            <motion.div
              key="modalContent"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.2, ease: [0.25, 1, 0.5, 1] }}
              className="overlay-shadow w-full max-w-md rounded-lg border border-rule bg-bone p-6 text-left"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-serif text-[1.25rem] text-ink">Save to a patient record</h3>
              <p className="mt-1 text-[0.8125rem] text-mute">
                File this transcript under a patient so a note can be generated.
              </p>
              <form onSubmit={handleSaveSubmit} className="mt-4 space-y-4">
                <div>
                  <label htmlFor="patientId" className="label mb-1 block">
                    Patient ID
                  </label>
                  <input
                    id="patientId"
                    type="text"
                    className="focus-ring w-full rounded-md border border-rule bg-bone px-3 py-2 text-[0.9375rem] text-ink placeholder-mute focus:border-ink"
                    placeholder="e.g. DEMO-1002"
                    value={patientId}
                    onChange={(e) => setPatientId(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="title" className="label mb-1 block">
                    Visit title
                  </label>
                  <input
                    id="title"
                    type="text"
                    className="focus-ring w-full rounded-md border border-rule bg-bone px-3 py-2 text-[0.9375rem] text-ink placeholder-mute focus:border-ink"
                    placeholder="e.g. Ankle injury — initial visit"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    className="focus-ring rounded-md border border-rule bg-transparent px-4 py-2 text-[0.875rem] font-medium text-ink hover:bg-chart"
                    onClick={() => setShowSaveModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="focus-ring rounded-md bg-ink px-4 py-2 text-[0.875rem] font-semibold text-bone hover:bg-graphite"
                  >
                    Save record
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Recorder;
