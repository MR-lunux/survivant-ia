// scripts/music-auto-record.ts
// Usage: npx tsx scripts/music-auto-record.ts <Composition>
//
// Auto-records strudel-claude's audio output to MP3 via BlackHole 2ch +
// ffmpeg, with no human interaction. The script:
//   1. Detects the BlackHole 2ch ffmpeg avfoundation device index
//   2. Saves the current system output device, switches to BlackHole 2ch
//   3. Posts the score's Strudel code to strudel-claude
//   4. Spawns ffmpeg capturing from BlackHole for (durationSec + buffer) sec
//   5. Posts /api/play, waits durationSec, posts /api/stop
//   6. Trims leading silence via ffmpeg silenceremove, converts to MP3 192k
//   7. Restores the original system output device
//
// One-time setup:
//   brew install --cask blackhole-2ch       # virtual audio device
//   brew install switchaudio-osx            # CLI to switch system output
//   sudo killall coreaudiod                 # force-load BlackHole driver
//
// Per-session prerequisite:
//   The strudel-claude tab MUST be open in your browser (any tab on
//   localhost:3010) AND must have received at least one user gesture
//   (a click anywhere in the page) to unblock Web Audio. After that,
//   you can run music:auto-record N times without further interaction.

import { spawn, execFile } from "node:child_process";
import { promisify } from "node:util";
import { existsSync, mkdirSync, unlinkSync } from "node:fs";
import { join, resolve } from "node:path";
import { generateStrudel } from "../src/lib/score/generate";
import type { Score } from "../src/lib/score/types";

const runFile = promisify(execFile);

const STRUDEL_URL = process.env.STRUDEL_CLAUDE_URL ?? "http://localhost:3010";
const root = resolve(__dirname, "..");
const videosDir = join(root, "src/videos");
const audioDir = join(root, "public/audio");

type AudioDevice = { index: number; name: string };

async function listFfmpegAudioDevices(): Promise<AudioDevice[]> {
  // ffmpeg writes the device list to stderr and exits non-zero, which is normal.
  try {
    await runFile("ffmpeg", [
      "-hide_banner",
      "-f", "avfoundation",
      "-list_devices", "true",
      "-i", "",
    ]);
    return [];
  } catch (err) {
    const stderr = (err as { stderr?: string }).stderr ?? "";
    const audioStart = stderr.indexOf("audio devices:");
    if (audioStart === -1) return [];
    const audioSection = stderr.slice(audioStart);
    const lines = audioSection.split("\n");
    const re = /\[(\d+)\]\s+(.+?)\s*$/;
    const devices: AudioDevice[] = [];
    for (const line of lines) {
      if (line.includes("audio devices:")) continue;
      if (line.includes("Error opening")) break;
      const cleaned = line.replace(/^\[AVFoundation indev @ [^\]]+\]\s*/, "").trim();
      const m = cleaned.match(re);
      if (m) devices.push({ index: Number(m[1]), name: m[2].trim() });
    }
    return devices;
  }
}

async function findBlackHoleIndex(): Promise<number> {
  const devices = await listFfmpegAudioDevices();
  const bh = devices.find(d => /blackhole/i.test(d.name));
  if (!bh) {
    throw new Error(
      "BlackHole 2ch not found in ffmpeg avfoundation audio devices.\n" +
      "  Install: brew install --cask blackhole-2ch\n" +
      "  Then:    sudo killall coreaudiod",
    );
  }
  return bh.index;
}

async function getCurrentOutputDevice(): Promise<string> {
  const { stdout } = await runFile("SwitchAudioSource", ["-c", "-t", "output"]);
  return stdout.trim();
}

async function setOutputDevice(name: string): Promise<void> {
  await runFile("SwitchAudioSource", ["-s", name, "-t", "output"]);
}

async function checkStrudelClaude(): Promise<boolean> {
  try {
    const res = await fetch(`${STRUDEL_URL}/api/status`);
    return res.ok;
  } catch {
    return false;
  }
}

async function postCode(code: string): Promise<void> {
  const r = await fetch(`${STRUDEL_URL}/api/code`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  });
  if (!r.ok) throw new Error(`POST /api/code failed: ${r.status}`);
}

async function postPlay(): Promise<void> {
  const r = await fetch(`${STRUDEL_URL}/api/play`, { method: "POST" });
  if (!r.ok) throw new Error(`POST /api/play failed: ${r.status}`);
}

async function postStop(): Promise<void> {
  await fetch(`${STRUDEL_URL}/api/stop`, { method: "POST" }).catch(() => {});
}

async function loadScore(scorePath: string): Promise<Score> {
  const url = `${scorePath}?t=${Date.now()}`;
  const mod = await import(url);
  if (!mod.SCORE) throw new Error(`${scorePath} does not export SCORE`);
  return mod.SCORE as Score;
}

function kebab(s: string): string {
  return s.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
}

const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

