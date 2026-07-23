import Link from "next/link";
import Recording from "../components/recording/Recording";
import Header from "../components/global/Header"
export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex flex-col items-center flex-1 bg-slate-800 pt-20 bg-pattern">
        <Recording />
        <div className="mb-10 text-center text-sm text-gray-300">
          Reviewing a portfolio demo? Explore the seeded patient{" "}
          <Link
            href="/patient?patient_id=DEMO-1001"
            className="underline font-medium hover:text-white"
          >
            DEMO-1001
          </Link>{" "}
          — a completed note plus one you can generate live.
        </div>
      </main>
    </div>
  );
}
