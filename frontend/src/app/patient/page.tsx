import { Suspense } from 'react';

import Patient from "../../components/patient_profile/Patient";
import Header from "../../components/global/Header"
export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex flex-col items-center flex-1 bg-bone">
        <Suspense fallback={<div className="p-10 text-mute">Loading patient profile…</div>}>
          <Patient />
        </Suspense>
      </main>
    </div>
  );
}
