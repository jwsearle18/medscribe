"use client";

import { useEffect, useRef } from "react";

interface WaveformProps {
  analyser: AnalyserNode | null;
  paused: boolean;
}

const INK = "33, 28, 23"; // --ink, as rgb parts for alpha
const RULE = "#dbd7d1"; // resting baseline color

/**
 * A live waveform driven by the actual microphone amplitude. This is not
 * decoration: it reports that audio is genuinely being captured, which is the
 * whole motion budget for this screen (DESIGN.md, principle 5). Drawn on a
 * canvas so 60fps updates never re-render React. When paused, or when the user
 * prefers reduced motion, it settles to a flat resting line.
 */
export default function Waveform({ analyser, paused }: WaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Size the canvas to its box, accounting for device pixel ratio.
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const BARS = 48;
    const data = analyser ? new Uint8Array(analyser.frequencyBinCount) : null;

    const drawResting = () => {
      const { width, height } = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = RULE;
      const mid = height / 2;
      ctx.fillRect(0, mid - 0.75, width, 1.5);
    };

    const draw = () => {
      const { width, height } = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, width, height);
      const mid = height / 2;

      if (!analyser || !data) {
        drawResting();
        return;
      }
      analyser.getByteFrequencyData(data);

      const gap = 3;
      const barWidth = (width - gap * (BARS - 1)) / BARS;
      const step = Math.floor(data.length / BARS) || 1;

      for (let i = 0; i < BARS; i++) {
        const v = data[i * step] / 255; // 0..1
        // Small floor so quiet moments still read as a live waveform.
        const amp = Math.max(0.04, v);
        const barHeight = amp * (height * 0.9);
        const x = i * (barWidth + gap);
        const alpha = 0.35 + v * 0.55;
        ctx.fillStyle = `rgba(${INK}, ${alpha})`;
        const radius = Math.min(barWidth / 2, 2);
        roundRect(ctx, x, mid - barHeight / 2, barWidth, barHeight, radius);
        ctx.fill();
      }
    };

    const loop = () => {
      draw();
      rafRef.current = requestAnimationFrame(loop);
    };

    if (analyser && !paused && !reduceMotion) {
      loop();
    } else if (analyser && !paused && reduceMotion) {
      draw(); // one static frame reflecting current input
    } else {
      drawResting();
    }

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [analyser, paused]);

  return <canvas ref={canvasRef} className="h-16 w-full" aria-hidden="true" />;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}
