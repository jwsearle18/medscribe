"use client";

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FormSelection from './FormSelection';
import GeneratedFormDisplay from './GeneratedFormDisplay';

interface Visit {
  id: string;
  patient_id: string;
  transcript: string;
  title: string;
  time_completed: string;
  forms: any;
}

const PatientProfile = () => {
  const searchParams = useSearchParams();
  const patientId = searchParams.get('patient_id');

  const [visits, setVisits] = useState<Visit[]>([]);
  const [currentVisitId, setCurrentVisitId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTranscriptModal, setShowTranscriptModal] = useState(false);
  const [selectedTranscript, setSelectedTranscript] = useState<string | null>(null);

  useEffect(() => {
    if (!patientId) return;
    const fetchPatientData = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/get-patient-data?patient_id=${patientId}`
        );
        if (!res.ok) throw new Error('Failed to fetch patient data');
        const data = await res.json();
        setVisits(data);
        if (data.length > 0) setCurrentVisitId(data[0].id);
      } catch (error) {
        console.error('Fetch error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPatientData();
  }, [patientId]);

  const toggleVisit = (visitId: string) => {
    setCurrentVisitId(currentVisitId === visitId ? null : visitId);
  };

  const openTranscript = (transcript: string) => {
    setSelectedTranscript(transcript);
    setShowTranscriptModal(true);
  };

  if (loading) {
    return (
      <div className="w-full max-w-3xl mx-auto p-6">
        <p>Loading patient data...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Patient Profile</h1>
      {visits.length === 0 ? (
        <p>No visits found for patient: {patientId}</p>
      ) : (
        visits.map((visit) => (
          <div
            key={visit.id}
            className="w-full mb-4 rounded shadow overflow-hidden"
            style={{ minHeight: '4rem' }}
          >

            <div
              className="w-full p-4 bg-gray-100 flex justify-between items-center cursor-pointer text-black"
              onClick={() => toggleVisit(visit.id)}
            >
              <div className="w-full overflow-hidden">
                <h2 className="text-xl truncate">{visit.title}</h2>
                <p className="text-sm text-gray-600 break-words">
                  {new Date(visit.time_completed).toLocaleString()}
                </p>
              </div>
              <div className="ml-2 flex-shrink-0">
                <svg
                  className={`w-5 h-5 text-gray-700 transition-transform duration-300 ${
                    visit.id === currentVisitId ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {visit.id === currentVisitId && (
              <div className="w-full p-4 bg-gray-700/40">
                <div className="mb-4">
                  <button
                    className="flex items-center space-x-2 p-2 rounded shadow bg-white hover:bg-gray-200 hover:cursor-pointer"
                    onClick={() => openTranscript(visit.transcript)}
                  >
                    <svg
                      className="w-6 h-6 text-black"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6M7 8h10M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span className='text-black'>Transcript</span>
                  </button>
                </div>
                {visit.forms === null ? (
                  <div>
                    <p className="mb-2">
                      No forms filled out yet. Select one or more forms to add.
                    </p>
                    {/* Form selection interface goes here */}
                    <FormSelection onSubmit={(selectedForms) => {
                      // Here you can call your endpoint(s) for each selected form.
                      console.log("Selected forms:", selectedForms);
                    }} />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(visit.forms).map(([formType, formData]) => (
                      <GeneratedFormDisplay
                        key={formType}
                        formType={formType}
                        data={formData}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))
      )}

      {/* Transcript Modal (animated) */}
      <AnimatePresence>
        {showTranscriptModal && selectedTranscript && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className=" bg-white p-6 rounded shadow-lg max-w-md w-full text-black"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 25 }}
            >
              <h3 className="text-lg font-bold mb-4">Transcript</h3>
              <div className="max-h-96 overflow-y-auto mb-4">
                <p>{selectedTranscript}</p>
              </div>
              <button
                className="px-4 py-2 recording-btn"
                onClick={() => setShowTranscriptModal(false)}
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PatientProfile;
