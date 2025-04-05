"use client";

interface FormSelectionProps {
  onSubmit: (selectedForms: string[]) => void;
}

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