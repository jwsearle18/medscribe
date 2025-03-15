"use client";
import React, { useState, useRef, useEffect } from 'react';

const Recorder: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [transcript, setTranscript] = useState('');
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
        } catch (error) {
          console.error('Error processing audio:', error);
        }

        // Cleanup: stop all tracks (mic access)
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }
      };

      // Start recording
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
      // Pause the recording
      mediaRecorderRef.current.pause();
      setIsPaused(true);
    } else {
      // Resume the recording
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

      {transcript && (
        <div className="glass-card">
          <h2 className="text-xl font-semibold mb-2">Transcription</h2>
          <p>{transcript}</p>
        </div>
      )}
    </div>
  );
};

export default Recorder;
