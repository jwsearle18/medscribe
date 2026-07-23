"use client";
import React, { useState, useRef, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

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

const Recorder: React.FC = () => {
  const router = useRouter();
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [patientId, setPatientId] = useState('');
  const [title, setTitle] = useState('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  // Start recording
  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      // Once recording stops, send the audio for transcription
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        audioChunksRef.current = [];
        const formData = new FormData();
        formData.append('file', audioBlob, 'recording.webm');

        try {
          const transcribeResponse = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/transcribe`,
            {
              method: 'POST',
              body: formData,
            }
          );
          if (!transcribeResponse.ok) {
            throw new Error('Failed to transcribe audio');
          }
          const data = await transcribeResponse.json();
          setTranscript(data.transcript);
          console.log("Transcription stored with ID:", data.id);
        } catch (error) {
          console.error('Error processing audio:', error);
        }

        // Cleanup: stop all tracks (mic access)
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setIsPaused(false);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  // Pause or resume recording
  const handlePauseResume = () => {
    if (!mediaRecorderRef.current) return;
    if (!isPaused) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
    } else {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
    }
  };

  // Stop recording
  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    setIsPaused(false);
  };

  // Cleanup on unmount (if user leaves mid-recording)
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Handle save form submission
  const handleSaveSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/save-transcription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId,
          transcript,
          title
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to save transcription');
      }
      const data = await response.json();
      console.log('Transcription saved:', data);
      // Close modal and clear form fields
      router.push(`/patient?patient_id=${encodeURIComponent(patientId)}`);
      setPatientId('');
      setTitle('');
    } catch (error) {
      console.error('Error saving transcription:', error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto text-center p-10">
      <h1 className="text-2xl font-bold mb-2">Record a conversation</h1>
      <p className="text-gray-600 mb-6">
        Tap the microphone icon to start recording. Tap again to pause, or tap the stop button to finish.
      </p>

      <div className="flex justify-center space-x-4 mb-6">
        <button
          className="px-4 py-2 recording-btn text-white rounded"
          onClick={handleStartRecording}
          disabled={isRecording}
        >
          Start
        </button>
        <button
          className="px-4 py-2 recording-btn text-white rounded"
          onClick={handlePauseResume}
          disabled={!isRecording}
        >
          {isPaused ? 'Resume' : 'Pause'}
        </button>
        <button
          className="px-4 py-2 recording-btn text-white rounded"
          onClick={handleStopRecording}
          disabled={!isRecording && !isPaused}
        >
          Stop
        </button>
      </div>

      <div className="mb-6">
        <button
          className="text-sm text-gray-500 underline hover:text-gray-300"
          onClick={() => setTranscript(SAMPLE_TRANSCRIPT)}
        >
          No microphone? Load a sample conversation
        </button>
      </div>

      {transcript && (
        <div className="glass-card p-4 rounded">
          <h2 className="text-xl font-semibold mb-2">Transcription</h2>
          <p className="whitespace-pre-line text-left">{transcript}</p>
          <button
            className="mt-4 px-4 py-2 green-btn"
            onClick={() => setShowSaveModal(true)}
          >
            Save Transcription
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
            transition={{ duration: 0.25 }}
            className="fixed inset-0 flex items-center justify-center bg-black/70"
          >
            <motion.div
              key="modalContent"
              initial={{ y: 50 }}
              animate={{ y: 0 }}
              exit={{ y: 50 }}
              transition={{
                type: 'spring',
                stiffness: 200,
                damping: 25,
                duration: 0.75
              }}
              className="bg-white p-6 rounded shadow-lg max-w-md w-full text-black"
            >
              <h3 className="text-lg font-bold mb-4">Save Transcription</h3>
              <form onSubmit={handleSaveSubmit} className="space-y-4">
                <div>
                  <label htmlFor="patientId" className="block text-left mb-1">
                    Patient ID
                  </label>
                  <input
                    id="patientId"
                    type="text"
                    className="w-full border px-3 py-2 rounded"
                    value={patientId}
                    onChange={(e) => setPatientId(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="title" className="block text-left mb-1">
                    Title
                  </label>
                  <input
                    id="title"
                    type="text"
                    className="w-full border px-3 py-2 rounded"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    className="px-4 py-2 gray-btn"
                    onClick={() => setShowSaveModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-2 recording-btn">
                    Save
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