async function main() {
  const composition = process.argv.slice(2).find(a => !a.startsWith("--"));
  if (!composition) {
    console.error("usage: tsx scripts/music-auto-record.ts <Composition>");
    process.exit(1);
  }

  const scorePath = join(videosDir, `${composition}.score.ts`);
  if (!existsSync(scorePath)) {
    console.error(`✗ Score not found: ${scorePath}. Run music:scaffold first.`);
    process.exit(1);
  }

  console.log("🎵 music-auto-record\n");

  // 1. BlackHole detection
  const bhIndex = await findBlackHoleIndex();
  console.log(`✓ BlackHole 2ch at ffmpeg audio index [${bhIndex}]`);

  // 2. strudel-claude reachable?
  if (!(await checkStrudelClaude())) {
    console.error(`✗ strudel-claude unreachable on ${STRUDEL_URL}`);
    console.error(`  Start it: cd ~/Documents/strudel-claude && PORT=3010 npm run dev`);
    process.exit(1);
  }
  console.log(`✓ strudel-claude on ${STRUDEL_URL}`);

  // 3. Save current output, install cleanup handlers
  const originalOutput = await getCurrentOutputDevice();
  console.log(`✓ Saved current output: ${originalOutput}`);

  let cleanedUp = false;
  const cleanup = async (reason: string) => {
    if (cleanedUp) return;
    cleanedUp = true;
    console.log(`\n› cleanup (${reason})`);
    await postStop();
    try {
      await setOutputDevice(originalOutput);
      console.log(`  ✓ Restored output → ${originalOutput}`);
    } catch (err) {
      console.error(`  ✗ Couldn't restore output: ${(err as Error).message}`);
      console.error(`    Manually: System Settings → Sound → Output → "${originalOutput}"`);
    }
  };
  process.on("SIGINT", async () => { await cleanup("SIGINT"); process.exit(130); });
  process.on("SIGTERM", async () => { await cleanup("SIGTERM"); process.exit(143); });

  try {
    // 4. Switch output to BlackHole
    await setOutputDevice("BlackHole 2ch");
    console.log("✓ Output → BlackHole 2ch");

    // 5. Load score, generate Strudel, push
    const score = await loadScore(scorePath);
    const code = generateStrudel(score);
    await postCode(code);
    console.log(`✓ Pushed ${score.beats.length} beats (preset: ${score.preset}, ${score.durationSec}s)`);

    // Stop any current playback, brief pause
    await postStop();
    await sleep(300);

    // 6. Spawn ffmpeg capture
    mkdirSync(audioDir, { recursive: true });
    const tmpWav = `/tmp/${kebab(composition)}-raw.wav`;
    const recordSec = score.durationSec + 2; // 2s buffer total (lead + tail)
    const ffmpegArgs = [
      "-hide_banner",
      "-loglevel", "warning",
      "-f", "avfoundation",
      "-i", `:${bhIndex}`,
      "-t", String(recordSec),
      "-ar", "48000",
      "-ac", "2",
      "-y", tmpWav,
    ];
    console.log(`› ffmpeg capturing ${recordSec}s → ${tmpWav}`);
    const ffmpeg = spawn("ffmpeg", ffmpegArgs, { stdio: ["ignore", "ignore", "pipe"] });
    let ffmpegStderr = "";
    ffmpeg.stderr.on("data", chunk => { ffmpegStderr += chunk.toString(); });
    const ffmpegDone = new Promise<number>((res, rej) => {
      ffmpeg.on("exit", code => res(code ?? 0));
      ffmpeg.on("error", rej);
    });

    // 7. Give ffmpeg time to initialize, then start playback
    await sleep(700);
    await postPlay();
    console.log(`✓ play`);

    // 8. Wait full duration, then stop playback
    await sleep(score.durationSec * 1000);
    await postStop();
    console.log("✓ stop");

    // 9. Wait for ffmpeg's -t to expire and exit
    const exitCode = await ffmpegDone;
    if (exitCode !== 0) {
      console.error("ffmpeg stderr:", ffmpegStderr);
      throw new Error(`ffmpeg exited with code ${exitCode}`);
    }
    console.log("✓ ffmpeg done");

    // 10. Trim leading silence + convert to MP3
    //   silenceremove trims silence at start below -50dB lasting 50ms+
    //   -t keeps exactly durationSec of audio after the trim
    const outMp3 = join(audioDir, `${kebab(composition)}.mp3`);
    await runFile("ffmpeg", [
      "-hide_banner",
      "-loglevel", "error",
      "-y",
      "-i", tmpWav,
      "-af", "silenceremove=start_periods=1:start_threshold=-50dB:start_duration=0.05",
      "-t", String(score.durationSec),
      "-b:a", "192k",
      "-ar", "48000",
      "-ac", "2",
      outMp3,
    ]);
    console.log(`✓ MP3 written → ${outMp3}`);
    unlinkSync(tmpWav);

    // 11. Restore output device
    await cleanup("done");

    const kebabName = kebab(composition);
    console.log(`\n🎵 Composition recorded.`);
    console.log(`   File: video/public/audio/${kebabName}.mp3`);
    console.log(`   Add this to ${composition}.tsx if not already:`);
    console.log(`     <Audio src={staticFile("audio/${kebabName}.mp3")} />`);
  } catch (err) {
    console.error(`\n✗ ${(err as Error).message}`);
    await cleanup("error");
    process.exit(1);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
