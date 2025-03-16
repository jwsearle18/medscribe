"use client";

import { div } from 'framer-motion/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Visit {
  id: string;
  patient_id: string;
  transcript: string;
  title: string;
  time_completed: string; // ISO timestamp
  forms: any; // JSON object or null
}

const PatientProfile = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const patientId = searchParams.get('patient_id');
  
  const [visits, setVisits] = useState<Visit[]>([]);
  const [currentVisitId, setCurrentVisitId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPatientData = async (id: string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/get-patient-data?patient_id=${id}`
      );
      if (!res.ok) {
        throw new Error('Failed to fetch patient data');
      }
      const data = await res.json();
      setVisits(data);
      if (data.length > 0) {
        setCurrentVisitId(data[0].id);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (patientId) {
      fetchPatientData(patientId);
    }
  }, [patientId]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <p>Loading patient data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Patient Profile</h1>
      {visits.length === 0 ? (
          <p>No visits found for patient: {patientId}</p>
      ) : (
          visits.map((visit) => (
          <div key={visit.id} className="mb-4 border rounded shadow">
              <div
              className="p-4 bg-gray-100 flex justify-between items-center cursor-pointer text-black"
              onClick={() =>
                  setCurrentVisitId(visit.id === currentVisitId ? null : visit.id)
              }
              >
              <div>
                  <h2 className="text-xl">{visit.title}</h2>
                  <p className="text-sm text-gray-600">
                  {new Date(visit.time_completed).toLocaleString()}
                  </p>
              </div>
              <button className="text-blue-600 underline">
                  {visit.id === currentVisitId ? 'Hide Details' : 'Show Details'}
              </button>
              </div>
              {visit.id === currentVisitId && (
              <div className="p-4">
                  <div className="mb-4">
                  <p className="font-semibold">Transcript:</p>
                  <p>{visit.transcript}</p>
                  </div>
                  {visit.forms === null ? (
                  <div>
                      <p className="mb-2">
                      No forms filled out yet. Select one or more forms to add.
                      </p>
                      {/* Form selection interface goes here */}
                  </div>
                  ) : (
                  <div>
                      <p className="font-semibold mb-2">Generated Forms:</p>
                      <pre className="text-sm whitespace-pre-wrap bg-gray-50 p-2 rounded">
                      {JSON.stringify(visit.forms, null, 2)}
                      </pre>
                  </div>
                  )}
              </div>
              )}
          </div>
          ))
      )}
    </div>
  );
};

export default PatientProfile;
