"use client";

import { useState } from 'react';
import Image from 'next/image';

export interface FormOption {
  id: string;
  label: string;
  icon: React.JSX.Element;
}

interface FormSelectionProps {
  onSubmit: (selectedForms: string[]) => void;
}

const availableForms: FormOption[] = [
  {
    id: 'progress_note',
    label: 'Progress Note',
    icon: (
      <Image
        src="/images/progress_note.svg"
        alt="Progress Note Icon"
        width={24}
        height={24}
      />
    ),
  },
  // {
  //   id: 'xray_request',
  //   label: 'X-Ray',
  //   icon: (
  //     <Image
  //       src="/images/x-ray.svg"
  //       alt="X-ray Icon"
  //       width={24}
  //       height={24}
  //     />
  //   ),
  // },
  // {
  //   id: 'medications',
  //   label: 'Medications',
  //   icon: (
  //     <Image
  //       src="/images/medications.svg"
  //       alt="Medications Icon"
  //       width={24}
  //       height={24}
  //     />
  //   ),
  // },
  // {
  //   id: 'referral',
  //   label: 'Referral',
  //   icon: (
  //     <Image
  //       src="/images/referral.svg"
  //       alt="Referrals Icon"
  //       width={24}
  //       height={24}
  //     />
  //   ),
  // },
  // {
  //   id: 'after_visit_summary',
  //   label: 'After Visit Summary',
  //   icon: (
  //     <Image
  //       src="/images/summary.svg"
  //       alt="After Visit Summary Icon"
  //       width={24}
  //       height={24}
  //     />
  //   ),
  // },
];

const FormSelection: React.FC<FormSelectionProps> = ({ onSubmit }) => {
  const handleSubmit = () => {
    // Pass all fields for the "New Patient Progress Note"
    const progressNoteFields = [
      'reason_for_visit',
      'history_of_present_illness',
      'current_medications',
      'past_medical_history',
      'surgical_history',
      'family_history',
      'allergies',
      'hospitalizations_major_diagnostics',
      'review_of_systems',
      'vital_signs',
      'examination',
      'assessments',
      'procedures',
      'treatment_plan',
      'follow_up_detailed',
      'preventive_medicine',
      'visit_codes',
      'procedure_codes',
      'follow_up_short',
      'other_notes',
    ];
    onSubmit(progressNoteFields);
  };

  return (
    <div className="space-y-4">
      <button
        onClick={handleSubmit}
        className="px-4 py-2 text-white green-btn"
      >
        Generate New Patient Progress Note
      </button>
    </div>
  );
};

export default FormSelection;