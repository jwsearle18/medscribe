"use client";

import { useEffect, useState } from 'react';

interface EditFormsModalProps {
  patientId: string;
  visitId: string;
  selectedForms: string[];
  onClose: () => void;
  onSave: (forms: Record<string, string>) => void;
}

const EditFormsModal = ({ patientId, visitId, onClose, onSave }: EditFormsModalProps) => {
  const [formData, setFormData] = useState<Record<string, string>>({}); // Explicitly type as string values
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!patientId || !visitId) return;

    const fetchFormData = async () => {
      try {
        setLoading(true);
        const patientDataRes = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/get-patient-data?patient_id=${patientId}`
        );
        const patientData = await patientDataRes.json();
        const visit = patientData.find((v: { id: string; }) => v.id === visitId);
        if (!visit) throw new Error('Visit not found');

        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/ai/extract_form_data`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transcription: visit.transcript }),
        });
        if (!res.ok) throw new Error('Failed to fetch form data');
        const data = await res.json();
        setFormData(data); // data should be Record<string, string | null>, but we’ll normalize below
      } catch (err) {
        setError((err as Error).message); // Cast err to Error
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFormData();
  }, [patientId, visitId]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/save-form-data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patient_id: patientId, visit_id: visitId, forms: formData }),
      });
      if (!res.ok) throw new Error('Failed to save form data');
      onSave(formData);
      onClose();
    } catch (err) {
      setError((err as Error).message); // Cast err to Error
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70">
      <div className="bg-white p-6 rounded shadow-lg max-w-md w-full text-black">
        <h3 className="text-lg font-bold mb-4">New Patient Progress Note</h3>
        {loading ? (
          <p>Loading form data...</p>
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
                  <label className="block text-sm font-medium mb-1 capitalize">
                    {field.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                  </label>
                  <textarea
                    value={value || ''} // Safe with string typing
                    onChange={(e) => handleChange(field, e.target.value)}
                    className="w-full p-2 border rounded text-black"
                    rows={4}
                    disabled={saving}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EditFormsModal;