"use client";

import React from 'react';

interface GeneratedFormProps {
  formType: string;
  data: any;
}

const GeneratedFormDisplay: React.FC<GeneratedFormProps> = ({ formType, data }) => {
  switch (formType) {
    case 'progress_note':
      return (
        <div className="p-4 border rounded shadow glass-card">
          <h3 className="text-xl font-semibold mb-2">Progress Note</h3>
          <p><strong>Chief Complaint:</strong> {data.chief_complaint}</p>
          <div>
            <strong>History of Present Illness:</strong>
            <ul className="list-disc pl-5">
              {data.hpi.map((line: string, index: number) => (
                <li key={index}>{line}</li>
              ))}
            </ul>
          </div>
          <p><strong>Past Medical History:</strong> {data.past_medical_history}</p>
          {data.past_surgical_history && (
            <p><strong>Past Surgical History:</strong> {data.past_surgical_history}</p>
          )}
          {data.medications && <p><strong>Medications:</strong> {data.medications}</p>}
          {data.allergies && <p><strong>Allergies:</strong> {data.allergies}</p>}
          {data.social_history && (
            <div>
              <strong>Social History:</strong>
              <ul className="list-disc pl-5">
                <li>Tobacco: {data.social_history.tobacco_use}</li>
                <li>Alcohol: {data.social_history.alcohol_use}</li>
                <li>Recreational Drugs: {data.social_history.recreational_drugs}</li>
              </ul>
            </div>
          )}
          {data.review_of_systems && (
            <div>
              <strong>Review of Systems:</strong>
              <ul className="list-disc pl-5">
                {data.review_of_systems.map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          )}
          {data.physical_exam_focused && (
            <div>
              <strong>Physical Exam:</strong>
              <ul className="list-disc pl-5">
                {data.physical_exam_focused.map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          )}
          <p><strong>Assessment:</strong> {data.assessment}</p>
          <div>
            <strong>Plan:</strong>
            <ul className="list-disc pl-5">
              {data.plan.map((item: string, index: number) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      );
    case 'imaging_order':
      return (
        <div className="p-4 border rounded shadow bg-white">
          <h3 className="text-xl font-semibold mb-2">Imaging Order</h3>
          <p><strong>Patient ID:</strong> {data.patient_id}</p>
          <p><strong>Patient Name:</strong> {data.patient_name}</p>
          <p><strong>Date of Birth:</strong> {data.date_of_birth}</p>
          <p><strong>Date of Order:</strong> {data.date_of_order}</p>
          <p><strong>Type of Imaging:</strong> {data.type_of_imaging}</p>
          <p><strong>Reason:</strong> {data.reason_for_imaging}</p>
          <p><strong>Instructions:</strong> {data.special_instructions}</p>
        </div>
      );
    case 'referral_consultation':
      return (
        <div className="p-4 border rounded shadow bg-white">
          <h3 className="text-xl font-semibold mb-2">Referral / Consultation</h3>
          <p><strong>Patient ID:</strong> {data.patient_id}</p>
          <p><strong>Patient Name:</strong> {data.patient_name}</p>
          <p><strong>Date of Birth:</strong> {data.date_of_birth}</p>
          <p><strong>Date of Referral:</strong> {data.date_of_referral}</p>
          <p><strong>Referral To:</strong> {data.referral_to}</p>
          <p><strong>Reason:</strong> {data.reason_for_referral}</p>
          <p><strong>Services Requested:</strong> {data.services_requested}</p>
          <p><strong>Instructions:</strong> {data.special_instructions}</p>
        </div>
      );
    case 'after_visit_summary':
      return (
        <div className="p-4 border rounded shadow bg-white">
          <h3 className="text-xl font-semibold mb-2">After Visit Summary</h3>
          <p><strong>Patient ID:</strong> {data.patient_id}</p>
          <p><strong>Patient Name:</strong> {data.patient_name}</p>
          <p><strong>Date of Visit:</strong> {data.date_of_visit}</p>
          <p><strong>Diagnosis:</strong> {data.diagnosis}</p>
          <div>
            <strong>Instructions:</strong>
            <ul className="list-disc pl-5">
              {data.instructions.map((item: string, index: number) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
          <p><strong>Medications:</strong> {data.medications_prescribed}</p>
          <p><strong>Follow Up:</strong> {data.follow_up}</p>
          <div>
            <strong>Red Flag Symptoms:</strong>
            <ul className="list-disc pl-5">
              {data.red_flag_symptoms.map((item: string, index: number) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      );
    default:
      return <div>Unknown form type: {formType}</div>;
  }
};

export default GeneratedFormDisplay;
