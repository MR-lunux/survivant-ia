/**
 * Note: When using the Node.JS APIs, the config file
 * doesn't apply. Instead, pass options directly to the APIs.
 *
 * All configuration options: https://remotion.dev/docs/config
 */

import { Config } from "@remotion/cli/config";
import { enableTailwind } from '@remotion/tailwind-v4';

// PNG plutôt que JPEG comme intermediate : évite le yuvj420p full-range
// qui rend les .mp4 incompatibles avec QuickTime / TikTok.
Config.setVideoImageFormat("png");
Config.setOverwriteOutput(true);
Config.overrideWebpackConfig(enableTailwind);

// H.264 Constrained Baseline + yuv420p TV-range = compat universelle
// (QuickTime, Safari, Chrome, TikTok, iOS).
Config.setCodec("h264");
Config.setPixelFormat("yuv420p");
Config.setCrf(22);
