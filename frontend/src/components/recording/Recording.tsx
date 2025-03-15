"use client"
import React, { useState, useRef, useEffect } from 'react';

const Recorder: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = []; // Clear previous data

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // All data should now be available
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        audioChunksRef.current = [];

        // Prepare and send the FormData to the transcription endpoint
        const formData = new FormData();
        formData.append('file', audioBlob, 'recording.webm');

        try {
          const transcribeResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/transcribe`, {
            method: 'POST',
            body: formData,
          });
          if (!transcribeResponse.ok) {
            throw new Error('Failed to transcribe audio');
          }
          const data = await transcribeResponse.json();
          setTranscript(data.transcript);
        } catch (error) {
          console.error('Error processing audio:', error);
        }

        // Cleanup the stream: stop all tracks to release the microphone
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const handleStopRecording = async () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  // Cleanup if component unmounts during recording
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleButtonClick = () => {
    if (isRecording) {
      handleStopRecording();
    } else {
      handleStartRecording();
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Medical Scribe Recorder</h1>
      <button onClick={handleButtonClick}>
        {isRecording ? 'Stop Recording' : 'Start Recording'}
      </button>
      {transcript && (
        <div style={{ marginTop: '20px' }}>
          <h2>Transcription</h2>
          <p>{transcript}</p>
        </div>
      )}
    </div>
  );
};

export default Recorder;
