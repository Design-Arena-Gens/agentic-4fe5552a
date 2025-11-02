import { randomUUID } from "crypto";
import { NextResponse } from "next/server";

import { buildScenesFromScript, generateAssetBriefs, generateTimelineFromScenes } from "@/lib/pipeline";

const DEFAULT_PREVIEW =
  "https://storage.googleapis.com/coverr-main/mp4/Mt_Baker.mp4";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const script = typeof body.script === "string" ? body.script : "";
    const tone = typeof body.tone === "string" ? body.tone : "Inspirational documentary";
    const duration = typeof body.duration === "string" ? body.duration : "3-5 minutes";
    const ratio = typeof body.ratio === "string" ? body.ratio : "16:9";
    const voice = typeof body.voice === "string" ? body.voice : "Warm female narrator";

    if (!script.trim()) {
      return NextResponse.json({ error: "Script is required" }, { status: 400 });
    }

    const requestId = randomUUID();
    const scenes = buildScenesFromScript(script, tone);
    const assets = generateAssetBriefs(scenes, voice);
    const timeline = generateTimelineFromScenes(scenes, duration);

    const apiKey = process.env.SORA2_API_KEY;
    const apiUrl = process.env.SORA2_API_URL ?? "https://api.sora2.openai.com/v1/videos";

    if (!apiKey) {
      return NextResponse.json({
        mock: true,
        requestId,
        scenes,
        assets,
        timeline,
        message:
          "SORA2_API_KEY not configured. Returning local orchestration preview. Add the key to enable live renders.",
        previewUrl: DEFAULT_PREVIEW,
      });
    }

    const payload = {
      storyboard: scenes.map((scene) => ({
        id: scene.id,
        title: scene.title,
        description: scene.summary,
        visuals: scene.visuals,
        duration: scene.estimatedDuration,
      })),
      timeline,
      config: {
        voice,
        tone,
        ratio,
        targetDuration: duration,
      },
    };

    let jobId: string | undefined;
    let previewUrl: string | undefined;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12_000);

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Sora² API error (${response.status}): ${text}`);
      }

      const result = (await response.json()) as {
        jobId?: string;
        previewUrl?: string;
        status?: string;
      };

      jobId = result.jobId;
      previewUrl = result.previewUrl;
    } catch (error) {
      console.warn("Sora² API request failed, falling back to mock preview.", error);
      previewUrl = DEFAULT_PREVIEW;
    }

    return NextResponse.json({
      mock: !jobId,
      requestId,
      jobId,
      scenes,
      assets,
      timeline,
      previewUrl,
      message: jobId
        ? "Sora² render job dispatched successfully."
        : "Sora² API unreachable. Returning local preview with orchestration data.",
    });
  } catch (error) {
    console.error("Sora² agent failure", error);
    return NextResponse.json(
      { error: "Unable to orchestrate Sora² pipeline. Please retry later." },
      { status: 500 },
    );
  }
}
