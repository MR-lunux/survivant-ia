#!/usr/bin/env node
// Generates a 10s demo video with a TTS-like beep track for E2E testing.
// Replaces the need for a real face cam — uses ffmpeg testsrc + a sine tone.

import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const out = join(process.cwd(), "public/facecam-raws/_demo-10s.mp4");
mkdirSync(join(process.cwd(), "public/facecam-raws"), { recursive: true });

execFileSync(
  "ffmpeg",
  [
    "-y",
    "-f", "lavfi", "-i", "testsrc2=size=1080x1920:rate=30:duration=10",
    "-f", "lavfi", "-i", "sine=frequency=440:duration=10",
    "-c:v", "libx264", "-pix_fmt", "yuv420p",
    "-c:a", "aac",
    "-shortest",
    out,
  ],
  { stdio: "inherit" },
);
console.log(`✓ ${out}`);
