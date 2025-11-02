import { SoraAgent } from "@/components/SoraAgent";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(79,70,229,0.35),_transparent_55%)]" />
      <div className="absolute inset-y-0 right-0 hidden w-[42vw] bg-[radial-gradient(circle_at_center,_rgba(6,182,212,0.18),_transparent_60%)] lg:block" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-10 px-6 py-16 sm:px-10 lg:px-14 lg:py-20">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 via-indigo-500 to-purple-500 font-semibold text-white shadow-lg shadow-indigo-500/40">
              S²
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.4em] text-indigo-300">Sora² Studio Agent</p>
              <p className="text-lg font-semibold text-white/80">Autonomous long-form video generation</p>
            </div>
          </div>
          <a
            href="https://agentic-4fe5552a.vercel.app"
            className="hidden rounded-full border border-white/10 bg-white/10 px-5 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-white transition hover:bg-white/20 lg:inline-flex"
          >
            Production Endpoint
          </a>
        </nav>
        <SoraAgent />
      </div>
    </div>
  );
}
