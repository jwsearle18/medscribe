import Patient from "../../components/patient_profile/Patient";
import Header from "../../components/global/Header"
export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex flex-col items-center flex-1 bg-slate-800 pt-20 bg-pattern">
        <Patient />
      </main>
    </div>
  );
}
