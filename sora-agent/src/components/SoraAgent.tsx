"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import {
  buildScenesFromScript,
  generateAssetBriefs,
  generateTimelineFromScenes,
} from "@/lib/pipeline";
import type { AssetBrief, SceneBeat, TimelineShot } from "@/lib/types";

type GenerationPhase = "idle" | "planning" | "rendering" | "completed" | "error";

interface AgentResponse {
  requestId: string;
  jobId?: string;
  previewUrl?: string;
  scenes: SceneBeat[];
  assets: AssetBrief[];
  timeline: TimelineShot[];
  message: string;
  mock: boolean;
}

const phaseCopy: Record<GenerationPhase, string> = {
  idle: "Drop your script and Sora² will take it from here.",
  planning: "Breaking the script into cinematic beats…",
  rendering: "Sending storyboard to Sora² render core…",
  completed: "Rendering complete! Preview the generated video below.",
  error: "Something went wrong — adjust the script and try again.",
};

const sectionDelay = 0.08;

export function SoraAgent() {
  const [script, setScript] = useState("");
  const [tone, setTone] = useState("Inspirational documentary");
  const [duration, setDuration] = useState("3-5 minutes");
  const [ratio, setRatio] = useState("16:9");
  const [voice, setVoice] = useState("Warm female narrator");
  const [phase, setPhase] = useState<GenerationPhase>("idle");
  const [scenario, setScenario] = useState<AgentResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingDetail, setLoadingDetail] = useState<string | null>(null);

  const isActionDisabled = !script.trim() || phase === "planning" || phase === "rendering";

  const localPlan = useMemo(() => {
    if (!script.trim()) return null;

    const scenes = buildScenesFromScript(script, tone);
    const assets = generateAssetBriefs(scenes, voice);
    const timeline = generateTimelineFromScenes(scenes, duration);

    return {
      scenes,
      assets,
      timeline,
    };
  }, [script, tone, voice, duration]);

  const handleGenerate = async () => {
    setPhase("planning");
    setError(null);
    setLoadingDetail("Analysing script and extracting cinematic beats…");

    try {
      const response = await fetch("/api/sora", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          script,
          tone,
          duration,
          ratio,
          voice,
        }),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Failed to reach Sora² pipeline.");
      }

      const payload = (await response.json()) as AgentResponse;

      setScenario(payload);
      setPhase("completed");
      setLoadingDetail(null);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Unknown error");
      setPhase("error");
      setLoadingDetail(null);
    }
  };

  return (
    <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-8 rounded-3xl border border-zinc-100 bg-white/70 p-10 shadow-[0_45px_90px_-30px_rgba(15,23,42,0.25)] backdrop-blur-lg dark:border-zinc-800/60 dark:bg-zinc-900/80 sm:p-12">
      <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
        <div className="flex flex-col gap-8">
          <header className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 via-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30">
                <span className="text-xl font-semibold">S²</span>
              </div>
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.4em] text-indigo-500">
                  Sora² Autonomous Studio
                </p>
                <h1 className="text-3xl font-semibold tracking-tight text-slate-800 dark:text-slate-100 sm:text-4xl">
                  Script → Long-form Video Agent
                </h1>
              </div>
            </div>
            <p className="max-w-2xl text-base leading-relaxed text-slate-600 dark:text-slate-400">
              Upload your story, define the vibe, and let the Sora² orchestration agent plan each
              beat, curate supporting assets, and trigger multi-shot renders for cinematic output.
            </p>
          </header>

          <section className="rounded-2xl border border-zinc-100 bg-white/60 p-6 shadow-sm dark:border-zinc-800/60 dark:bg-zinc-900/80">
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between gap-4">
                <label htmlFor="script" className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Narrative Script
                </label>
                <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300">
                  Multi-scene support
                </span>
              </div>
              <textarea
                id="script"
                placeholder="Paste your script. Separate beats with blank lines for finer control."
                rows={10}
                value={script}
                onChange={(event) => setScript(event.target.value)}
                className="min-h-[240px] w-full resize-y rounded-2xl border border-zinc-200/70 bg-white/60 px-5 py-4 text-sm leading-relaxed text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:border-zinc-800/60 dark:bg-zinc-950/60 dark:text-slate-100 dark:focus:border-indigo-500 dark:focus:ring-indigo-600/40"
              />

              <div className="grid gap-4 md:grid-cols-2">
                <Field
                  label="Director Tone"
                  value={tone}
                  onChange={setTone}
                  options={[
                    "Inspirational documentary",
                    "Neo-noir thriller",
                    "High-energy trailer",
                    "Cinematic vlog narrative",
                    "Educational explainer",
                  ]}
                />
                <Field
                  label="Running Time"
                  value={duration}
                  onChange={setDuration}
                  options={["30-60 seconds", "90 seconds", "2-3 minutes", "3-5 minutes", "8-10 minutes"]}
                />
                <Field
                  label="Aspect Ratio"
                  value={ratio}
                  onChange={setRatio}
                  options={["16:9", "21:9", "9:16", "1:1"]}
                />
                <Field
                  label="Narration Voice"
                  value={voice}
                  onChange={setVoice}
                  options={[
                    "Warm female narrator",
                    "Calm male documentary",
                    "Energetic sports host",
                    "Dramatic cinematic",
                    "Conversational podcast duo",
                  ]}
                />
              </div>

              <button
                type="button"
                onClick={handleGenerate}
                disabled={isActionDisabled}
                className="group relative flex h-14 items-center justify-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 text-sm font-semibold uppercase tracking-widest text-white transition hover:shadow-xl hover:shadow-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="relative z-10 flex items-center gap-2">
                  {phase === "planning" || phase === "rendering" ? "Generating pipeline…" : "Send to Sora²"}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500 opacity-0 transition group-hover:opacity-100" />
              </button>

              <StatusPanel
                phase={phase}
                message={phaseCopy[phase]}
                detail={loadingDetail}
                error={error}
                scenario={scenario}
              />
            </div>
          </section>
        </div>

        <aside className="flex flex-col gap-6">
          <AgentHighlights phase={phase} />

          <AnimatePresence mode="wait">
            {scenario ? (
              <motion.div
                key={scenario.requestId}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="flex flex-col gap-6 rounded-2xl border border-zinc-100 bg-white/70 p-6 shadow-xl dark:border-zinc-800/60 dark:bg-zinc-900/80"
              >
                <Section heading="Scene Blueprint" gradient="from-indigo-500/10 via-violet-500/10 to-cyan-500/10">
                  <ol className="space-y-4">
                    {scenario.scenes.map((scene, index) => (
                      <li key={scene.id} className="rounded-xl border border-zinc-100/60 bg-white/80 p-4 dark:border-zinc-800/60 dark:bg-zinc-950/40">
                        <div className="flex items-start justify-between">
                          <span className="text-xs font-semibold uppercase tracking-widest text-indigo-500">
                            Beat {index + 1}
                          </span>
                          <span className="rounded-full bg-zinc-900/5 px-3 py-1 text-[11px] font-medium text-zinc-500 dark:bg-zinc-100/10 dark:text-zinc-300">
                            {scene.estimatedDuration}s
                          </span>
                        </div>
                        <p className="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-100">{scene.title}</p>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{scene.summary}</p>
                        <p className="mt-3 text-[12px] uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">
                          Visual Notes
                        </p>
                        <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{scene.visuals}</p>
                      </li>
                    ))}
                  </ol>
                </Section>

                <Section heading="Asset Orchestration" gradient="from-cyan-500/10 via-teal-500/10 to-sky-500/10">
                  <div className="grid gap-3">
                    {scenario.assets.map((asset) => (
                      <div
                        key={asset.id}
                        className="flex flex-col gap-2 rounded-xl border border-cyan-500/10 bg-white/80 p-4 dark:border-cyan-500/20 dark:bg-cyan-950/10"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-600 dark:text-cyan-300">
                            {asset.type}
                          </span>
                          <span className="rounded-full bg-cyan-500/10 px-2.5 py-1 text-[11px] font-semibold text-cyan-600 dark:bg-cyan-900/50 dark:text-cyan-200">
                            {asset.owner}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{asset.description}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{asset.notes}</p>
                      </div>
                    ))}
                  </div>
                </Section>

                <Section heading="Timeline Directive" gradient="from-purple-500/10 via-fuchsia-500/10 to-indigo-500/10">
                  <div className="flex flex-col gap-4">
                    {scenario.timeline.map((shot) => (
                      <div
                        key={shot.id}
                        className="rounded-xl border border-purple-500/10 bg-white/80 p-4 dark:border-purple-500/20 dark:bg-purple-950/10"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs uppercase tracking-[0.35em] text-purple-500 dark:text-purple-300">
                          <span>{shot.label}</span>
                          <span>{shot.duration}s</span>
                        </div>
                        <p className="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-100">{shot.goal}</p>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{shot.prompt}</p>
                        <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                          <Tag>Camera: {shot.camera}</Tag>
                          <Tag>Motion: {shot.motion}</Tag>
                          <Tag>Audio: {shot.audio}</Tag>
                        </div>
                      </div>
                    ))}
                  </div>
                </Section>

                {scenario.previewUrl ? (
                  <Section heading="Rendered Preview" gradient="from-emerald-500/10 via-teal-500/10 to-indigo-500/10">
                    <div className="aspect-video overflow-hidden rounded-2xl border border-emerald-500/10 bg-black shadow-inner shadow-emerald-500/10">
                      <video src={scenario.previewUrl} controls className="h-full w-full object-cover" />
                    </div>
                    <p className="text-xs text-emerald-600 dark:text-emerald-300">
                      {scenario.mock
                        ? "Preview generated locally. Provide SORA2_API_KEY to stream real renders."
                        : "Rendered by Sora² cloud pipeline."}
                    </p>
                  </Section>
                ) : null}
              </motion.div>
            ) : localPlan ? (
              <motion.div
                key="local-plan"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="flex flex-col gap-6 rounded-2xl border border-zinc-100 bg-white/70 p-6 dark:border-zinc-800/60 dark:bg-zinc-900/80"
              >
                <Section heading="Live Breakdown" gradient="from-slate-500/10 via-slate-500/5 to-slate-500/10">
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Draft plan generated locally while Sora² renders. Adjust script to fine tune beat detection.
                  </p>
                  <ul className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                    {localPlan.scenes.map((scene) => (
                      <li key={scene.id} className="rounded-lg border border-slate-200/60 bg-white/70 p-3 dark:border-slate-700/60 dark:bg-slate-900/60">
                        <div className="font-semibold text-slate-800 dark:text-slate-100">{scene.title}</div>
                        <div className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">
                          {scene.estimatedDuration}s — {scene.location}
                        </div>
                      </li>
                    ))}
                  </ul>
                </Section>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </aside>
      </div>
    </div>
  );
}

