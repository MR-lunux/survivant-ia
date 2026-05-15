// Charge Space Mono, Inter, et Playfair Display via @remotion/google-fonts
import { loadFont as loadSpaceMono } from "@remotion/google-fonts/SpaceMono";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadPlayfair } from "@remotion/google-fonts/PlayfairDisplay";

export const spaceMono = loadSpaceMono("normal", {
  weights: ["400", "700"],
});

export const inter = loadInter("normal", {
  weights: ["400", "500", "600", "700", "900"],
});

export const playfair = loadPlayfair("normal", {
  weights: ["400", "700"],
});

export const playfairItalic = loadPlayfair("italic", {
  weights: ["400", "700"],
});
