// Schémas zod pour les 3 templates vidéo.
// Studio Remotion détecte ces schémas et génère un formulaire dans la sidebar.
// Mathieu remplit, scrub la preview, render.

import { z } from "zod";
import { zTextarea } from "@remotion/zod-types";
import { COLORS } from "./theme";

// Palette restreinte pour rester aligné DA. zEnum() = dropdown dans Studio.
export const StatColorSchema = z.enum(["danger", "mutation", "accent", "text"]);
export type StatColor = z.infer<typeof StatColorSchema>;

export const colorFromToken = (token: StatColor): string => {
  switch (token) {
    case "danger":
      return COLORS.danger;
    case "mutation":
      return COLORS.mutation;
    case "accent":
      return COLORS.accent;
    case "text":
      return COLORS.text;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Vidéo 1 — Rapport Terminal
// ─────────────────────────────────────────────────────────────────────────────

export const RapportTerminalSchema = z.object({
  kickerLabel: z.string(),

  // Beat 1 — Stat 1 (la stat "négative")
  stat1Label: z.string(),
  stat1Value: z.number().int().min(0).max(100),
  stat1Color: StatColorSchema,

  // Beat 2 — Stat 2 (la stat "positive")
  stat2Label: z.string(),
  stat2Value: z.number().int().min(0).max(100),
  stat2Color: StatColorSchema,

  // Beat 3 — Statement choc (3 lignes max)
  statementLine1: z.string(),
  statementLine2: z.string(),
  statementLine3: z.string(),
  statementLine3IsAccent: z.boolean(), // mettre la ligne 3 en sage
  statementCaption: z.string(),         // "› devine qui saute."

  // Beat 4 — Pivot 3 leviers
  pivotKicker: z.string(),
  pivotDeclarative: z.string(),
  pivotSignature: z.string(),

  // Beat 5 — 3 leviers
  lever1Title: z.string(),
  lever1Body: zTextarea(),
  lever2Title: z.string(),
  lever2Body: zTextarea(),
  lever3Title: z.string(),
  lever3Body: zTextarea(),

  // Beat 6 — Close
  closePrefix: z.string(),
  closeUrl: z.string(),
  closeFooter: z.string(),
});
export type RapportTerminalProps = z.infer<typeof RapportTerminalSchema>;

export const rapportTerminalDefaults: RapportTerminalProps = {
  kickerLabel: "RAPPORT 003 / EFFICIENCE",
  stat1Label: "ton efficience par défaut",
  stat1Value: 40,
  stat1Color: "danger",
  stat2Label: "même personne, IA maîtrisée",
  stat2Value: 80,
  stat2Color: "accent",
  statementLine1: "une personne",
  statementLine2: "fait le boulot",
  statementLine3: "de deux.",
  statementLine3IsAccent: true,
  statementCaption: "› devine qui saute.",
  pivotKicker: "riposte / 3 leviers",
  pivotDeclarative: "rester celui\nqui",
  pivotSignature: "pilote.",
  lever1Title: "liste 3 tâches qui te font soupirer.",
  lever1Body:
    "reportings, mails de suivi, comptes-rendus. là où l'IA te rend des heures.",
  lever2Title: "10 minutes par semaine.",
  lever2Body:
    "« ton métier + IA » sur LinkedIn. ne sois pas le dernier au courant.",
  lever3Title: "parle-lui comme à un nouveau collègue.",
  lever3Body: "contexte, ton, public. c'est un dialogue, pas une commande.",
  closePrefix: "le rapport complet :",
  closeUrl: "survivant-ia.ch",
  closeFooter: "la fréquence · gratuit · hebdo",
};

// ─────────────────────────────────────────────────────────────────────────────
// Vidéo 2 — Storytime
// ─────────────────────────────────────────────────────────────────────────────

export const StorytimeSchema = z.object({
  kickerLabel: z.string(),

  // Beat 1 — Hook
  hookLine1: z.string(),
  hookLine2: z.string(),
  hookSignature: z.string(),

  // Beat 2 — Setup REX
  setupKicker: z.string(),
  setupLine1: z.string(),
  setupLine2: z.string(),
  setupLine3: z.string(),

  // Beat 3 — Démonstration de la perte
  decayPrefix: z.string(),       // "› recherche du mot juste..."
  decayWord1: z.string(),
  decayWord2: z.string(),
  decaySuffix: z.string(),       // "› j'ouvrais Claude. il rédigeait..."

  // Beat 4 — Concept reveal
  conceptKicker: z.string(),
  conceptName: z.string(),       // signature italique sage
  conceptExplain1: z.string(),
  conceptExplain2: z.string(),
  conceptSource: z.string(),

  // Beat 5 — Image marquante
  imageLine1: z.string(),
  imageLine2: z.string(),
  imageMuscle: z.string(),
  imageWords: z.string(),

  // Beat 6 — Concept coined
  coinedDeclarative1: z.string(),  // "tu deviens"
  coinedDeclarative2: z.string(),  // "un"
  coinedSignature: z.string(),     // signature italique
  coinedSubtitle: z.string(),

  // Beat 7 — Close
  closeTagline: z.string(),
  closeUrl: z.string(),
});
export type StorytimeProps = z.infer<typeof StorytimeSchema>;

export const storytimeDefaults: StorytimeProps = {
  kickerLabel: "REX / DEPUTY HEAD OF IT",
  hookLine1: "je perdais",
  hookLine2: "mes mots.",
  hookSignature: "pour de vrai.",
  setupKicker: "le contexte",
  setupLine1: "j'écris toute la journée.",
  setupLine2: "emails, specs, comptes-rendus à la direction.",
  setupLine3: "à force, j'ai vu mon niveau de grammaire fondre.",
  decayPrefix: "› recherche du mot juste...",
  decayWord1: "subjonctif",
  decayWord2: "concordance",
  decaySuffix: "› j'ouvrais Claude. il rédigeait. je validais.",
  conceptKicker: "le piège a un nom",
  conceptName: "l'offloading cognitif.",
  conceptExplain1: "ton cerveau délègue à n'importe quel outil dispo.",
  conceptExplain2: "calculatrice. GPS. et maintenant, ton langage.",
  conceptSource: "src · Risko & Gilbert, 2016",
  imageLine1: "ce qu'on n'utilise plus,",
  imageLine2: "on le perd.",
  imageMuscle: "les muscles.",
  imageWords: "les mots aussi.",
  coinedDeclarative1: "tu deviens",
  coinedDeclarative2: "un",
  coinedSignature: "simple valideur.",
  coinedSubtitle: "quelqu'un qui appuie sur entrée.",
  closeTagline: "le protocole anti-ramollissement",
  closeUrl: "survivant-ia.ch",
};

// ─────────────────────────────────────────────────────────────────────────────
// Vidéo 3 — Test Diagnostic
// ─────────────────────────────────────────────────────────────────────────────

export const TestDiagnosticSchema = z.object({
  kickerLabel: z.string(),
  riskBarLabel: z.string(),

  // Beat 1 — Hook
  hookPrefix: z.string(),
  hookDeclarative1: z.string(),
  hookDeclarative2: z.string(),
  hookSignature: z.string(),

  // 3 signes
  sign1Title: z.string(),
  sign2Title: z.string(),
  sign3Title: z.string(),

  // Verdict
  verdictLabel: z.string(),
  verdict0: z.string(),
  verdict12: z.string(),
  verdict3Prefix: z.string(),
  verdict3Signature: z.string(),

  // CTA
  ctaCommand: z.string(),
  ctaSignature: z.string(),
  ctaUrl: z.string(),
});
export type TestDiagnosticProps = z.infer<typeof TestDiagnosticSchema>;

export const testDiagnosticDefaults: TestDiagnosticProps = {
  kickerLabel: "DIAGNOSTIC / TRC-01",
  riskBarLabel: "niveau de risque",
  hookPrefix: "› scan initié",
  hookDeclarative1: "3 signes",
  hookDeclarative2: "que t'es devenu",
  hookSignature: "simple valideur.",
  sign1Title: "tu ouvres l'IA avant d'avoir pensé.",
  sign2Title: "tu valides en diagonale ce qu'elle sort.",
  sign3Title: "3 mois après, tu repars de zéro\nsur la même tâche.",
  verdictLabel: "verdict",
  verdict0: "0/3 → survivant lucide.",
  verdict12: "1-2/3 → dépendance en cours.",
  verdict3Prefix: "3/3 →",
  verdict3Signature: "atrophie critique.",
  ctaCommand: "ton score en commentaire.",
  ctaSignature: "on récupère le pilote.",
  ctaUrl: "survivant-ia.ch",
};

// ─────────────────────────────────────────────────────────────────────────────
// FaceCam Timeline
// ─────────────────────────────────────────────────────────────────────────────

export const SCENE_NAMES = [
  "KickerOpening",
  "WordBeat",
  "BigStat",
  "ConceptCard",
  "ItalicMoment",
  "IconReveal",
  "QuoteFrame",
  "HairlineDivider",
  "CloseURL",
] as const;

export const TimelineEventSchema = z
  .object({
    tStart: z.number().min(0),
    tEnd: z.number().min(0),
    scene: z.enum(SCENE_NAMES),
    props: z.object({}).passthrough(),
  })
  .refine((e) => e.tEnd > e.tStart, {
    message: "tEnd must be greater than tStart",
  });

export const CropAnchorSchema = z.union([
  z.enum(["top", "center", "bottom"]),
  z.object({ y: z.number().min(0).max(1) }),
]);

export const FaceCamTimelineSchema = z.object({
  episodeId: z.string().min(1),
  inputAspect: z.enum(["9:16", "16:9"]),
  cropAnchor: CropAnchorSchema,
  cuts: z.array(z.object({ from: z.number().min(0), to: z.number().min(0) })),
  totalDurationSec: z.number().positive(),
  events: z.array(TimelineEventSchema),
  sourceDims: z.object({ w: z.number().positive(), h: z.number().positive() }).optional(),
});

export type FaceCamTimeline = z.infer<typeof FaceCamTimelineSchema>;
export type TimelineEvent = z.infer<typeof TimelineEventSchema>;
export type CropAnchor = z.infer<typeof CropAnchorSchema>;
export type SceneName = (typeof SCENE_NAMES)[number];
