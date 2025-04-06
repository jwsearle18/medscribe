"use client";

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FormSelection from './FormSelection';
import EditFormsModal from './EditFormsModal';
import ViewNoteModal from './ViewNoteModal';

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
  const [showEditFormsModal, setShowEditFormsModal] = useState(false);
  const [editFormsData, setEditFormsData] = useState<{ visitId: string; selectedForms: string[] } | null>(null);
  const [showViewNoteModal, setShowViewNoteModal] = useState(false);
  const [selectedVisitId, setSelectedVisitId] = useState<string | null>(null);

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

  const handleFormSelectionSubmit = (visitId: string, selectedForms: string[]) => {
    setEditFormsData({ visitId, selectedForms });
    setShowEditFormsModal(true);
  };

  const handleSaveForms = (forms: any) => {
    setVisits((prevVisits) =>
      prevVisits.map((visit) =>
        visit.id === editFormsData?.visitId ? { ...visit, forms } : visit
      )
    );
  };

  const openViewNote = (visitId: string) => {
    setSelectedVisitId(visitId);
    setShowViewNoteModal(true);
  };



  const generatePDF = async (visitId: string) => {
    try {
      if (!patientId) throw new Error("Patient ID is missing");

      // 1. Fetch the form data using your GET endpoint
      const formDataRes = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/get-form-data?patient_id=${patientId}&visit_id=${visitId}`
      );
      if (!formDataRes.ok) throw new Error("Failed to fetch form data");
      const formData = await formDataRes.json();

      // 2. Call the PDF generation endpoint with the JSON data
      const pdfRes = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/pdf/generate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );
      if (!pdfRes.ok) throw new Error("Failed to generate PDF");

      // 3. Process the PDF response and trigger a download
      const blob = await pdfRes.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "generated_medical_form.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log("PDF generated and download initiated.");
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
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
                <div className="mb-4 flex space-x-4">
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
                    <span className="text-black">Transcript</span>
                  </button>
                  {visit.forms !== null && (
                    <button
                      className="flex items-center space-x-2 p-2 rounded shadow bg-white hover:bg-gray-200 hover:cursor-pointer"
                      onClick={() => openViewNote(visit.id)}
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
                          d="M15 12h.01M12 15h.01M9 12h.01M12 9h.01M4 12a8 8 0 0116 0 8 8 0 01-16 0z"
                        />
                      </svg>
                      <span className="text-black">View Note</span>
                    </button>
                  )}

                  {/* New button to call your PDF generation endpoint */}
                  <button
                    className="flex items-center space-x-2 p-2 rounded shadow bg-white hover:bg-gray-200 hover:cursor-pointer"
                    onClick={() => generatePDF(visit.id)}
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
                        d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3"
                      />
                    </svg>
                    <span className="text-black">Download</span>
                  </button>
                  
                </div>
                {visit.forms === null && (
                  <div>
                    <p className="mb-2">
                      No progress note filled out yet. Generate one below.
                    </p>
                    <FormSelection
                      onSubmit={(selectedForms) => handleFormSelectionSubmit(visit.id, selectedForms)}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        ))
      )}

      {/* Transcript Modal */}
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
              className="bg-white p-6 rounded shadow-lg max-w-md w-full text-black"
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
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                onClick={() => setShowTranscriptModal(false)}
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Forms Modal */}
      <AnimatePresence>
        {showEditFormsModal && editFormsData && patientId && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <EditFormsModal
              patientId={patientId}
              visitId={editFormsData.visitId}
              selectedForms={editFormsData.selectedForms}
              onClose={() => setShowEditFormsModal(false)}
              onSave={handleSaveForms}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Note Modal */}
      <AnimatePresence>
        {showViewNoteModal && selectedVisitId && patientId && (
          <ViewNoteModal
            patientId={patientId}
            visitId={selectedVisitId}
            onClose={() => setShowViewNoteModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default PatientProfile;