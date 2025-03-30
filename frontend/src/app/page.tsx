import Recording from "../components/recording/Recording";
import Header from "../components/global/Header"
export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex flex-col items-center flex-1 bg-slate-800 pt-20 bg-pattern">
        <Recording />
      </main>
    </div>
  );
}
