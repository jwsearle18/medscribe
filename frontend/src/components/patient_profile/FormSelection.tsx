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
  const [selectedForms, setSelectedForms] = useState<string[]>([]);

  const toggleForm = (formId: string) => {
    setSelectedForms((prev) =>
      prev.includes(formId)
        ? prev.filter((id) => id !== formId)
        : [...prev, formId]
    );
  };

  const handleSubmit = () => {
    onSubmit(selectedForms);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Select Forms to Generate</h2>
      <div className="grid grid-cols-2 gap-4">
        {availableForms.map((form) => (
          <button
            key={form.id}
            onClick={() => toggleForm(form.id)}
            className={`flex flex-col items-center justify-center p-4 border rounded-lg transition-all duration-300 
              ${selectedForms.includes(form.id)
                ? ' text-white forms-btn-pressed hover:cursor-pointer'
                : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-200 hover:cursor-pointer'
              }`}
          >
            {form.icon}
            <span className="mt-2 text-sm">{form.label}</span>
          </button>
        ))}
      </div>
      <button
        onClick={handleSubmit}
        className="mt-4 px-4 py-2 text-white green-btn"
      >
        Submit Forms
      </button>
    </div>
  );
};

export default FormSelection;