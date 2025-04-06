"use client";

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ViewNoteModalProps {
  patientId: string;
  visitId: string;
  onClose: () => void;
}

const ViewNoteModal = ({ patientId, visitId, onClose }: ViewNoteModalProps) => {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFormData = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/get-form-data?patient_id=${patientId}&visit_id=${visitId}`
        );
        if (!res.ok) throw new Error('Failed to fetch form data');
        const data = await res.json();
        setFormData(data);
      } catch (err) {
        setError((err as Error).message);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFormData();
  }, [patientId, visitId]);

  return (
    <AnimatePresence>
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
          <h3 className="text-lg font-bold mb-4">New Patient Progress Note</h3>
          {loading ? (
            <p>Loading note...</p>
          ) : error ? (
            <div>
              <p className="text-red-500 mb-4">Error: {error}</p>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          ) : (
            <>
              <div className="max-h-96 overflow-y-auto mb-4">
                {Object.entries(formData).map(([field, value]) => (
                  <div key={field} className="mb-4">
                    <strong className="block text-sm font-medium mb-1 capitalize">
                      {field.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}:
                    </strong>
                    <p>{value || 'N/A'}</p>
                  </div>
                ))}
              </div>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Close
              </button>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ViewNoteModal;