interface FieldProps {
  label: string;
  options: string[];
  value: string;
  onChange: (next: string) => void;
}

function Field({ label, options, value, onChange }: FieldProps) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 rounded-xl border border-zinc-200/70 bg-white/60 px-4 text-sm font-medium text-slate-700 transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:border-zinc-800/60 dark:bg-zinc-950/60 dark:text-slate-100 dark:focus:border-indigo-500 dark:focus:ring-indigo-600/40"
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

interface StatusPanelProps {
  phase: GenerationPhase;
  message: string;
  detail: string | null;
  error: string | null;
  scenario: AgentResponse | null;
}

function StatusPanel({ phase, message, detail, error, scenario }: StatusPanelProps) {
  return (
    <div className="space-y-3 rounded-2xl border border-zinc-200/70 bg-gradient-to-br from-white/70 via-white/40 to-white/20 p-5 text-sm text-slate-600 shadow-inner dark:border-zinc-800/60 dark:from-zinc-950/70 dark:via-zinc-950/30 dark:to-zinc-950/20 dark:text-slate-400">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400">
          Pipeline Status
        </span>
        <span
          className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] ${
            phase === "completed"
              ? "text-emerald-500"
              : phase === "error"
              ? "text-rose-500"
              : "text-indigo-500"
          }`}
        >
          <StatusDot phase={phase} />
          {phase.toUpperCase()}
        </span>
      </div>
      <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{message}</p>
      {detail ? <p className="text-xs text-indigo-500 dark:text-indigo-300">{detail}</p> : null}
      {error ? <p className="text-sm text-rose-500">{error}</p> : null}
      {scenario ? (
        <dl className="grid grid-cols-2 gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div>
            <dt className="font-semibold uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">Request</dt>
            <dd className="mt-1 font-mono text-[11px]">{scenario.requestId}</dd>
          </div>
          {scenario.jobId ? (
            <div>
              <dt className="font-semibold uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">Job</dt>
              <dd className="mt-1 font-mono text-[11px] text-emerald-600 dark:text-emerald-400">{scenario.jobId}</dd>
            </div>
          ) : null}
        </dl>
      ) : null}
    </div>
  );
}

interface StatusDotProps {
  phase: GenerationPhase;
}

function StatusDot({ phase }: StatusDotProps) {
  return (
    <span className="relative flex h-2.5 w-2.5">
      <span
        className={`absolute inline-flex h-full w-full rounded-full ${
          phase === "completed"
            ? "bg-emerald-400"
            : phase === "error"
            ? "bg-rose-500"
            : "bg-indigo-400"
        }`}
      />
      <span
        className={`absolute inline-flex h-full w-full rounded-full ${
          phase === "completed"
            ? "animate-ping bg-emerald-400/60"
            : phase === "error"
            ? "animate-ping bg-rose-400/60"
            : "animate-ping bg-indigo-400/60"
        }`}
      />
    </span>
  );
}

interface SectionProps {
  heading: string;
  gradient: string;
  children: React.ReactNode;
}

function Section({ heading, gradient, children }: SectionProps) {
  return (
    <section className={`flex flex-col gap-4 rounded-2xl border border-white/20 bg-gradient-to-br ${gradient} p-5`}>
      <h2 className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500 dark:text-slate-400">{heading}</h2>
      {children}
    </section>
  );
}

interface AgentHighlightsProps {
  phase: GenerationPhase;
}

function AgentHighlights({ phase }: AgentHighlightsProps) {
  const steps = [
    {
      title: "Intelligent Beat Detection",
      description: "Splits long-form scripts into cinematic beats, capturing tone and pacing heuristically.",
      icon: "/icons/beat.svg",
    },
    {
      title: "Asset Orchestration",
      description: "Assigns B-roll lookups, voiceover passes, captioning, and music prompts automatically.",
      icon: "/icons/assets.svg",
    },
    {
      title: "Sora² Render Control",
      description: "Dispatches multi-shot prompts with lens, motion, and continuity metadata.",
      icon: "/icons/render.svg",
    },
  ];

  return (
    <div className="grid gap-4 rounded-2xl border border-zinc-100 bg-white/80 p-6 dark:border-zinc-800/60 dark:bg-zinc-900/80">
      <span className="text-xs font-semibold uppercase tracking-[0.4em] text-indigo-500">Agent Stack</span>
      <AnimatePresence>
        {steps.map((step, index) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * sectionDelay, duration: 0.4, ease: "easeOut" }}
            className={`flex flex-col gap-3 rounded-xl border border-zinc-200/60 bg-white/70 p-4 dark:border-zinc-800/60 dark:bg-zinc-950/60 ${
              phase === "completed" ? "border-emerald-400/30" : ""
            }`}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">{step.title}</h3>
              <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-indigo-500">
                {index + 1}
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">{step.description}</p>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

interface TagProps {
  children: React.ReactNode;
}

function Tag({ children }: TagProps) {
  return (
    <span className="rounded-full bg-white/60 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.25em] text-slate-500 dark:bg-white/10 dark:text-slate-300">
      {children}
    </span>
  );
}
