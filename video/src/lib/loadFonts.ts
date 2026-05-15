// Charge Space Mono et Inter via @remotion/google-fonts
import { loadFont as loadSpaceMono } from "@remotion/google-fonts/SpaceMono";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";

export const spaceMono = loadSpaceMono("normal", {
  weights: ["400", "700"],
});

export const inter = loadInter("normal", {
  weights: ["400", "500", "600", "700"],
});
