// video/src/carousel/types.ts

/** Hook slide : phrase courte qui stoppe le scroll. */
export type HookContent = {
  /** Première ligne du hook (Inter, accent menthe). */
  line1: string;
  /** Deuxième ligne (optionnelle), Playfair italic. */
  line2?: string;
  /** Icône optionnelle au-dessus du hook (one-shot, pas un système). */
  icon?: 'microphone';
};

/** Setup slide : la situation que vit la cible. */
export type SetupContent = {
  /** Kicker court (ex: "LE CONSTAT") affiché à côté du carré menthe. */
  kicker: string;
  /** Paragraphe de setup, 2-4 lignes max. */
  body: string;
};

/** Bascule slide : le pivot vers l'opportunité. */
export type BasculeContent = {
  kicker: string;
  /** Phrase d'amorce (Inter). */
  amorce: string;
  /** Phrase de bascule (Playfair italic, accent). */
  bascule: string;
};

/** Levier slide : un levier concret applicable. */
export type LevierContent = {
  /** Numéro romain : "I" | "II" | "III". */
  numero: 'I' | 'II' | 'III';
  /** Titre court du levier. */
  titre: string;
  /** Développement, 3-5 lignes max. */
  body: string;
};

/** Quote slide : phrase signature manifeste. */
export type QuoteContent = {
  /** Quote en Playfair italic. */
  quote: string;
  /** Attribution (ex: "Mathieu, Deputy Head of IT · Survivant de l'IA"). */
  attribution: string;
};

/** Cta slide : CTA newsletter + URL. */
export type CtaContent = {
  /** Titre du CTA (ex: "Article complet sur le site"). */
  titre: string;
  /** Sous-titre (ex: "La Fréquence : un nouvel article chaque semaine"). */
  soustitre: string;
  /** URL affichée (ex: "survivant-ia.ch"). */
  url: string;
};

/** Données complètes d'un cycle de carrousel. */
export type CycleData = {
  /** Identifiant du cycle (ex: "cycle-1"). */
  id: string;
  /** Slug de l'article sur le site (ex: "comment-ne-pas-se-faire-remplacer"). */
  articleSlug: string;
  hook: HookContent;
  setup: SetupContent;
  bascule: BasculeContent;
  /** Exactement 3 leviers (structure rigide V1). */
  leviers: [LevierContent, LevierContent, LevierContent];
  quote: QuoteContent;
  cta: CtaContent;
};
