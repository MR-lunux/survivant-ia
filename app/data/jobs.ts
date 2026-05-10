// app/data/jobs.ts

import type { JobSecteur } from './secteurs'
export type { JobSecteur } from './secteurs'

export type JobStatus = 'danger' | 'mutation' | 'protege' | 'croissance'   // v1, conservé pour backward compat
export type JobQuadrant = 'tiens' | 'pilotes' | 'pivotes' | 'mutes'        // v2

export interface Job {
  slug: string
  label: string
  risk: number              // 0–100, exposition IA
  horizon: number           // 2 | 5 | 10
  status: JobStatus         // v1, ÉDITORIAL — conservé pour backward compat (sitemap, JSON-LD, analytics)
  dynamic: string           // ≤ 300 chars, voix Survivant-IA (apostrophe + factuel)
  sources: number[]         // ids du catalogue sources.ts ; [] = pas de source spécifique
  // ── v2 ─────────────────────────────────────────────────
  quadrant: JobQuadrant     // 4-state v2, ÉDITORIAL — non dérivé d'un seuil
  potential: number         // 0–100, levier d'amplification IA
  leviers: string[]         // 3 leviers per-job (titre + description, séparateur ` — `) ; [] = fallback per-quadrant
  secteur: JobSecteur     // nouveau (sous-projet 4 SEO)
}

// Quadrant taxonomy v2 (matrice risk × potential):
//   tiens     - métier solide, peu de levier IA. Stabilité naturelle.
//   pilotes   - métier solide ET fort levier IA. Avantage à capitaliser.
//   pivotes   - métier en contraction, peu de levier IA. Reconversion à anticiper.
//   mutes     - métier en contraction MAIS fort levier IA. Saute le pas avant les autres.


export const JOBS: Job[] = [
  // ── EN DANGER ──────────────────────────────────────────
  // (risque élevé, contraction réelle des effectifs)

  { slug: 'teleconseiller', label: 'Téléconseiller', risk: 78, horizon: 2, status: 'danger',
    dynamic: 'Ton métier se contracte. La réception d\'appels et la résolution des plaintes courantes sont gérées par des agents conversationnels à voix naturelle. Bascule vite vers superviseur IA ou rôle qualité — c\'est là que les centres de contact recrutent.',
    sources: [3], quadrant: 'pivotes', potential: 20, leviers: [
      'Bascule vers superviseur d\'agents IA — Apprends à monitorer et corriger les agents Zendesk AI ou Intercom AI. Les centres de contact recrutent ces profils maintenant, pas dans deux ans.',
      'Capitalise ton expertise escalade — Documente les typologies de cas que l\'IA rate : ambiguïté, détresse client, litige complexe. Ce catalogue fait de toi le référent qualité indispensable.',
      'Forme-toi au CX augmenté par IA — Suis le parcours Customer Experience sur LinkedIn Learning ou le cours gratuit d\'Anthropic Academy. Ajoute « supervision d\'agents IA » à ton profil avant la prochaine vague de suppressions.',
    ], secteur: 'cognitif-admin-finance-juridique' },

  { slug: 'televendeur', label: 'Télévendeur', risk: 92, horizon: 2, status: 'danger',
    dynamic: 'Ton métier se contracte fort. La prospection à froid et la qualification de leads sont déléguées à des agents IA capables de mener des conversations vocales complètes. Anticipe le pivot vers ventes complexes B2B ou management d\'agents IA commerciaux.',
    sources: [3], quadrant: 'pivotes', potential: 15, leviers: [
      'Bascule vers superviseur d\'agents IA — Les centres de contact recrutent des superviseurs qui arbitrent les escalades complexes. Ton expertise relationnelle reste précieuse, pas ton script.',
      'Apprends le prompt engineering en 10h — Cours gratuits sur DeepLearning.AI ou Anthropic Academy. Compétence portable et valorisable dans ton secteur ou ailleurs.',
      'Identifie le métier adjacent qui croît — Customer success, formation interne, animation communauté : ces rôles recrutent et utilisent ton ADN relationnel sans dépendre du télémarketing.',
    ], secteur: 'cognitif-admin-finance-juridique' },

  { slug: 'saisie-de-donnees', label: 'Agent de saisie de données', risk: 90, horizon: 2, status: 'danger',
    dynamic: 'Ton métier se contracte fort. La lecture de documents non structurés et leur saisie systémique sont résolues par l\'OCR cognitif et les LLM. Le WEF projette la suppression de 26 millions de ces postes — anticipe le pivot vers un rôle de supervision ou un secteur adjacent.',
    sources: [3, 9], quadrant: 'pivotes', potential: 10, leviers: [
      'Pilote un outil d\'automatisation de saisie cette semaine — Teste Docsumo ou Nanonets sur tes propres documents. Comprendre l\'outil que tu vas superviser est ton ticket d\'entrée vers le rôle suivant.',
      'Repositionne-toi sur le contrôle qualité des flux IA — Les erreurs OCR et les champs mal extraits exigent une validation humaine. C\'est le poste qui résiste : superviseur de pipeline de données.',
      'Pivote vers un secteur qui recrute — Vise la gestion administrative en santé, en juridique ou en finance : ces secteurs cherchent des profils rigoureux capables de superviser des flux automatisés. OpenClassrooms propose des formations courtes financées CPF.',
    ], secteur: 'cognitif-admin-finance-juridique' },

  { slug: 'redacteur-web', label: 'Rédacteur web', risk: 76, horizon: 2, status: 'danger',
    dynamic: 'Ton métier mute. La rédaction de contenu web standardisé est massivement automatisée par les LLM. Bascule vers la direction éditoriale, le personal branding ou le pilotage d\'agents IA — c\'est là que la valeur se reconstruit.',
    sources: [1, 15, 17], quadrant: 'mutes', potential: 60, leviers: [
      'Intègre Claude ou ChatGPT dans ton workflow cette semaine — Utilise-les pour les premiers brouillons, toi tu interviens sur la voix, l\'angle et la structure. Documente ton gain de temps pour le négocier avec tes clients.',
      'Repositionne-toi en directeur éditorial — Tu ne produis plus du texte, tu valides, tu signes, tu définis la ligne. La supervision de contenu IA est le rôle qui monte dans toutes les rédactions.',
      'Construis une expertise niche documentée — Deviens la référence IA sur un secteur (finance, santé, droit). Suis le cours « AI for Content Creators » sur DeepLearning.AI et publie tes apprentissages sur LinkedIn.',
    ], secteur: 'cognitif-admin-finance-juridique' },

  { slug: 'traducteur', label: 'Traducteur', risk: 82, horizon: 2, status: 'danger',
    dynamic: 'Ton métier se contracte. La traduction généraliste est absorbée par les LLM à fidélité quasi-humaine. Le marché se replie sur la traduction littéraire nuancée, la post-édition IA et la localisation à haute sensibilité culturelle.',
    sources: [1], quadrant: 'pivotes', potential: 30, leviers: [
      'Bascule vers la post-édition IA — DeepL ou Claude font 80% du boulot. Facture ta valeur sur la correction des erreurs culturelles, idiomatiques et de registre que l\'IA rate systématiquement.',
      'Spécialise-toi sur un domaine réglementé — Traduction juridique, médicale ou financière : les erreurs coûtent cher, la responsabilité reste humaine. Ce segment résiste mieux à la commoditisation.',
      'Forme-toi à la localisation UX — Interfaces, microcopy, chatbots multilingues : les entreprises tech cherchent des traducteurs qui comprennent le produit. Suis un cours UX writing ou localisation sur LinkedIn Learning.',
    ], secteur: 'cognitif-admin-finance-juridique' },

  { slug: 'correcteur', label: 'Correcteur / Relecteur', risk: 85, horizon: 2, status: 'danger',
    dynamic: 'Ton métier se contracte. Correction orthographique, grammaticale, formatage stylistique : l\'IA exécute avec une constance supérieure. Les postes de relecture traditionnels se raréfient — pivote vers l\'édition éditoriale ou la révision de contenu généré par IA.',
    sources: [1], quadrant: 'pivotes', potential: 20, leviers: [
      'Deviens réviseur de contenus IA — Utilise Hemingway Editor + Claude pour comparer sorties brutes et corrections humaines. Le marché de la validation de contenu IA est en train de naître.',
      'Pivote vers l\'édition de fond — Restructuration narrative, cohérence argumentaire, style de marque : ce que l\'IA ne sait pas encore faire. Repositionne ton offre sur la valeur éditoriale, pas la correction technique.',
      'Certifie-toi sur un domaine à enjeux — Relecture de contenus médicaux, juridiques ou financiers : des organismes comme le Syndicat national de l\'édition proposent des formations. La responsabilité sectorielle valorise ton expertise.',
    ], secteur: 'cognitif-admin-finance-juridique' },

  { slug: 'transcripteur', label: 'Transcripteur', risk: 88, horizon: 2, status: 'danger',
    dynamic: 'Ton métier se contracte fort. La transcription audio→texte et la synthèse de réunions sont des fonctionnalités natives gratuites des outils bureautiques. Le marché indépendant est quasi inexistant — bascule vers un secteur adjacent sans attendre.',
    sources: [3], quadrant: 'pivotes', potential: 10, leviers: [
      'Bascule vers la post-édition de transcriptions IA — Whisper et Otter font 90% du travail. Le marché qui reste : la correction de précision sur audio difficile (réunions techniques, accents, jargon sectoriel).',
      'Pivote vers l\'analyse qualitative — Synthèse de focus groups, entretiens de recherche, codage thématique. L\'IA fait le brouillon, tu apportes le sens et la rigueur méthodologique.',
      'Forme-toi à l\'évaluation de modèles IA — Rôle de QA pour les outils de transcription : tester, signaler les hallucinations, améliorer les prompts. Compétence rare, formations disponibles sur Anthropic Academy.',
    ], secteur: 'cognitif-admin-finance-juridique' },

  { slug: 'comptable', label: 'Comptable', risk: 72, horizon: 5, status: 'danger',
    dynamic: 'Ton métier mute. Audit de base, rapprochement bancaire, détection de fraudes simples, tenue de livres : tout est automatisé. Tu pivotes vers le conseil stratégique et l\'audit IA — c\'est là que ton expertise comptable devient irremplaçable.',
    sources: [1, 7], quadrant: 'mutes', potential: 75, leviers: [
      'Automatise tes rapprochements bancaires avec un agent — Connecte Pennylane ou Dext à Claude pour catégoriser les transactions et flagguer les anomalies. Gain : 4 à 6 heures par semaine.',
      'Repositionne-toi sur l\'audit, pas la production — L\'IA produit les comptes, toi tu valides, tu signes, tu portes la responsabilité ordinale. C\'est là que ton expertise devient irremplaçable.',
      'Forme-toi à la finance augmentée par IA — Suis les modules dédiés sur Anthropic Academy ou DeepLearning.AI. Ajoute « Prompt engineering pour la finance » à ton CV avant les autres.',
    ], secteur: 'cognitif-admin-finance-juridique' },

  { slug: 'analyste-credit', label: 'Analyste crédit', risk: 70, horizon: 5, status: 'danger',
    dynamic: 'Ton métier mute. Le scoring crédit, l\'analyse des bilans et l\'évaluation du risque de défaut sont automatisés. Tu te repositionnes sur les dossiers complexes, la relation corporate et le conseil en structuration — là où le jugement humain prime.',
    sources: [7], quadrant: 'mutes', potential: 60, leviers: [
      'Utilise Claude pour synthétiser tes dossiers complexes — Colle les bilans et rapports dans Claude, génère une synthèse de risque en 2 minutes. Libère ton temps pour les analyses à forte valeur.',
      'Deviens l\'expert des dossiers que l\'IA refuse — Restructurations, crédits syndiqués, contreparties atypiques : ton jugement humain et ta connaissance sectorielle sont irremplaçables sur ces cas.',
      'Certifie-toi en analyse de risque IA — Suis une spécialisation « AI in Finance » sur Coursera ou DeepLearning.AI. La maîtrise des modèles de scoring IA est la compétence qui monte dans les équipes crédit.',
    ], secteur: 'cognitif-admin-finance-juridique' },

  { slug: 'analyste-marketing', label: 'Analyste études de marché', risk: 65, horizon: 5, status: 'danger',
    dynamic: 'Ton métier mute. Les LLM excellent à digérer des téraoctets de données qualitatives et à rédiger des rapports stratégiques. Tu pilotes les agents, questionnes les hypothèses et transformes l\'analyse en décision — c\'est ça ton levier.',
    sources: [1], quadrant: 'mutes', potential: 70, leviers: [
      'Pilote Perplexity + Claude pour tes études de marché — Utilise Perplexity pour le desk research, Claude pour synthétiser et structurer. Divise par 3 ton temps de production, triple ton impact stratégique.',
      'Deviens l\'interprète critique, pas le producteur — Les rapports IA se ressemblent tous. Ta valeur : les hypothèses que personne n\'a posées, les biais des données, la décision actionnable. Recentre ton offre sur ça.',
      'Maîtrise les outils d\'analyse IA en marketing — Suis « AI for Market Research » sur LinkedIn Learning ou DeepLearning.AI. Documente et partage tes cas d\'usage : c\'est ton portfolio visible.',
    ], secteur: 'cognitif-admin-finance-juridique' },

  { slug: 'assistant-juridique', label: 'Assistant juridique', risk: 72, horizon: 5, status: 'danger',
    dynamic: 'Ton métier mute vite. La revue contractuelle, la recherche jurisprudentielle et les notes de premier niveau sont automatisées. Mute maintenant vers le conseil stratégique et la supervision des outils IA juridiques — avant que la fenêtre se ferme.',
    sources: [7], quadrant: 'mutes', potential: 55, leviers: [
      'Intègre Claude pour la revue contractuelle dès cette semaine — Utilise Claude pour une première passe sur les contrats, toi tu valides et annotas les risques. Gagne 2 à 3 heures par dossier.',
      'Repositionne-toi sur la supervision IA juridique — Lexbase et Doctrine sont tes outils de vérification. Ta valeur n\'est plus dans la recherche, elle est dans la validation critique et la stratégie d\'argumentation.',
      'Forme-toi au droit augmenté par IA — Suis les modules « Legal Tech » sur LinkedIn Learning ou les formations EDHEC online. La maîtrise des outils LegalTech devient un critère de recrutement dans les cabinets.',
    ], secteur: 'cognitif-admin-finance-juridique' },

  { slug: 'secretaire-juridique', label: 'Secrétaire juridique', risk: 77, horizon: 5, status: 'danger',
    dynamic: 'Ton métier se contracte. La préparation de dossiers, les calendriers procéduraux et les courriers types sont absorbés par les outils intégrés des cabinets. Bascule vers un rôle de coordination ou une spécialisation à plus forte valeur.',
    sources: [7], quadrant: 'pivotes', potential: 25, leviers: [
      'Prends en main les outils LegalTech de ton cabinet — Que ce soit Clio, Secib ou un SIRJ, deviens la référente sur l\'outil. Ceux qui maîtrisent le logiciel sont les derniers à partir.',
      'Pivote vers coordinatrice de dossiers complexes — Organisation des expertises, suivi des délais procéduraux multi-parties, interface avec les huissiers : c\'est le noyau dur qui résiste à l\'automatisation.',
      'Vise une spécialisation juridique valorisée — Formation courte en droit immobilier, droit social ou droit des affaires sur OpenClassrooms ou via le CNB. La spécialisation te sort du lot face aux outils généralistes.',
    ], secteur: 'cognitif-admin-finance-juridique' },

  { slug: 'assistant-administratif', label: 'Assistant administratif', risk: 73, horizon: 5, status: 'danger',
    dynamic: 'Ton métier se contracte. Gestion d\'agendas, priorisation des courriels, préparation de réunions : confiés à des agents virtuels. Le WEF anticipe 19 millions de postes administratifs en moins — anticipe le pivot avant que ça te rattrape.',
    sources: [3, 9], quadrant: 'pivotes', potential: 25, leviers: [
      'Automatise tes tâches récurrentes avec Notion AI ou ChatGPT — Délègue-leur la rédaction de comptes-rendus, résumés de mails et ordres du jour. Montre que tu gères plus avec moins de temps.',
      'Pivote vers office manager ou coordinateur projet — Ces rôles intègrent la gestion opérationnelle, la relation fournisseurs et l\'organisation d\'événements : ils résistent mieux et recrutent.',
      'Identifie ton secteur cible et forme-toi vite — Assistanat RH, assistanat juridique, coordination marketing : chaque spécialisation ajoute une barrière à l\'automatisation. OpenClassrooms et LinkedIn Learning ont des parcours courts financés CPF.',
    ], secteur: 'cognitif-admin-finance-juridique' },

  { slug: 'receptionniste', label: 'Réceptionniste', risk: 80, horizon: 2, status: 'danger',
    dynamic: 'Ton métier se contracte. Filtrage d\'appels, prise de rendez-vous et accueil informationnel sont gérés par des agents 24/7. Le marché qui reste est l\'accueil physique haut de gamme — c\'est là que tu te repositionnes.',
    sources: [3], quadrant: 'pivotes', potential: 25, leviers: [
      'Prends en main le CRM ou le logiciel de gestion de ton structure — Deviens la référente sur l\'outil de planification. Ceux qui maîtrisent le back-office résistent mieux que ceux qui n\'accueillent qu\'en face à face.',
      'Repositionne-toi sur l\'accueil expérientiel haut de gamme — Hôtellerie 4-5 étoiles, cliniques privées, sièges de grands groupes : ces secteurs paient pour la présence humaine différenciante, pas pour la gestion d\'appels.',
      'Pivote vers un rôle adjacent en croissance — Coordinatrice médicale, hôtesse de gestion d\'événements, office manager : des formations courtes sur LinkedIn Learning ou OpenClassrooms t\'y amènent en quelques mois.',
    ], secteur: 'cognitif-admin-finance-juridique' },

  { slug: 'standardiste', label: 'Standardiste', risk: 83, horizon: 2, status: 'danger',
    dynamic: 'Ton métier se contracte fort. La gestion d\'appels entrants et leur routage sont des fonctions natives des PBX cloud modernes. Le poste humain a quasiment disparu des grandes structures — bascule vers un secteur adjacent sans attendre.',
    sources: [3], quadrant: 'pivotes', potential: 15, leviers: [
      'Documente tes connaissances de l\'entreprise avant de partir — Procédures, contacts clés, cas fréquents : transforme ce savoir tacite en base documentaire avec Notion. C\'est ton capital pour négocier ton évolution interne.',
      'Pivote vers un rôle administratif ou coordination — Assistanat polyvalent, gestion de planning, back-office client : ces postes recrutent ton profil relationnel et organisationnel. Vise une spécialisation sectorielle.',
      'Lance-toi sur une formation courte financée CPF — Assistanat de direction, gestion administrative ou secrétariat médical sur OpenClassrooms. Trois mois pour transformer ton profil et ouvrir de nouvelles portes.',
    ], secteur: 'cognitif-admin-finance-juridique' },

  { slug: 'agent-assurance', label: 'Agent d\'assurance', risk: 74, horizon: 5, status: 'danger',
    dynamic: 'Ton métier se contracte. Souscription standardisée, calcul de primes, traitement de sinistres simples : automatisés. Concentre-toi sur les contrats complexes et la relation patrimoniale — c\'est le terrain qui reste humain.',
    sources: [3], quadrant: 'pivotes', potential: 25, leviers: [
      'Utilise Claude pour préparer tes entretiens client — Synthèse du dossier, points de vigilance réglementaires, comparatif contrats : 15 minutes de prep IA remplacent 2 heures de travail manuel. Consacre ce temps à la relation.',
      'Pivote vers les risques complexes et la prévoyance patrimoniale — Assurances professionnelles, risques spéciaux, prévoyance chef d\'entreprise : des segments que les comparateurs en ligne ne savent pas vendre.',
      'Vise une certification spécialisée — Courtage en assurances de personnes ou IARD complexe via le CFPB ou l\'ICS. La spécialisation sur des risques haut de gamme te sort de la compétition avec les bots.',
    ], secteur: 'cognitif-admin-finance-juridique' },

  { slug: 'analyste-financier', label: 'Analyste financier', risk: 57, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute. L\'analyse exhaustive des bilans et flux d\'actualités est exécutée instantanément par l\'IA. Tu te concentres sur la gestion psychologique et relationnelle des clients, plus sur la production des chiffres.',
    sources: [3], quadrant: 'mutes', potential: 70, leviers: [
      'Bascule sur Bloomberg Terminal AI et Claude pour tes synthèses — Lecture de bilans, croisement actu marché, scénarios stress-tests : minutes au lieu d\'heures. Tu signes plus vite, plus de dossiers couverts.',
      'Repositionne-toi sur l\'arbitrage et la relation client — L\'IA produit le chiffre, toi tu vends la conviction d\'investissement, tu désamorces les biais émotionnels du client. C\'est ton jugement qui paie.',
      'Forme-toi à la finance augmentée — DeepLearning.AI Generative AI for Finance + CFA Institute AI in Investment. Différenciateur fort sur les postes senior buy-side et corporate.',
    ], secteur: 'cognitif-admin-finance-juridique' },

  { slug: 'operateur-saisie', label: 'Opérateur de saisie', risk: 91, horizon: 2, status: 'danger',
    dynamic: 'Ton métier se contracte fort. L\'OCR cognitif et les LLM résolvent la lecture de documents et leur saisie avec une précision supérieure. Anticipe le pivot vers la supervision de flux automatisés ou un secteur adjacent qui recrute.',
    sources: [3], quadrant: 'pivotes', potential: 10, leviers: [
      'Teste un outil d\'automatisation documentaire cette semaine — Docsumo, Nanonets ou Adobe Acrobat IA : comprendre le fonctionnement de ce qui te remplace, c\'est la première étape pour le superviser.',
      'Pivote vers la validation de flux automatisés — Les erreurs d\'OCR et les exceptions de traitement exigent une vérification humaine. Ce rôle de contrôle qualité des pipelines IA existe et recrutent.',
      'Forme-toi sur un secteur adjacent avec CPF — Assistanat administratif, facturation, gestion de stocks : des métiers proches qui recrutent encore. OpenClassrooms propose des formations courtes et reconnues.',
    ], secteur: 'cognitif-admin-finance-juridique' },

  { slug: 'secretaire', label: 'Secrétaire', risk: 62, horizon: 5, status: 'danger',
    dynamic: 'Ton métier se contracte. Gestion d\'agendas, courriels, préparation de réunions : confiés à des agents virtuels. Bascule vers une spécialisation (office manager, coordinateur projet) avant que le poste généraliste ne se vide.',
    sources: [3, 9], quadrant: 'pivotes', potential: 25, leviers: [
      'Utilise Notion AI pour documenter les processus de ton équipe — Transforme ton savoir tacite en base de connaissance structurée. Ce travail de capitalisation est visible, valorisable et t\'ouvre la porte de l\'office management.',
      'Prends en main un outil de gestion de projet — Asana, Monday, Notion : ceux qui pilotent les outils de coordination ont un avenir. Tu passes de secrétaire à coordinatrice opérationnelle.',
      'Spécialise-toi dans un secteur à valeur ajoutée — Secrétariat médical, juridique ou comptable : la spécialisation ajoute une barrière à l\'automatisation. Des formations CPF existent sur OpenClassrooms et Pôle emploi.',
    ], secteur: 'cognitif-admin-finance-juridique' },

  { slug: 'caissier', label: 'Caissier', risk: 78, horizon: 5, status: 'danger',
    dynamic: 'Ton métier se contracte. Bornes self-checkout, paiement mobile, scan-and-go : la grande distribution réduit massivement ses effectifs caissiers. Bascule vers des rôles à valeur relationnelle — conseil rayon, gestion stocks, accueil client.',
    sources: [9], quadrant: 'pivotes', potential: 20, leviers: [
      'Demande à monter en compétence sur la gestion des stocks ou le rayon — Ces rôles sont moins menacés et permettent un glissement naturel depuis la caisse. L\'initiative interne est ta meilleure carte.',
      'Pivote vers un rôle client à plus forte valeur — Conseiller de vente, hôte/hôtesse de service client, animateur rayon : ces postes recrutent ton profil relationnel dans la distribution spécialisée et le commerce indépendant.',
      'Cible une reconversion dans la logistique ou la préparation de commandes — Le e-commerce structure une demande croissante. Des certifications courtes (titre pro logisticien) sont accessibles via Pôle emploi ou votre OPCO.',
    ], secteur: 'cognitif-admin-finance-juridique' },

  { slug: 'agent-recouvrement', label: 'Agent de recouvrement', risk: 80, horizon: 2, status: 'danger',
    dynamic: 'Ton métier se contracte. La relance multicanale automatisée et le scoring IA rendent le travail d\'appel humain non rentable. Pivote vers la négociation à l\'amiable sur dossiers complexes — c\'est le seul segment qui résiste.',
    sources: [3], quadrant: 'pivotes', potential: 25, leviers: [
      'Utilise Claude pour préparer tes dossiers de négociation — Synthèse du profil débiteur, historique de paiements, simulation de plans d\'étalement. 10 minutes de prep IA pour une conversation plus efficace.',
      'Repositionne-toi sur les dossiers complexes et les plans amiables — Restructurations de dettes, négociation avec débiteurs pro, médiation : l\'IA ne négocie pas. C\'est ton terrain de résistance.',
      'Pivote vers le conseil en gestion budgétaire ou le droit de la consommation — Des formations courtes via l\'AFPA ou les OPCO existent. Le rôle de conseiller en redressement financier recrute et valorise ton expertise.',
    ], secteur: 'cognitif-admin-finance-juridique' },

  { slug: 'employe-banque', label: 'Employé de banque / Guichetier', risk: 65, horizon: 5, status: 'danger',
    dynamic: 'Ton métier se contracte. La digitalisation et les conseillers virtuels suppriment le guichet physique. Les agences ferment — bascule vers un rôle relationnel senior ou vers la gestion de patrimoine avant que le poste standard disparaisse.',
    sources: [20], quadrant: 'pivotes', potential: 25, leviers: [
      'Prends l\'initiative de maîtriser les outils digitaux de ta banque — Simulateurs, plateformes de conseil en ligne, espaces clients : être la référente interne sur ces outils te positionne pour un glissement vers conseillère.',
      'Pivote vers conseiller de clientèle particuliers ou professionnels — Le guichet ferme, le conseil senior reste. Parle à ton manager de ta progression interne avant que la décision soit prise pour toi.',
      'Prépare une certification AMF ou une spécialisation patrimoine — L\'habilitation AMF et les certifications en gestion de patrimoine (IAB, diplôme CGPC) sont les passeports vers les postes qui recrutent encore. Des formations existent via ton OPCO bancaire.',
    ], secteur: 'cognitif-admin-finance-juridique' },

  { slug: 'specialiste-rp', label: 'Spécialiste relations publiques', risk: 37, horizon: 5, status: 'danger',
    dynamic: 'Ton métier se contracte. Communiqués de presse, ciblage médiatique, veille réputationnelle : délégués à l\'IA. Les effectifs juniors en agence fondent — pivote vers la stratégie relationnelle et la gestion de crise, là où l\'IA ne décide pas.',
    sources: [1], quadrant: 'pivotes', potential: 25, leviers: [
      'Utilise Perplexity et Claude pour ta veille réputationnelle — Automatise le monitoring et la synthèse des mentions presse. Libère 3 à 4 heures par semaine pour la relation journaliste et la stratégie.',
      'Repositionne-toi sur la gestion de crise et le conseil senior — La communication de crise, la réputation de dirigeant et les relations institutionnelles complexes exigent un jugement humain. C\'est là que la valeur reste.',
      'Développe ton réseau en public — Publie tes analyses sur LinkedIn, prends la parole en événements sectoriels. En RP, ta visibilité personnelle est ton meilleur argument commercial. Construis ton personal branding maintenant.',
    ], secteur: 'cognitif-admin-finance-juridique' },

  { slug: 'editeur-reviseur', label: 'Éditeur / Réviseur', risk: 54, horizon: 5, status: 'danger',
    dynamic: 'Ton métier se contracte. Correction, formatage stylistique et synthèse linguistique sont exécutés par l\'IA. Les postes de révision standards reculent — bascule vers l\'édition de fond, la direction littéraire ou la révision de contenu IA.',
    sources: [1], quadrant: 'pivotes', potential: 25, leviers: [
      'Bascule vers la révision de contenus générés par IA — Les entreprises produisent massivement avec Claude ou ChatGPT et cherchent des éditeurs humains pour la validation finale. Propose ce service avant que le marché soit saturé.',
      'Pivote vers la direction éditoriale — Ligne éditoriale, sélection des sujets, cohérence de la voix de marque : l\'IA ne décide pas de la stratégie éditoriale. C\'est le poste qui monte dans les rédactions numériques.',
      'Spécialise-toi sur un secteur réglementé — Édition scientifique, médicale ou juridique : la rigueur factuelle et la responsabilité sectorielle maintiennent une valeur humaine forte. Des formations spécialisées existent via les syndicats professionnels.',
    ], secteur: 'cognitif-admin-finance-juridique' },

  { slug: 'redacteur-technique', label: 'Rédacteur technique', risk: 42, horizon: 5, status: 'danger',
    dynamic: 'Ton métier se contracte. Documentation de code et manuels d\'utilisation sont extraits automatiquement par l\'IA depuis les dépôts source. Pivote vers la documentation stratégique, l\'UX writing ou la formation — là où le contexte humain compte.',
    sources: [3], quadrant: 'pivotes', potential: 25, leviers: [
      'Intègre GitHub Copilot dans ton workflow de documentation — Génère les premières ébauches depuis le code source, toi tu restructures, contextualises et adaptes au lecteur. Gagne du temps, déplace ta valeur vers l\'architecture de l\'information.',
      'Pivote vers l\'UX writing et la documentation produit — Microcopy, messages d\'erreur, onboarding utilisateur : ces rôles sont en croissance dans les équipes produit et recrutent des profils tech + écrit.',
      'Repositionne-toi sur la formation technique interne — Concevoir des parcours d\'apprentissage pour des équipes qui adoptent de nouveaux outils IA : ta double compétence technique + pédagogie a une valeur réelle. Des certifications instructional design existent sur LinkedIn Learning.',
    ], secteur: 'cognitif-admin-finance-juridique' },

  { slug: 'specialiste-dossiers-medicaux', label: 'Spécialiste dossiers médicaux', risk: 67, horizon: 2, status: 'danger',
    dynamic: 'Ton métier se contracte. Compilation, codage administratif des données patients et facturation assurance sont pris en charge par des IA médicales spécialisées. Bascule vers le contrôle qualité ou la conformité réglementaire des flux IA.',
    sources: [3], quadrant: 'pivotes', potential: 25, leviers: [
      'Prends en main les logiciels de gestion documentaire médicale — DxCare, Easily, ou le SIH de ton établissement : les référents outils sont les derniers touchés par les suppressions de postes.',
      'Pivote vers la conformité RGPD et réglementaire des données de santé — Le contrôle des flux IA en santé exige une expertise humaine sur la protection des données patients. C\'est le noyau dur qui résiste.',
      'Forme-toi au DMP et aux systèmes d\'information de santé — Des formations via le CNEH (Centre National de l\'Expertise Hospitalière) ou le CHRU proposent des parcours en informatique médicale. La spécialisation sur les données de santé ouvre des postes stables.',
    ], secteur: 'cognitif-admin-finance-juridique' },

  { slug: 'testeur-qa', label: 'Testeur QA logiciel', risk: 52, horizon: 2, status: 'danger',
    dynamic: 'Ton métier se contracte. Correction de bugs et tests automatisés figurent parmi les tâches les plus exécutées par l\'IA en entreprise. Pivote vers la qualité stratégique, le test d\'expérience et l\'audit de sortie des agents IA.',
    sources: [3], quadrant: 'pivotes', potential: 25, leviers: [
      'Bascule vers le test des sorties d\'agents IA — Les LLM hallucinent, produisent des incohérences et ratent les edge cases. Le rôle de testeur spécialisé sur les outputs IA est nouveau, peu formé et recherché.',
      'Pivote vers la qualité UX et les tests exploratoires — Tests d\'expérience utilisateur, accessibilité, tests de régression sur interfaces complexes : ces types de tests restent difficiles à automatiser entièrement.',
      'Monte en compétence sur l\'automatisation de tests IA — Selenium, Playwright, et les outils de test LLM comme PromptFoo : suis des formations sur LinkedIn Learning ou Udemy. Comprendre l\'outil qui te remplace pour le superviser est ton meilleur levier.',
    ], secteur: 'cognitif-admin-finance-juridique' },

  // ── EN MUTATION SÉVÈRE ────────────────────────────────
  // (le rôle se transforme radicalement, ne disparaît pas)

  { slug: 'developpeur-logiciel', label: 'Développeur logiciel', risk: 55, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier ne disparaît pas. Il devient méconnaissable. L\'IA génère, teste et maintient le code de base. La demande s\'effondre pour les juniors exécutants ; le rôle pivote vers l\'architecture et l\'audit du code généré.',
    sources: [1, 15], quadrant: 'mutes', potential: 85, leviers: [
      'Intègre Cursor ou Claude Code dans ton flux quotidien — Boilerplate, refactoring, génération de tests : 50% de ton output passe par l\'IA. Documente ton gain de vélocité au sprint planning.',
      'Repositionne ta valeur sur la review et l\'architecture — L\'IA produit le code, toi tu fais l\'audit : sécurité, perf, lisibilité, dette technique. C\'est là que se concentre la valeur d\'un dev senior 2026.',
      'Forme-toi aux agents IA et au prompt engineering — Anthropic Academy + DeepLearning.AI Building Systems with ChatGPT API. Ces specs sont déjà sur les job descriptions LinkedIn.',
    ], secteur: 'tech-data-design' },

  { slug: 'programmeur', label: 'Programmeur', risk: 74, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute brutalement. L\'IA pisse des lignes de code à vélocité surhumaine. Tu pivotes ou tu disparais : architecture système, audit de code IA, sécurité. Le "vibe code" génère une dette technique massive - sois celui qui sait la lire.',
    sources: [3], quadrant: 'mutes', potential: 82, leviers: [
      'Adopte Aider ou Continue.dev dans ton éditeur cette semaine — Génère le code répétitif, les tests unitaires et la doc. Mesure et montre tes gains : tu deviens le dev le plus productif de l\'équipe.',
      'Spécialise-toi sur la dette technique du code IA — Le vibe coding inonde les codebases de bugs silencieux. Deviens celui qui audite, relit et sécurise ce que l\'IA a généré : c\'est la valeur rare en 2026.',
      'Forme-toi à la sécurité applicative via GitHub Advanced Security — Snyk et GHAS détectent ce que l\'IA ne voit pas. Une certification OWASP ou Snyk Expert te repositionne sur un axe à forte demande.',
    ], secteur: 'tech-data-design' },

  { slug: 'designer-graphique', label: 'Designer graphique', risk: 58, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute. La génération multimodale réduit le besoin d\'équipes complètes à un directeur artistique assisté de plusieurs agents autonomes. La direction créative survit ; l\'exécution de production se commoditise.',
    sources: [1], quadrant: 'mutes', potential: 65, leviers: [
      'Intègre Adobe Firefly et Midjourney dans ta production cette semaine — Utilise-les pour les déclinaisons, variantes et mockups rapides. Capitalise le temps gagné sur la direction artistique et la créa stratégique.',
      'Repositionne-toi comme directeur artistique IA — Tu ne crées plus chaque pixel, tu pilotes des agents génératifs. Construis un portfolio montrant ta capacité à briefer, itérer et valider des créations IA.',
      'Forme-toi à la direction créative avec Recraft et Magicpattern — Adobe Firefly Certification + tutoriels Recraft. Le marché cherche des designers qui savent tirer parti des outils génératifs, pas les fuir.',
    ], secteur: 'tech-data-design' },

  { slug: 'designer-web', label: 'Designer web / UI', risk: 55, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute. Génération instantanée d\'interfaces par modèles multimodaux : un seul directeur artistique pilote des agents qui produisent les variantes. La maquette à la main n\'est plus monnayable seule.',
    sources: [1], quadrant: 'mutes', potential: 65, leviers: [
      'Utilise Figma AI et v0 by Vercel pour tes maquettes cette semaine — Génère des variantes d\'UI en quelques prompts, itère avec le client en temps réel. Tu passes de dessinateur à arbitre de solutions.',
      'Maîtrise le pont design-code via Figma Make — Les clients veulent des composants prêts à intégrer, pas des Figma statiques. Apprends à livrer du code UI propre depuis tes maquettes : valeur multipliée.',
      'Certifie-toi sur le design system et l\'accessibilité — Les certifications UXQB ou Google UX Design sur Coursera te positionnent sur la rigueur systémique que l\'IA ne peut pas garantir seule.',
    ], secteur: 'tech-data-design' },

  { slug: 'ux-designer', label: 'UX Designer', risk: 45, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute. La recherche utilisateur quantitative, le wireframing et l\'A/B testing sont accélérés par l\'IA. Tu te recentres sur la stratégie produit, l\'ethnographie de terrain et l\'arbitrage business - ou tu deviens un PO-light.',
    sources: [1], quadrant: 'mutes', potential: 70, leviers: [
      'Intègre Uizard ou Galileo AI dans ton process de prototypage — Transforme des croquis en wireframes interactifs en minutes. Présente 3 concepts là où tu en présentais un : le client choisit, tu arbitres.',
      'Repositionne-toi sur la recherche qualitative et l\'éthique UX — L\'IA produit des interfaces, pas de l\'empathie terrain. Tes entretiens utilisateurs, analyses comportementales et tests d\'accessibilité sont irremplaçables.',
      'Complète la Google UX Design Professional Certificate ou Nielsen Norman UX — Ces certifications sont reconnues internationalement. Couple-les avec un post LinkedIn sur un cas concret : ça construit ta réputation publique.',
    ], secteur: 'tech-data-design' },

  { slug: 'data-scientist', label: 'Data Scientist', risk: 37, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute. Paradoxalement, les créateurs des modèles voient le nettoyage des données, la sélection de variables et l\'optimisation hyperparamètres s\'automatiser (AutoML). Le rôle glisse vers l\'ingénierie MLOps et l\'alignement éthique.',
    sources: [3], quadrant: 'mutes', potential: 80, leviers: [
      'Bascule vers du Python augmenté Cursor + Claude — Notebooks Hex AI ou DataIku, génération de pipelines SQL automatisée, AutoML pour le baseline. Tu te concentres sur le sense-making.',
      'Repositionne-toi sur l\'évaluation et l\'éthique des modèles — Le marché ne paie plus le notebook, il paie celui qui sait quand et pourquoi un modèle hallucine. Audits éthiques, fairness, biais.',
      'Forme-toi aux LLM et MLOps — DeepLearning.AI MLOps Specialization + Anthropic Academy. Le data scientist 2026 sait industrialiser, pas juste explorer.',
    ], secteur: 'tech-data-design' },

  { slug: 'commercial', label: 'Commercial B2B', risk: 63, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute. Prospection à froid, e-mails personnalisés et démonstrations préliminaires sont délégués à des agents IA. Tu deviens négociateur final de contrats complexes et gardien de la relation senior.',
    sources: [3], quadrant: 'mutes', potential: 70, leviers: [
      'Automatise ta prospection avec Apollo.io AI et Outreach AI — Séquences personnalisées, scoring de leads, relances : l\'IA gère le volume. Toi tu closes les deals que personne d\'autre ne peut signer.',
      'Repositionne-toi sur la négociation complexe et la relation stratégique — L\'IA prospecte, toi tu construis la confiance long terme. Tes comptes stratégiques ne veulent pas parler à un bot : ils veulent toi.',
      'Certifie-toi Salesforce Einstein ou Gong et documente tes wins IA sur LinkedIn — Signal fort pour ton équipe et ton marché : tu pilotes les outils, tu n\'es pas remplacé par eux.',
    ], secteur: 'marketing-comm-management' },

  { slug: 'recruteur', label: 'Recruteur', risk: 58, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute. Sourcing, screening de CV et premier contact sont automatisés. Tu te recentres sur l\'évaluation comportementale, la marque employeur et le closing - l\'humain où l\'humain compte.',
    sources: [12], quadrant: 'mutes', potential: 65, leviers: [
      'Automatise sourcing et screening avec hireEZ ou Eightfold AI — Tri de CV, premiers contacts personnalisés, scoring de fit : 70% du flux passe par l\'IA. Tu te concentres sur l\'évaluation comportementale.',
      'Repositionne-toi sur la marque employeur et le closing — L\'IA fait remonter les profils ; toi tu construis la promesse, tu désamorces les frictions, tu signes les top talents.',
      'Forme-toi à l\'évaluation des biais des outils IA RH — LinkedIn Learning AI Recruiting + AlgorithmWatch HR. Compétence rare et bientôt obligatoire (AI Act).',
    ], secteur: 'marketing-comm-management' },

  { slug: 'responsable-rh', label: 'Responsable RH', risk: 50, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute. Reporting RH, paie standardisée, gestion administrative : automatisés. Le rôle pivote vers le développement humain, la culture d\'entreprise et la gestion du changement induit par l\'IA elle-même.',
    sources: [12], quadrant: 'mutes', potential: 60, leviers: [
      'Intègre Workday AI ou BambooHR AI pour automatiser reporting et onboarding — Tableaux de bord temps réel, alertes de désengagement, suggestions de formation : tu pilotes les données, tu ne les collectes plus manuellement.',
      'Repositionne-toi sur la gestion du changement IA — Ton entreprise déploie de l\'IA et les collaborateurs ont peur. Toi tu deviens le pont entre direction et terrain : animation d\'ateliers, détection des résistances, plan d\'accompagnement.',
      'Obtiens une certification SHRM ou People Analytics (Coursera/Wharton) — Le RH augmenté par les données est la compétence la plus recherchée en 2026. Un badge visible sur LinkedIn suffit à changer tes opportunités.',
    ], secteur: 'marketing-comm-management' },

  { slug: 'conseiller-financier', label: 'Conseiller financier', risk: 48, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute. Allocation d\'actifs standardisée et plans patrimoniaux types sont gérés par robo-advisors. Tu te concentres sur la gestion psychologique des clients face aux marchés et les cas patrimoniaux complexes.',
    sources: [7], quadrant: 'mutes', potential: 70, leviers: [
      'Intègre Salesforce Einstein ou un outil CRM IA pour anticiper les besoins clients — Signaux d\'alerte sur les portefeuilles, moments de vie détectés, segmentation automatique : tu consacres 100% de ton temps aux conversations qui comptent.',
      'Repositionne-toi sur l\'ingénierie patrimoniale complexe et la gestion comportementale — Les robo-advisors ne gèrent pas la panique d\'un client en krach ni la succession d\'un chef d\'entreprise. C\'est ton terrain exclusif.',
      'Certifie-toi CFP ou monte sur la planification successorale et l\'immobilier complexe — Coursera AI for Finance + certification CGPC : le signal que tu n\'es pas un conseiller généraliste remplaçable.',
    ], secteur: 'marketing-comm-management' },

  { slug: 'architecte-logiciel', label: 'Architecte logiciel', risk: 35, horizon: 10, status: 'mutation',
    dynamic: 'Ton métier mute en valeur. L\'IA produit du code à vélocité industrielle, mais elle hallucine, casse des dépendances et introduit des failles. Toi qui sais lire et auditer l\'architecture, tu deviens hautement valorisable.',
    sources: [16], quadrant: 'mutes', potential: 80, leviers: [
      'Utilise Claude Code pour auditer l\'architecture des codebases générés par IA — Analyse la cohérence des dépendances, détecte les anti-patterns, produis un rapport de dette technique actionnable en une session.',
      'Capitalise ta valeur sur la gouvernance du code IA — Pose les standards de review : quelles décisions architecturales l\'IA ne peut pas prendre seule. Deviens la référence que les équipes consultent avant de merger.',
      'Documente et publie tes patterns d\'architecture agentic — Blog technique ou GitHub public : LangChain, LlamaIndex, patterns RAG que tu as mis en prod. Ta visibilité externe monte avant les autres.',
    ], secteur: 'tech-data-design' },

  { slug: 'community-manager', label: 'Community Manager', risk: 55, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute. Création de posts, programmation, modération basique et reporting : délégués à l\'IA. Tu te concentres sur la stratégie éditoriale, la gestion de crise et l\'animation authentique de communauté.',
    sources: [9], quadrant: 'mutes', potential: 65, leviers: [
      'Génère programmation et copies avec ChatGPT + Brandwatch — Routinier 80% sur les visuels et légendes ; tu te libères pour la stratégie. Sprinklr AI suit l\'engagement automatiquement.',
      'Repositionne-toi sur la stratégie éditoriale et la gestion de crise — L\'IA produit, toi tu décides quel ton, quand, sur quel angle. Ton arbitrage humain devient le différenciateur.',
      'Certifie-toi HubSpot AI Marketing ou complète DeepLearning.AI Generative AI for Everyone — Différenciateur sur LinkedIn et signe que tu pilotes les outils, pas l\'inverse.',
    ], secteur: 'marketing-comm-management' },

  { slug: 'expert-comptable', label: 'Expert-comptable', risk: 55, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute. Tenue de comptes et déclarations standardisées sont automatisées. Tu pivotes vers le conseil fiscal stratégique, l\'optimisation patrimoniale et l\'accompagnement des dirigeants - ou tu te fais commoditiser.',
    sources: [7], quadrant: 'mutes', potential: 70, leviers: [
      'Déploie Pennylane ou Dext dans ta pratique — Automatise la saisie et les rapprochements pour tous tes dossiers standardisés. Libère 30% de ton temps, réoriente-le vers le conseil à haute valeur.',
      'Deviens l\'expert-conseil IA de tes clients — Tes clients dirigeants ne comprennent pas ce que l\'IA change à leur gestion. Toi tu sais. Organise une demi-journée de conseil IA par client : c\'est une nouvelle ligne de facturation.',
      'Intègre le DU Fiscalité numérique ou une certification en finance augmentée — Des modules courts existent via le CSOEC (Conseil supérieur de l\'ordre) ou Sciences Po Executive. L\'IA fiscale (Taxdome, Sage IA) devient une compétence différenciante.',
    ], secteur: 'cognitif-admin-finance-juridique' },

  { slug: 'consultant-strategie', label: 'Consultant en stratégie', risk: 42, horizon: 10, status: 'mutation',
    dynamic: 'Ton métier mute. Benchmarks, études de marché et synthèses sont produits en heures par l\'IA. Tu vends désormais le jugement, la confrontation au CEO et l\'exécution - pas le slide pack.',
    sources: [4], quadrant: 'mutes', potential: 75, leviers: [
      'Utilise Claude ou les outils McKinsey IDA / BCG GenAI pour tes phases de research — Synthèse de rapports sectoriels, analyse de données brutes, revue de littérature : ce qui prenait 3 jours prend 3 heures. Tu vends ton jugement, pas tes heures de doc.',
      'Repositionne ta valeur sur l\'exécution et la confrontation dirigeante — Le slide pack ne suffit plus. Tes clients paient pour que tu contestes leurs hypothèses, arbitres les options et restes dans la salle pendant l\'implémentation.',
      'Publie des prises de position sectorielles sur LinkedIn ou en thought leadership — 2-3 articles de fond par trimestre sur ta niche stratégique. C\'est ton différenciateur face aux concurrents qui utilisent les mêmes IA que toi.',
    ], secteur: 'marketing-comm-management' },

  { slug: 'product-manager', label: 'Product Manager', risk: 38, horizon: 10, status: 'mutation',
    dynamic: 'Ton métier mute. Specs, user stories et roadmaps brouillons sont générés par l\'IA. Tu te concentres sur la priorisation arbitrage, l\'alignement stakeholders et la vision produit - la partie irréductiblement politique du métier.',
    sources: [10], quadrant: 'mutes', potential: 75, leviers: [
      'Utilise Linear ou Notion AI pour générer tes user stories et PRD — Première version d\'une spec complète en 20 minutes. Tu passes ton temps à prioriser et à challenger les hypothèses, pas à rédiger.',
      'Repositionne ta valeur sur la vision produit et l\'arbitrage politique — L\'IA génère 10 roadmaps possibles ; toi tu sais laquelle choisir et comment convaincre le CODIR. C\'est ton territoire, pas le sien.',
      'Complète Reforge AI for Product ou le cours PM IA de Coursera et partage ta perspective en public — Les PM qui comprennent comment intégrer des features IA dans leur produit sont 2x plus employables que les autres.',
    ], secteur: 'marketing-comm-management' },

  { slug: 'journaliste-presse', label: 'Journaliste presse écrite', risk: 35, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute. Collecte d\'informations basiques, synthèse de rapports financiers, dépêches sportives : entièrement automatisées. L\'investigation complexe sur le terrain devient la seule véritable valeur ajoutée humaine.',
    sources: [1], quadrant: 'mutes', potential: 60, leviers: [
      'Utilise Claude pour le boulot préparatoire — Synthèse de rapports, recherche d\'archives Lexisnexis, traduction d\'articles étrangers. Tu gardes le terrain et l\'angle, l\'IA te fait gagner 4h par enquête.',
      'Repositionne ta valeur sur l\'investigation et l\'opinion — Les dépêches sportives et financières sont automatisées. Tu vends la signature, le terrain, le sourcing humain qu\'aucun LLM ne peut produire.',
      'Documente publiquement comment tu intègres l\'IA — Newsletter ou blog perso sur ta workflow IA. Les rédacteurs en chef de 2026 cherchent les journalistes qui savent piloter ces outils.',
    ], secteur: 'marketing-comm-management' },

  { slug: 'journaliste-tv', label: 'Journaliste TV / Radio', risk: 40, horizon: 10, status: 'mutation',
    dynamic: 'Ton métier mute. Présentation automatisée, voix synthétique, montage IA : la production technique se commoditise. La présence incarnée, le terrain et l\'enquête prolongée restent humains - pour combien de temps.',
    sources: [1], quadrant: 'mutes', potential: 55, leviers: [
      'Intègre Otter ou Whisper pour transcrire et analyser tes interviews terrain — Transcription instantanée, détection des citations clés, résumé automatique. Tu passes plus de temps à creuser les angles qu\'à taper.',
      'Repositionne-toi sur la présence terrain et les formats documentaires longs — Les JT de 20h sont sous pression IA. Les formats d\'enquête longue, le grand entretien, le documentaire terrain : c\'est là que la présence humaine crée une valeur irremplaçable.',
      'Documente ta maîtrise des outils IA journalistiques — Module ESJ Lille IA ou formations IJBA, publié sur ton profil. Les rédactions qui intègrent l\'IA cherchent des journalistes qui savent la piloter sans en avoir peur.',
    ], secteur: 'marketing-comm-management' },

  { slug: 'analyste-renseignement', label: 'Analyste renseignement', risk: 64, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute. Traitement de signaux multiples, reconnaissance de formes dans le bruit informationnel et notes de synthèse sont augmentés par l\'IA. Tu deviens évaluateur critique de la véracité des sources générées.',
    sources: [6], quadrant: 'mutes', potential: 70, leviers: [
      'Intègre Maltego + Hunchly AI dans ton workflow OSINT — Cartographie des réseaux, croisement de sources ouvertes, détection automatique de patterns : l\'IA fait le volume, toi tu interprètes et tu valides.',
      'Repositionne-toi sur l\'évaluation critique et la contre-désinformation IA — Les LLM hallucinent et les deepfakes prolifèrent. Ta valeur est de distinguer le vrai du fabriqué là où les algorithmes échouent encore.',
      'Monte en compétences sur la threat intelligence IA et affiche-le en interne — Formation Recorded Future Academy ou SANS OSINT. Le renseignement augmenté par IA est une spécialité rare qui ne se dévalue pas.',
    ], secteur: 'marketing-comm-management' },

  { slug: 'economiste', label: 'Économiste', risk: 63, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute. La modélisation macroéconomique et l\'analyse de vastes ensembles de données comportementales sont assistées par l\'IA. Les assistants de recherche disparaissent au profit de directeurs ultra-productifs.',
    sources: [6], quadrant: 'mutes', potential: 70, leviers: [
      'Intègre Claude ou ChatGPT Code Interpreter dans tes analyses quantitatives — Génération de code Python, exploration de datasets, premiers graphiques : tu réduis le cycle de recherche de 60% et tu te concentres sur l\'interprétation causale.',
      'Repositionne-toi sur la modélisation causale et le conseil aux décideurs — Les LLM font de la corrélation ; toi tu fais de la causalité. Ton expertise de terrain et ton jugement sur les dynamiques humaines ne s\'automatisent pas.',
      'Publie sur les biais et limites de l\'IA en économie — Article académique, billet d\'opinion ou intervention conférence : positionnement de référent sur ce que l\'IA ne peut pas modéliser. Rare et très visible.',
    ], secteur: 'marketing-comm-management' },

  { slug: 'analyste-securite', label: 'Analyste sécurité informatique', risk: 63, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute. Audits de code de base, vulnérabilités connues, tests d\'intrusion standards : automatisés. L\'expertise humaine reste vitale pour anticiper l\'ingénierie sociale et les attaques générées par des IA adverses.',
    sources: [3], quadrant: 'mutes', potential: 75, leviers: [
      'Intègre Snyk et GitHub Advanced Security dans tes workflows d\'audit — Automatise la détection de CVE connues, libère du temps pour les vecteurs d\'attaque IA adverses que les outils ne voient pas encore.',
      'Repositionne-toi sur la threat intelligence IA — Les attaques LLM (prompt injection, jailbreak en prod, data poisoning) sont ton nouveau terrain. Construis une veille et partage-la en interne : tu deviens la référence.',
      'Certifie-toi CEH ou OSCP et monte en compétences sur Wiz ou Lacework — Ces certifications + outils cloud security IA sont les signaux les plus forts sur le marché. Le combo est rare et très recherché.',
    ], secteur: 'tech-data-design' },

  { slug: 'ingenieur-automobile', label: 'Ingénieur automobile', risk: 62, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute. Conception itérative de pièces, optimisation aérodynamique, simulations de résistance : accélérées par le design génératif. Tu te concentres sur l\'intégration systémique et l\'innovation conceptuelle.',
    sources: [6], quadrant: 'mutes', potential: 65, leviers: [
      'Pilote Catia AI ou Autodesk Generative Design sur tes cycles d\'optimisation de pièces — Topologie, aérodynamique, résistance aux chocs : l\'IA génère les variants, tu valides la conformité réglementaire et l\'industrialisation.',
      'Repositionne-toi sur l\'architecture des systèmes embarqués et la validation ADAS — Software-defined vehicle, ADAS niveau 3-4, homologation : c\'est le terrain où ta signature d\'ingénieur est irremplaçable par les algorithmes.',
      'Forme-toi aux jumeaux numériques + Industrial AI — Coursera Industrial AI MIT ou Siemens Digital Industries Academy. Le profil ingé auto x IA est sous-représenté chez Stellantis, Renault et les équipementiers Tier 1.',
    ], secteur: 'sciences-ingenierie' },

  { slug: 'ingenieur-industriel', label: 'Ingénieur industriel', risk: 45, horizon: 10, status: 'mutation',
    dynamic: 'Ton métier mute. Optimisation de chaînes, dimensionnement et planification de production sont accélérés par l\'IA. Tu deviens l\'orchestrateur entre systèmes IA et terrain humain - ou tu te fais déclasser.',
    sources: [7], quadrant: 'mutes', potential: 65, leviers: [
      'Intègre AspenTech AI ou Palantir Foundry dans l\'optimisation de ta ligne de production — Scheduling, OEE, détection d\'anomalies : l\'IA couvre le monitoring continu, toi tu arbitres les décisions de capacité et de capex.',
      'Repositionne-toi sur la transformation lean x IA — Les projets d\'automatisation industrielle ont besoin d\'ingénieurs capables de traduire les données machines en décisions opérationnelles. C\'est le pivot le plus rentable de ta carrière.',
      'Certifie-toi AspenTech University ou AWS for Industrial ML — Ces certifications sectorielles sont rares et très valorisées dans l\'industrie manufacturière et la pétrochimie. Ajoute un cas d\'usage chiffré sur LinkedIn.',
    ], secteur: 'sciences-ingenierie' },

  { slug: 'architecte-bdd', label: 'Architecte de bases de données', risk: 46, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute. Structuration, optimisation et migration des données sont gérées de manière autonome par des algorithmes apprenants. Le métier s\'oriente vers la gouvernance éthique et la sécurité des données massives.',
    sources: [6], quadrant: 'mutes', potential: 65, leviers: [
      'Utilise Cursor ou Claude pour générer et optimiser tes requêtes SQL complexes — Génération de migrations, index, requêtes analytiques : tu passes de rédacteur à validateur. Libère du temps pour la gouvernance.',
      'Repositionne-toi sur la gouvernance des données et le data mesh — RGPD, lineage, qualité des données d\'entraînement IA : c\'est là que se concentre la responsabilité que les algorithmes ne peuvent pas assumer.',
      'Intègre dbt + AI dans ton stack et vise une certification Snowflake ou Databricks — Ces outils et certifications sont les nouveaux standards du marché data. Un post technique LinkedIn sur ton architecture suffit à construire ta réputation.',
    ], secteur: 'tech-data-design' },

  { slug: 'support-informatique', label: 'Support informatique (Helpdesk)', risk: 47, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute. Le dépannage de niveau 1 et 2 est pris en charge par des agents internes capables de lire les logs, diagnostiquer les pannes et guider les utilisateurs interactivement. Tu remontes en complexité ou tu disparais.',
    sources: [3], quadrant: 'mutes', potential: 60, leviers: [
      'Deviens l\'expert qui configure et pilote les agents de support IA — Datadog AI ou PagerDuty AI Ops traitent le niveau 1. Toi tu les paramètres, tu gères les exceptions et les cas que l\'agent ne sait pas résoudre.',
      'Capitalise le savoir tacite de l\'équipe dans une base de connaissance IA — Documente les résolutions complexes, crée des playbooks. Tu deviens irremplaçable parce que tu as construit la mémoire de l\'équipe.',
      'Prépare une certification ITIL 4 ou CompTIA A+ Cloud — Ces certifications + expérience pratique des outils IA te repositionnent vers un rôle SRE ou admin système, hors de portée de l\'automatisation à court terme.',
    ], secteur: 'tech-data-design' },

  { slug: 'chef-de-projet-it', label: 'Chef de projet IT', risk: 54, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute. Suivi de Jira, comptes rendus, planification : automatisés. Tu te concentres sur la gestion humaine des équipes, l\'arbitrage de scope et la communication exécutive - la partie politique du rôle.',
    sources: [9], quadrant: 'mutes', potential: 70, leviers: [
      'Automatise le reporting projet avec Claude + Jira API — Génère les comptes rendus, status reports et synthèses de sprint automatiquement. Tu libères 30% de ton temps pour la gestion humaine et l\'arbitrage.',
      'Repositionne-toi comme chef de projet des déploiements IA — Chaque entreprise déploie des outils IA et cherche quelqu\'un pour piloter ces projets spécifiques. Tu as l\'expérience IT, il te manque juste le vocabulaire IA.',
      'Prépare la certification PMP ou AgilePM complétée d\'un module IA — PMP reste la référence. Combine avec le cours DeepLearning.AI ChatGPT Prompt Engineering for Developers pour te différencier sur les projets tech IA.',
    ], secteur: 'tech-data-design' },

  { slug: 'directeur-marketing', label: 'Directeur marketing', risk: 35, horizon: 10, status: 'mutation',
    dynamic: 'Ton métier mute. Campagnes, copies, analytics, segmentation : tout est accéléré 10x par l\'IA. Tu pilotes désormais une équipe réduite suralimentée par des agents - ou tu deviens le bottleneck que tu refusais d\'être.',
    sources: [9], quadrant: 'mutes', potential: 70, leviers: [
      'Déploie HubSpot AI ou Marketo Engage AI pour automatiser tes campagnes — Segmentation dynamique, personnalisation à l\'échelle, A/B testing automatique. Tu réduis une équipe de 5 à 2 personnes sans perdre en volume.',
      'Repositionne ta direction sur la stratégie de marque et l\'allocation budgétaire — L\'IA optimise les canaux ; toi tu décides l\'histoire qu\'on raconte, à qui, et combien ça vaut. C\'est là que le directeur gagne ou perd sa légitimité.',
      'Obtiens la certification Reforge AI Strategy et publie ta vision du marketing IA — Conférence interne, article de fond, intervention client : le directeur marketing qui comprend l\'IA devient conseiller stratégique, pas juste gestionnaire de budget.',
    ], secteur: 'marketing-comm-management' },

  { slug: 'pharmacien', label: 'Pharmacien', risk: 42, horizon: 10, status: 'mutation',
    dynamic: 'Ton métier mute. Vérification d\'ordonnances et conseil basique sont assistés par IA en officine. Le rôle pivote vers l\'éducation thérapeutique, le suivi de patients chroniques et la pharmacovigilance.',
    sources: [21], quadrant: 'mutes', potential: 60, leviers: [
      'Intègre ChatGPT ou Claude pour les interactions médicamenteuses complexes — Vérifie les polymédications des patients chroniques en secondes, génère des fiches patient claires. Tu libères du temps pour le conseil à haute valeur.',
      'Repositionne-toi sur l\'éducation thérapeutique et la pharmacovigilance — Les outils IA (Vigibase, FAERS augmenté, Pyxima AI) gèrent le routinier. Toi tu accompagnes le patient chronique, tu détectes les signaux de pharmacovigilance terrain que l\'algorithme rate.',
      'Forme-toi aux outils officine IA et signale ta montée en compétence — Modules DPC IA santé + Pharmagest IA : documente tes cas d\'usage, prends la parole dans ton réseau groupement. Premier pharmacien référent IA = avantage concurrentiel durable.',
    ], secteur: 'sante-care-education' },

  { slug: 'radiologue', label: 'Radiologue', risk: 48, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute. L\'IA détecte des anomalies sur imagerie médicale avec une sensibilité comparable ou supérieure à l\'humain. Tu deviens validateur expert, garant éthique des décisions et référent en cas complexes.',
    sources: [21], quadrant: 'mutes', potential: 80, leviers: [
      'Intègre Aidoc ou Gleamer dans ton workflow quotidien — Triage IA des urgences (AVC, embolie, fractures), détection automatique des anomalies prioritaires. Tu valides et signes ; ta charge cognitive se concentre sur les cas complexes.',
      'Repositionne-toi comme référent radio-IA dans ton établissement — Sélectionne, audite et valide les solutions IA déployées (Lunit mammographie, Subtle Medical IRM). Le médecin qui comprend les limites des algorithmes devient irremplaçable.',
      'Publie ta pratique IA dans une revue ou une conférence SFR — Retour d\'expérience sur un outil, analyse de faux-positifs IA sur ta spécialité. Signal externe fort qui construit ton autorité avant que la compétence soit banalisée.',
    ], secteur: 'sante-care-education' },

  { slug: 'politologue', label: 'Politologue / Chercheur social', risk: 40, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute. Revue de littérature, traitement de sondages à grande échelle et analyse sémantique des discours sont effectués en secondes par l\'IA. Les équipes de recherche se réduisent drastiquement.',
    sources: [3], quadrant: 'mutes', potential: 60, leviers: [
      'Intègre Claude pour ta revue de littérature et l\'analyse de corpus — Résumé de 200 articles en 30 minutes, extraction de concepts clés, comparaison de discours politiques. Tu passes ton temps sur l\'interprétation, pas la collecte.',
      'Repositionne-toi sur l\'expertise publique et le conseil aux décideurs — Les think tanks et gouvernements ont besoin d\'humains qui comprennent les dynamiques de pouvoir que les algorithmes ne peuvent pas modéliser. Développe tes relations institutionnelles.',
      'Publie des analyses sur les biais algorithmiques en politique — Veille sur Cambridge Analytica 2.0, manipulation IA des élections, fake news générés. C\'est le sujet le plus recherché par les médias et les financeurs de recherche.',
    ], secteur: 'marketing-comm-management' },

  { slug: 'statisticien', label: 'Statisticien', risk: 65, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute. Analyse standardisée, modèles de régression et extrapolations sont absorbées par des agents nativement intégrés aux plateformes d\'entreprise. Tu pivotes vers la modélisation causale fine et la rigueur scientifique.',
    sources: [6], quadrant: 'mutes', potential: 70, leviers: [
      'Intègre Posit Cloud (RStudio) avec GitHub Copilot pour tes analyses — Génère le code R ou Python des modèles standards, recentre ton énergie sur l\'interprétation causale et la validité des hypothèses.',
      'Repositionne-toi sur l\'inférence causale et l\'évaluation des modèles IA — La régression, tout le monde la fait. L\'analyse d\'erreur systématique, le biais de sélection et la causalité : c\'est ta valeur différenciante face aux AutoML.',
      'Publie tes analyses sur Posit Connect ou un blog public — Une analyse mensuelle bien documentée te positionne comme référence. Complète avec la Hugging Face Learn statistics for ML track pour signaler la montée en compétence.',
    ], secteur: 'tech-data-design' },

  // ── PROTÉGÉ ────────────────────────────────────────────
  // (peu menacé, valeur humaine non substituable)

  { slug: 'cardiologue', label: 'Cardiologue', risk: 1, horizon: 10, status: 'protege',
    dynamic: 'L\'IA ne te remplace pas - elle a besoin de toi. Elle augmente la précision diagnostique sur imagerie, mais responsabilité légale, empathie face au diagnostic vital et intervention physique de précision te maintiennent au centre du soin.',
    sources: [6], quadrant: 'pilotes', potential: 80, leviers: [
      'Intègre Aidoc ou Heuro à ta lecture d\'imagerie — Détection assistée d\'AVC et embolies pulmonaires en secondes. Tu valides, tu signes ; le triage devient instantané.',
      'Construis ton agent perso de revue de cas — Claude Projects avec tes protocoles + ESC guidelines. Tu prépares les RCP en quart du temps habituel.',
      'Documente publiquement ton workflow IA — Article ou conférence SFC sur l\'intégration sécurisée. Ton rayonnement de référent IA-cardio monte avant les autres spécialistes.',
    ], secteur: 'sante-care-education' },

  { slug: 'medecin-generaliste', label: 'Médecin généraliste', risk: 8, horizon: 10, status: 'protege',
    dynamic: 'L\'IA ne te remplace pas - elle augmente ta capacité. Diagnostic différentiel, suivi de patients, écoute, orientation : la combinaison technique + relationnelle reste fondamentalement humaine. La pénurie démographique te rend irremplaçable.',
    sources: [6, 21], quadrant: 'pilotes', potential: 75, leviers: [
      'Active DAX Copilot ou Abridge pour tes comptes rendus dictés — 30% de temps admin récupéré sur la dictée et la saisie. Tu le réinvestis en consultation, pas devant l\'écran.',
      'Utilise Glass.health ou Open Evidence pour le diagnostic différentiel difficile — Requête clinique complexe en secondes, littérature récente intégrée. Tu restes le décideur, l\'IA structure les hypothèses.',
      'Prends la parole sur l\'IA en médecine de ville — Blog, podcast santé ou DPC IA : médecin généraliste qui explique comment utiliser l\'IA avec éthique devient référent. Rare, visible, recherché par les institutions.',
    ], secteur: 'sante-care-education' },

  { slug: 'chirurgien', label: 'Chirurgien', risk: 4, horizon: 10, status: 'protege',
    dynamic: 'L\'IA ne te remplace pas - elle assiste. La motricité fine, la décision en temps réel face à l\'imprévu chirurgical et la responsabilité vitale immédiate restent hors de portée des systèmes autonomes.',
    sources: [21], quadrant: 'tiens', potential: 40, leviers: [
      'Explore les systèmes d\'assistance robotique (Da Vinci, Mako) comme levier de précision — Formation constructeur + retour d\'expérience clinique documenté. Tu deviens l\'expert du combo chirurgie-IA dans ton établissement.',
      'Utilise Claude ou ChatGPT pour préparer tes présentations de cas et synthèses — Revue bibliographique, préparation de RCP, rédaction de protocoles : économise 2h par semaine sur l\'admin, réinvestis en bloc.',
      'Publie des retours d\'expérience sur l\'assistance robotique — Congrès spécialisés (SFCD, SOFCOT selon spé). Le chirurgien qui documente les limites des robots est celui qui oriente les protocoles de demain.',
    ], secteur: 'sante-care-education' },

  { slug: 'psychologue', label: 'Psychologue / Thérapeute', risk: 1, horizon: 10, status: 'protege',
    dynamic: 'L\'IA ne te remplace pas - elle a besoin de toi. Empathie authentique, signaux non verbaux subtils, transfert psychologique et soutien émotionnel humain résistent à la modélisation. La confiance humaine est l\'essence du service.',
    sources: [6], quadrant: 'tiens', potential: 30, leviers: [
      'Utilise ChatGPT pour tes notes de séance et synthèses (avec consentement patient) — Rédige un compte rendu structuré en 2 minutes post-séance. Tu passes plus de temps en présence, moins en paperasse.',
      'Recommande des apps de suivi inter-séances adaptées — Daylio, Reflectly ou journaux guidés IA pour maintenir l\'alliance thérapeutique entre rendez-vous. Tu restes l\'ancrage humain, l\'outil comble les trous.',
      'Prends position publique sur les limites des chatbots thérapeutiques — Article, podcast psy ou intervention en formation. Le psychologue qui explique pourquoi Woebot ne remplace pas la thérapie devient voix de référence institutionnelle.',
    ], secteur: 'sante-care-education' },

  { slug: 'psychiatre', label: 'Psychiatre', risk: 3, horizon: 10, status: 'protege',
    dynamic: 'L\'IA ne te remplace pas. Le jugement clinique sur l\'urgence suicidaire, la responsabilité de prescription et la relation thérapeutique restent humains. L\'IA t\'assiste sur l\'historique et la pharmacovigilance.',
    sources: [21], quadrant: 'pilotes', potential: 65, leviers: [
      'Intègre Claude pour tes synthèses cliniques et revues de dossier — Résumé de l\'historique patient avant consultation, extraction des interactions médicamenteuses, recherche DSM-5 augmentée. Tu concentres ta présence sur ce qui compte.',
      'Utilise les apps de suivi IA (Wysa, Woebot) comme outils tiers entre tes séances — Propose-les à des patients stables pour maintenir l\'engagement et remonter des signaux. Toi tu prends les décisions cliniques, l\'outil détecte les tendances.',
      'Publie sur l\'éthique de l\'IA en psychiatrie — Congrès AEP ou article AFP : quel rôle pour les chatbots en santé mentale ? Le psychiatre qui cadre le débat éthique devient référent incontournable pour les institutions et les médias.',
    ], secteur: 'sante-care-education' },

  { slug: 'enseignant', label: 'Enseignant en sciences sociales', risk: 1, horizon: 10, status: 'protege',
    dynamic: 'L\'IA ne te remplace pas - elle ouvre l\'accès à l\'information. Mais mentorat, encouragement, modération de débats et rôle de modèle social exigent ta présence. L\'autorité pédagogique se construit en présentiel.',
    sources: [6], quadrant: 'pilotes', potential: 60, leviers: [
      'Utilise ChatGPT ou Magic School AI pour préparer tes séquences et documents — Génère des études de cas, scénarios de débat, fiches de synthèse en 10 minutes. Tu consacres ton énergie à l\'animation en classe, pas à la production de supports.',
      'Repositionne-toi sur l\'éducation à l\'IA et l\'esprit critique — Les élèves utilisent déjà l\'IA. Apprends-leur à vérifier les sources, détecter les biais algorithmiques, comprendre les enjeux sociaux de l\'automatisation. C\'est ta valeur ajoutée unique.',
      'Forme-toi via INSPÉ ou les ressources Eduscol IA — DeepLearning.AI Generative AI for Educators + ressources nationales. Premier prof de ta matière à documenter des pratiques IA pédagogiques = profil recherché pour les formations et les postes de référent.',
    ], secteur: 'sante-care-education' },

  { slug: 'professeur-universitaire', label: 'Professeur universitaire', risk: 12, horizon: 10, status: 'protege',
    dynamic: 'L\'IA t\'assiste sur la production de matériel pédagogique et la correction. Mais le jury, la direction de thèse, le mentorat doctoral et la production de savoir original restent fondamentalement humains.',
    sources: [21], quadrant: 'pilotes', potential: 70, leviers: [
      'Intègre Elicit ou Consensus dans ta veille bibliographique — Synthèse de 100 articles en 20 minutes, extraction de contradictions entre études. Tu passes ton temps sur l\'interprétation et les hypothèses nouvelles, pas la collecte.',
      'Utilise Claude Projects pour structurer tes cours et diriger tes doctorants — Base de connaissances de ta discipline, feedback automatique sur les premières versions de thèse. Ta charge mentale baisse, ta disponibilité intellectuelle monte.',
      'Publie sur les enjeux de l\'IA en recherche et en pédagogie universitaire — Revue de l\'enseignement supérieur ou conférence AIPU. Le prof universitaire qui cadre l\'éthique IA dans l\'académique est cité, invité, financé.',
    ], secteur: 'sante-care-education' },

  { slug: 'avocat', label: 'Avocat', risk: 22, horizon: 10, status: 'protege',
    dynamic: 'L\'IA t\'assiste : revue contractuelle, recherche jurisprudentielle, premiers brouillons. Mais la plaidoirie, la stratégie procédurale, la responsabilité ordinale et la confiance client te maintiennent indispensable.',
    sources: [21], quadrant: 'pilotes', potential: 70, leviers: [
      'Intègre Doctrine et Predictice à ta recherche — Jurisprudence pertinente en minutes, anticipation des décisions sur ton fond. Tu signes des conclusions plus rapidement et plus solidement.',
      'Repositionne-toi sur la stratégie procédurale et la plaidoirie — L\'IA produit la revue documentaire, toi tu construis l\'angle, tu plaides, tu portes la responsabilité ordinale. C\'est ton talent de cabinet qui paie.',
      'Forme-toi via le CNB modules IA juridique — Différenciateur fort sur LinkedIn et auprès des clients. Le cabinet 2026 cherche les associés qui pilotent ces outils.',
    ], secteur: 'juridique-extra-securite-divers' },

  { slug: 'juge', label: 'Juge / Magistrat', risk: 5, horizon: 10, status: 'protege',
    dynamic: 'L\'IA ne te remplace pas. La décision de justice ne peut, par construction démocratique, être déléguée à un algorithme. L\'autorité de la chose jugée demeure humaine.',
    sources: [21], quadrant: 'tiens', potential: 30, leviers: [
      'Utilise Doctrine ou Lexbase pour ta recherche jurisprudentielle — Accès instantané aux décisions pertinentes, alertes sur les évolutions de ta chambre. Tu rédiges tes jugements sur des fondements mieux documentés.',
      'Délègue la première rédaction des attendus à Claude ou ChatGPT — Soumets les éléments de faits, récupère une structure argumentée à corriger. Le fond reste le tien ; l\'IA t\'économise les heures de mise en forme.',
      'Forme-toi via les modules IA de l\'ENM — Compétence reconnue par les pairs et indispensable pour comprendre les systèmes d\'aide à la décision qui entrent dans les juridictions. Signal fort pour une évolution de poste.',
    ], secteur: 'juridique-extra-securite-divers' },

  { slug: 'notaire', label: 'Notaire', risk: 32, horizon: 10, status: 'protege',
    dynamic: 'L\'IA t\'assiste sur la rédaction d\'actes types. Mais l\'authentification, la responsabilité officielle et la médiation des intérêts entre parties te maintiennent au centre des transactions patrimoniales.',
    sources: [21], quadrant: 'pilotes', potential: 60, leviers: [
      'Utilise ContractPodAi ou Leeway pour la revue automatisée de tes actes — Détection des clauses à risque, cohérence des références légales, rédaction des annexes standards. Tu te concentres sur la négociation et l\'authentification.',
      'Repositionne-toi comme conseil patrimonial global — L\'IA rédige l\'acte ; toi tu orchestres la stratégie successorale, la protection du conjoint, l\'optimisation fiscale. C\'est ce conseil à haute valeur que tes clients ne trouvent pas ailleurs.',
      'Forme-toi via le CNB modules IA notariaux — Signal de modernité auprès des clients et des offices recruteurs. Le notaire augmenté traite plus de dossiers sans augmenter ses coûts fixes.',
    ], secteur: 'juridique-extra-securite-divers' },

  { slug: 'artificier', label: 'Artificier / Manipulateur d\'explosifs', risk: 0, horizon: 10, status: 'protege',
    dynamic: 'L\'IA ne te remplace pas. Environnement létal, totalement imprévisible, exigeant une motricité fine instantanée : exclu des robots autonomes dans un avenir prévisible. Le coût de l\'échec rend ta présence indispensable.',
    sources: [6], quadrant: 'tiens', potential: 25, leviers: [
      'Utilise ChatGPT pour rédiger tes rapports d\'intervention et comptes rendus réglementaires — Décris oralement ce que tu as fait, récupère un document structuré conforme aux exigences. Tu gagnes une heure de paperasse après chaque opération.',
      'Intègre les simulateurs IA de formation continue — Les nouveaux simulateurs haute-fidélité réduisent l\'exposition aux risques réels pendant l\'entraînement. Adopter les plus récents te positionne comme référent technique dans ton unité.',
      'Documente tes interventions complexes pour construire une expertise reconnue — Retours d\'expérience partagés en interne via Notion AI. L\'expertise capitalisée te donne un avantage naturel pour les missions de formation et de commandement.',
    ], secteur: 'juridique-extra-securite-divers' },

  { slug: 'macon', label: 'Maçon / Bâtiment', risk: 0, horizon: 10, status: 'croissance',
    dynamic: 'Tu es dans le bon wagon. Manipulation de matériaux lourds dans des chantiers non structurés défie la robotique actuelle. La transition énergétique et les besoins en logement garantissent l\'emploi à long terme.',
    sources: [6], quadrant: 'pilotes', potential: 70, leviers: [
      'Utilise ChatGPT pour rédiger tes devis et factures — Décris le chantier en langage courant, récupère un devis structuré prêt à envoyer. Tu gagnes 1h par chantier sur l\'administratif, sans changer ton outil de facturation.',
      'Capte ton savoir-faire avec des photos de chantier commentées — Avant/après sur Google Business + Instagram. Chaque réalisation devient une vitrine locale. C\'est le bouche-à-oreille numérique qui génère des appels sans prospection.',
      'Forme-toi aux relevés 3D avec Matterport ou Camera2BIM — Différenciateur fort sur les marchés de rénovation complexe et les promoteurs. Signal externe qui te positionne comme maçon augmenté, pas simplement artisan.',
    ], secteur: 'manuels-artisanat-transport' },

  { slug: 'plombier', label: 'Plombier', risk: 4, horizon: 10, status: 'protege',
    dynamic: 'L\'IA ne te remplace pas. Diagnostic dans des espaces contraints, intervention sur des installations vieillissantes hétérogènes et urgences d\'eau : hors de portée de la robotique économiquement viable.',
    sources: [21], quadrant: 'tiens', potential: 25, leviers: [
      'Automatise ta facturation avec Tiime AI ou Indy — Devis en deux clics depuis ton téléphone, relances automatiques. Tu fais tes factures sur le trajet retour, pas le soir après le chantier.',
      'Prends des photos systématiques avant et après intervention — Commentées avec ChatGPT pour créer des fiches techniques et des posts Google Business. Ta réputation locale se construit sans y penser.',
      'Suis les normes NF C 15-100 et RE2020 avec l\'aide de ChatGPT — Colle le texte réglementaire, pose tes questions en français clair. Tu gardes une longueur d\'avance sur les chantiers de rénovation énergétique qui explosent.',
    ], secteur: 'manuels-artisanat-transport' },

  { slug: 'electricien', label: 'Électricien', risk: 6, horizon: 10, status: 'protege',
    dynamic: 'L\'IA ne te remplace pas. Diagnostic d\'installations vieillissantes, intervention en environnement contraint et responsabilité sécuritaire restent hors de portée des robots. La transition énergétique soutient durablement la demande.',
    sources: [21], quadrant: 'tiens', potential: 25, leviers: [
      'Utilise ChatGPT pour rédiger tes devis et fiches d\'intervention — Décris le chantier à voix haute, paste les notes dans ChatGPT, récupère un devis formaté. Tu réduis le temps admin de moitié.',
      'Documente chaque installation IRVE ou borne de recharge que tu poses — Photos + fiche technique générée par ChatGPT sur Google Business. Les demandes de bornes EV vont doubler : sois le premier visible localement.',
      'Forme-toi aux outils de diagnostic électrique augmenté — Applications de thermographie et FLIR + IA pour détecter points chauds. Signal fort pour attirer les contrats de maintenance et les copropriétés.',
    ], secteur: 'manuels-artisanat-transport' },

  { slug: 'cuisinier-rapide', label: 'Cuisinier de restauration rapide', risk: 0, horizon: 10, status: 'protege',
    dynamic: 'L\'IA ne te remplace pas. Le travail physique cadencé dans un espace restreint résiste étonnamment bien à l\'IA. Bornes de commande automatisées oui, mais préparation physique des repas reste humaine.',
    sources: [6], quadrant: 'tiens', potential: 25, leviers: [
      'Utilise Choco AI pour tes commandes fournisseurs — Commande par message vocal ou photo, stock ajusté automatiquement. Tu réduis les pertes et les ruptures sans Excel ni téléphone.',
      'Apprends les bases du management de shift avec ChatGPT — Plannings, scripts de brief équipe, gestion de conflit simple. Si tu vises un poste de responsable, c\'est la compétence qui fait la différence.',
      'Suis une formation LinkedIn Learning en gestion de cuisine rapide avec IA — 4h qui donnent un vocabulaire opérationnel. Signal pour les recruteurs de chaînes qui déploient des outils digitaux en interne.',
    ], secteur: 'manuels-artisanat-transport' },

  { slug: 'cuisinier-restaurant', label: 'Cuisinier restaurant', risk: 5, horizon: 10, status: 'protege',
    dynamic: 'L\'IA ne te remplace pas. Créativité culinaire, adaptation produit-saison et gestion d\'un coup de feu en service restent humains. Les robots de cuisine restent confinés aux process standardisés.',
    sources: [21], quadrant: 'tiens', potential: 25, leviers: [
      'Utilise ChatGPT pour créer des suggestions de menus saisonniers à partir de ton stock — Tu colle ce que tu as, il te sort des idées de plats avec coûts matières estimés. Tu libères 30 min de réflexion avant chaque carte.',
      'Dicte tes recettes signatures avec Otter.ai pendant la mise en place — Tu construis un livre de recettes interne sans jamais écrire une ligne. Capital précieux si tu vises ton propre restaurant.',
      'Capte ta technique sur vidéo courte pour les réseaux sociaux — TikTok ou Instagram Reels avec Canva AI pour le texte. Cuisinier visible = recruteurs qui t\'appellent et clients qui réservent.',
    ], secteur: 'manuels-artisanat-transport' },

  { slug: 'soudeur', label: 'Soudeur / Coupeur', risk: 14, horizon: 10, status: 'protege',
    dynamic: 'L\'IA ne te remplace pas en grande partie. Robots industriels existent en chaîne, mais le sur-mesure, les réparations en extérieur et les interventions sur infrastructures vieillissantes échappent à l\'automatisation.',
    sources: [6], quadrant: 'tiens', potential: 25, leviers: [
      'Utilise ChatGPT pour décrypter les fiches techniques et normes de soudage constructeurs — Colle le PDF ou la photo, pose tes questions en français. Tu réduis les erreurs d\'interprétation sur les aciers spéciaux.',
      'Documente tes qualifications de soudeur (QS) avec des photos horodatées — Portefeuille numérique partageable avec les bureaux de contrôle et les donneurs d\'ordre industriels. Signal de professionnalisme qui ouvre les marchés grands comptes.',
      'Explore les formations soudage TIG/MIG augmenté — AFPA propose des modules de qualification. Un soudeur certifié sur aciers inox et alliages spéciaux est recruté avant même de candidater.',
    ], secteur: 'manuels-artisanat-transport' },

  { slug: 'mecanicien', label: 'Mécanicien automobile / moto', risk: 0, horizon: 10, status: 'protege',
    dynamic: 'L\'IA ne te remplace pas. Diagnostic basé sur perceptions sensorielles complexes (bruit, vibration, odeurs) et accès physique contraint aux pièces dans des environnements non standardisés garantissent le métier.',
    sources: [3], quadrant: 'tiens', potential: 25, leviers: [
      'Pilote CarMD ou ETAI avec IA pour le diagnostic OBD — Codes erreur interprétés en secondes, pièces identifiées automatiquement. Tu passes moins de temps sur manuels, plus sur la réparation elle-même.',
      'Utilise ChatGPT pour traduire les manuels constructeurs anglais ou les fiches techniques complexes — Procédures d\'intervention claires en français en moins d\'une minute. Gain de temps sur les véhicules étrangers ou récents.',
      'Monte en compétence sur les véhicules électriques — Formations AFPA ou CFA sur haute tension et BMS. Le mécanicien certifié VE est la pénurie des 5 prochaines années : tu te places maintenant.',
    ], secteur: 'manuels-artisanat-transport' },

  { slug: 'masseur', label: 'Masseur-Kinésithérapeute', risk: 12, horizon: 10, status: 'protege',
    dynamic: 'L\'IA ne te remplace pas. Retour haptique, chaleur humaine, adaptation instantanée à la douleur du patient et manipulation anatomique précise constituent l\'essence même de la valeur thérapeutique.',
    sources: [6], quadrant: 'tiens', potential: 25, leviers: [
      'Utilise ChatGPT pour générer des fiches d\'exercices personnalisées — Programme de rééducation adapté au diagnostic du patient en 5 minutes. Tu passes plus de temps en séance, moins à rédiger.',
      'Intègre une app de suivi patient inter-séances — Kaia Health ou Sword Health pour maintenir l\'observance entre tes séances. Tu restes l\'ancrage du suivi, l\'outil tient le lien quotidien.',
      'Documente ton approche sur les réseaux pros (Kiné Network, LinkedIn) — Partage des cas de rééducation complexes résolus. Signal d\'expertise qui attire les cas difficiles et les prescripteurs médecins.',
    ], secteur: 'sante-care-education' },

  { slug: 'osteopathe', label: 'Ostéopathe', risk: 10, horizon: 10, status: 'protege',
    dynamic: 'L\'IA ne te remplace pas. Palpation, lecture corporelle et ajustement manuel précis dépendent d\'une expertise sensorielle et d\'une relation thérapeutique non modélisables. La demande reste forte.',
    sources: [21], quadrant: 'tiens', potential: 25, leviers: [
      'Utilise ChatGPT pour rédiger tes comptes rendus et bilans patients — Dictée ou notes brutes en entrée, CR structuré en sortie. Tu économises 15 min par consultation, tu les rends au suivi.',
      'Intègre une analyse posturale vidéo-assistée dans ton bilan — Applications d\'analyse de mouvement avec IA (Kinovea, PhysiTrack) pour objectiver le diagnostic. Crédibilise ta démarche auprès des prescripteurs médecins.',
      'Construis ta présence en ligne sur ta spécialité — Blog ou posts LinkedIn sur des cas cliniques traités. Premier ostéopathe visible dans ta spécialité (sport, pédiatrique, crânien) = liste d\'attente.',
    ], secteur: 'sante-care-education' },

  { slug: 'operateur-crematorium', label: 'Opérateur de crématorium', risk: 17, horizon: 10, status: 'protege',
    dynamic: 'L\'IA ne te remplace pas. Manipulation physique en environnement potentiellement dangereux + respect strict de protocoles culturels et moraux liés au deuil : profondément humain.',
    sources: [6], quadrant: 'tiens', potential: 25, leviers: [
      'Utilise ChatGPT pour rédiger les communications aux familles — Lettres de condoléances, confirmations de cérémonies, informations pratiques. Tu personnalises le ton, l\'IA structure le texte. Moins de charge mentale, plus de soin dans la relation.',
      'Capitalise sur ta maîtrise des protocoles multi-cultuels — Rédige avec l\'aide de Notion AI une base de connaissances interne (rites juifs, musulmans, bouddhistes, laïques). Tu deviens la référence dans ton établissement.',
      'Forme-toi aux logiciels métiers funéraires augmentés — Les plateformes de gestion de funérarium intègrent progressivement l\'IA. Maîtriser ces outils tôt te place en position de référent technique et ouvre des postes de coordination.',
    ], secteur: 'juridique-extra-securite-divers' },

  { slug: 'pompier', label: 'Pompier', risk: 8, horizon: 10, status: 'protege',
    dynamic: 'L\'IA ne te remplace pas. Intervention en environnement chaotique, jugement vital sous stress et coopération équipe-terrain restent fondamentalement humains. La technologie augmente, ne remplace pas.',
    sources: [21], quadrant: 'tiens', potential: 25, leviers: [
      'Utilise ChatGPT pour rédiger tes rapports d\'intervention et bilans de garde — Dicte les faits, l\'IA structure le compte rendu administratif. Tu sors du véhicule sans avoir à passer 30 minutes sur le clavier.',
      'Intègre les simulateurs IA de formation incendie et secours — Les nouveaux outils de simulation haute-fidélité (réalité virtuelle + analyse comportementale IA) accélèrent la montée en compétences sans exposer l\'équipe au risque.',
      'Développe une compétence en prévention des risques augmentée — Les outils de modélisation des propagations d\'incendie et des plans d\'évacuation avec IA deviennent standard dans les SDIS. Maîtriser ces outils ouvre les postes de préventionniste.',
    ], secteur: 'juridique-extra-securite-divers' },

  { slug: 'policier', label: 'Policier', risk: 9, horizon: 10, status: 'protege',
    dynamic: 'L\'IA t\'assiste sur la reconnaissance et l\'analyse de données, mais l\'usage légitime de la force, le jugement de proportionnalité et l\'intervention humaine restent encadrés par la présence physique.',
    sources: [21], quadrant: 'tiens', potential: 25, leviers: [
      'Utilise ChatGPT pour rédiger tes procès-verbaux et rapports de service — Dicte les éléments de l\'intervention, récupère un PV structuré à relire et signer. Tu consacres moins de temps à la rédaction, plus au terrain.',
      'Développe ta maîtrise des outils d\'analyse de données criminelles — Les logiciels de cartographie des infractions et de prédiction des points chauds (i2, Palantir pour les grandes unités) deviennent courants. L\'officier qui les pilote monte plus vite.',
      'Forme-toi aux enjeux IA-éthique dans la sécurité publique — Compétence rare et très attendue dans les états-majors et les services de contrôle interne. Différenciateur fort pour accéder aux postes de commandement ou aux missions DGPN.',
    ], secteur: 'juridique-extra-securite-divers' },

  { slug: 'militaire', label: 'Militaire', risk: 11, horizon: 10, status: 'protege',
    dynamic: 'L\'IA augmente massivement les capacités (drones, renseignement, logistique). Mais la décision d\'engagement, la responsabilité de commandement et le combat en environnement complexe restent humains.',
    sources: [21], quadrant: 'tiens', potential: 25, leviers: [
      'Utilise ChatGPT pour rédiger tes ordres d\'opérations, comptes rendus et rapports SITREP — Gagne du temps sur l\'administratif opérationnel. Le fond reste le tien, l\'IA structure la forme selon les standards militaires.',
      'Intègre les outils de simulation augmentée dans ta préparation opérationnelle — Les simulateurs IA de guerre urbaine, de drone et de renseignement image transforment l\'entraînement. Maîtriser ces outils te positionne comme référent dans ton unité.',
      'Développe une double compétence cyber ou drones autonomes — La DGA et les états-majors cherchent des officiers capables de comprendre les systèmes IA en opération. Compétence rare, très demandée, ouvre les postes d\'état-major et de coopération internationale.',
    ], secteur: 'juridique-extra-securite-divers' },

  // ── EN CROISSANCE ──────────────────────────────────────
  // (demande qui augmente structurellement)

  { slug: 'travailleur-social', label: 'Travailleur social', risk: 5, horizon: 10, status: 'croissance',
    dynamic: 'Tu es dans le bon wagon. Gestion de crises intrafamiliales, protection de l\'enfance et réparation du tissu social exigent un jugement moral et une compassion que l\'IA ne peut pas et ne doit pas assumer.',
    sources: [9], quadrant: 'pilotes', potential: 50, leviers: [
      'Utilise ChatGPT pour rédiger tes bilans sociaux et rapports — Synthèse de situation à partir de tes notes en 5 minutes. Tu libères du temps pour le terrain et la relation, pas la paperasse.',
      'Repositionne-toi sur la coordination de parcours complexes — L\'IA gère les tâches répétitives, toi tu orchestres le filet de sécurité autour de familles en crise multi-problèmes. C\'est ce que les MDPH et CCAS cherchent de plus en plus.',
      'Forme-toi via le CNFPT modules IA secteur social — Documente tes cas d\'usage et partage-les en réseau interne. Premier travailleur social référent IA dans ta structure = profil stratégique pour les postes de coordination.',
    ], secteur: 'sante-care-education' },

  { slug: 'infirmier', label: 'Infirmier', risk: 18, horizon: 10, status: 'croissance',
    dynamic: 'Tu es dans le bon wagon. Soin physique corporel, hygiène, manipulation de patients fragiles et communication avec familles en détresse exigent une présence humaine irremplaçable. Le vieillissement démographique fait exploser la demande.',
    sources: [6], quadrant: 'pilotes', potential: 55, leviers: [
      'Bascule sur les notes dictées DAX Copilot ou Suki AI — 30% de ton temps libéré sur la documentation. Tu le rends au patient, pas à l\'écran.',
      'Repositionne-toi sur le triage et la coordination de soins — L\'IA fait les CRH, toi tu pilotes l\'urgence relative, l\'éducation thérapeutique, la coordination ville-hôpital.',
      'Forme-toi à l\'IA en santé — DPC modules IA santé + DU Intelligence Artificielle en Santé Lille. Compétence rare et stratégique pour évoluer en cadre ou IPA.',
    ], secteur: 'sante-care-education' },

  { slug: 'aide-soignant', label: 'Aide-soignant', risk: 18, horizon: 10, status: 'croissance',
    dynamic: 'Tu es dans le bon wagon. La proximité physique, l\'aide à la toilette et l\'accompagnement des personnes dépendantes exigent ta présence. Le vieillissement démographique structure une demande explosive.',
    sources: [6], quadrant: 'tiens', potential: 35, leviers: [
      'Utilise les outils de planning EHPAD avec IA (NetSoins, Titan) — Transmissions automatisées, alertes de changement d\'état patient. Tu passes moins de temps en saisie, plus auprès des résidents.',
      'Repositionne-toi sur la surveillance et la détection précoce — Les capteurs IA détectent les chutes, les anomalies de rythme. Toi tu interprètes, tu declenches l\'alerte humaine, tu gères la crise. C\'est irréductible.',
      'Passe le DEAS renforcé ou vise l\'AES — Accompagnant éducatif et social avec compétences numériques santé : profil recherché dans les EHPAD qui se digitalisent. Formation continue CNFPT ou Croix-Rouge.',
    ], secteur: 'sante-care-education' },

  { slug: 'auxiliaire-vie', label: 'Auxiliaire de vie', risk: 5, horizon: 10, status: 'croissance',
    dynamic: 'Tu es dans le bon wagon. Maintien à domicile des personnes âgées et dépendantes : la demande explose avec le vieillissement. L\'IA ne remplace ni la présence physique ni la chaleur humaine.',
    sources: [9], quadrant: 'tiens', potential: 30, leviers: [
      'Utilise les assistants vocaux et domotique IA pour augmenter l\'autonomie des personnes aidées — Alexa Care, Google Nest avec alertes : l\'IA surveille, toi tu interviens. Tu passes moins de temps en veille passive, plus en présence utile.',
      'Repositionne-toi comme coordinateur de l\'environnement domotique du bénéficiaire — Capteurs de chute, piluliers connectés, interfaces vocales : l\'auxiliaire qui comprend ces outils devient référent dans sa structure et auprès des familles.',
      'Vise le titre ADVF avec module numérique — Assistant de Vie aux Familles + compétences domotique santé : profil rare et demandé. AFPA et Croix-Rouge proposent des formations qui intègrent ces compétences.',
    ], secteur: 'sante-care-education' },

  { slug: 'sage-femme', label: 'Sage-femme', risk: 6, horizon: 10, status: 'croissance',
    dynamic: 'Tu es dans le bon wagon. Accouchement, suivi prénatal, accompagnement post-partum : la combinaison technique-relationnelle est irréductible. La demande structurelle reste forte malgré la baisse de natalité.',
    sources: [21], quadrant: 'pilotes', potential: 50, leviers: [
      'Intègre DAX Copilot pour tes comptes rendus de consultation — Dictée structurée en temps réel, CR signé en 2 minutes. Tu récupères du temps pour l\'accompagnement prénatal et le soutien post-partum.',
      'Explore les outils d\'aide à l\'interprétation du monitoring fœtal — Systèmes d\'alerte IA (Monica AN24, systèmes CTG augmentés) : tu restes décideur, l\'IA détecte les signaux précoces qui passent sous le radar en charge.',
      'Construis une présence en maïeutique numérique — Blog ou compte Instagram/LinkedIn sur le suivi de grossesse augmenté. Sage-femme référente IA en périnatalité = profil recherché par les maternités et les coopératives libérales.',
    ], secteur: 'sante-care-education' },

  { slug: 'orthophoniste', label: 'Orthophoniste', risk: 11, horizon: 10, status: 'croissance',
    dynamic: 'Tu es dans le bon wagon. Rééducation du langage, suivi des troubles cognitifs et accompagnement des familles : la demande dépasse l\'offre dans la plupart des bassins.',
    sources: [21], quadrant: 'pilotes', potential: 55, leviers: [
      'Intègre des apps de rééducation augmentées comme Speeko AI ou Cleft 21 pour tes exercices inter-séances — Le patient s\'entraîne entre tes rendez-vous, tu ajustes le protocole. La progression accélère sans alourdir ton planning.',
      'Utilise ChatGPT pour générer du matériel pédagogique adapté — Textes calibrés par niveau, exercices de discrimination auditive, fiches parents : 10 minutes de génération pour 2 heures de matériel. Tu te concentres sur l\'observation clinique.',
      'Prends position publique sur l\'orthophonie et l\'IA — Les parents et médecins prescripteurs cherchent à comprendre ce que les applis remplacent ou non. Ton blog ou ta présence LinkedIn sur ce sujet te positionne en référente nationale.',
    ], secteur: 'sante-care-education' },

  { slug: 'agriculteur', label: 'Ouvrier agricole / Agriculteur', risk: 0, horizon: 5, status: 'croissance',
    dynamic: 'Tu es dans le bon wagon - peut-être le meilleur. Boostée par la transition écologique, l\'adaptation climatique et la sécurité alimentaire mondiale, la profession connaît la plus forte croissance absolue : +34M emplois projetés d\'ici 2030.',
    sources: [9], quadrant: 'pilotes', potential: 70, leviers: [
      'Bascule sur la météo augmentée Sencrop ou Weenat — Décisions d\'irrigation et de traitement au jour près avec données micro-locales. Tu économises des intrants, tu protèges tes rendements sans jouer aux devinettes.',
      'Repositionne ta valeur sur l\'observation terrain et l\'arbitrage — Les drones XAG ou Airinov cartographient les anomalies de végétation, toi tu décides quoi traiter, comment, quand. C\'est ton expertise agronomique qui paie, pas la machine.',
      'Forme-toi à l\'AgTech via INRAE ou ta Chambre d\'agriculture — Modules agriculture de précision + aide aux démarches PAC IA-augmentées. Différenciateur sur les aides et la transmission d\'exploitation.',
    ], secteur: 'manuels-artisanat-transport' },

  { slug: 'maraicher', label: 'Maraîcher', risk: 4, horizon: 10, status: 'croissance',
    dynamic: 'Tu es dans le bon wagon. La demande de circuits courts et la transition agroécologique soutiennent durablement le métier. L\'automatisation reste partielle face à la diversité variétale et météorologique.',
    sources: [9], quadrant: 'tiens', potential: 35, leviers: [
      'Intègre un outil de suivi phytosanitaire IA comme PlantNet ou Scouting IA — Photo d\'une plante malade, diagnostic en secondes, recommandation d\'intervention. Tu réduis les pertes sur maladies détectées trop tard.',
      'Utilise ChatGPT pour rédiger tes fiches circuit court — Descriptifs variétaux, recettes associées, story de la production pour ton AMAP ou ta boutique en ligne. Tu vends mieux sans devenir rédacteur.',
      'Explore les robots de désherbage Naïo ou FarmDroid pour tes lignes maraîchères — Pas pour tout remplacer, mais pour libérer des heures de tâches pénibles. Signal fort pour accéder aux aides à l\'investissement AgTech.',
    ], secteur: 'manuels-artisanat-transport' },

  { slug: 'eleveur', label: 'Éleveur', risk: 6, horizon: 10, status: 'croissance',
    dynamic: 'Tu es dans le bon wagon. Soin du vivant, gestion de la reproduction et adaptation aux pathologies animales restent fondamentalement humains. La demande de produits locaux soutient la profession.',
    sources: [9], quadrant: 'tiens', potential: 35, leviers: [
      'Déploie des capteurs connectés Connecterra ou Smartbow AI sur ton troupeau — Détection automatique des chaleurs, alertes de boiterie ou de fièvre avant les symptômes visibles. Tu interviens plus tôt, tu perds moins.',
      'Utilise ChatGPT pour tes démarches administratives — Demandes PAC, dossiers sanitaires, plans d\'alimentation : tu décris la situation, ChatGPT structure le document. 2h d\'admin par semaine récupérées.',
      'Capte et partage ta démarche d\'élevage en ligne — Photos de vie d\'élevage sur Instagram ou Facebook. Les consommateurs paient une prime au local transparent. Tu construis une clientèle directe qui n\'a pas besoin d\'intermédiaire.',
    ], secteur: 'manuels-artisanat-transport' },

  { slug: 'chauffeur-livreur', label: 'Chauffeur-livreur', risk: 10, horizon: 5, status: 'croissance',
    dynamic: 'Tu es dans le bon wagon. La complexité du dernier kilomètre - bâtiments non cartographiés, remise en main propre, interaction client - retarde indéfiniment l\'automatisation logistique complète.',
    sources: [9], quadrant: 'tiens', potential: 30, leviers: [
      'Allège ton admin avec ChatGPT — Rédaction d\'avis clients, contestations de PV, communication avec les expéditeurs exigeants. 30 minutes par jour récupérées sur la paperasse.',
      'Capitalise sur ton expertise du dernier kilomètre — Documente publiquement tes astuces de livraison (TikTok, blog court). Différenciation forte si tu vises l\'auto-entrepreneur ou la supervision logistique.',
      'Forme-toi au prompt engineering en 10h — DeepLearning.AI gratuit. Compétence portable si tu pivotes vers customer success ou coordinateur logistique.',
    ], secteur: 'manuels-artisanat-transport' },

  { slug: 'chauffeur-poids-lourd', label: 'Chauffeur poids-lourd', risk: 32, horizon: 10, status: 'croissance',
    dynamic: 'Tu restes dans le bon wagon… pour l\'instant. Le camion autonome avance, mais la complexité réglementaire, la responsabilité accident et les manœuvres en zone urbaine repoussent encore le déploiement à grande échelle.',
    sources: [21], quadrant: 'tiens', potential: 35, leviers: [
      'Utilise les apps de télématique connectée Continental VDO ou Webfleet — Suivi de conduite, éco-conduite scorée, alertes maintenance : tu prouves ta valeur aux transporteurs qui font de l\'optimisation carburant une priorité.',
      'Utilise ChatGPT pour préparer tes itinéraires complexes et gérer tes communications clients — Restrictions tonnage, délais déclarés, contestations de pénalités. Tu gagnes en autonomie administrative sans passer par le bureau.',
      'Monte en compétence sur le transport frigorifique ou les matières dangereuses ADR — Formations AFPA ou auto-école spécialisée. Chauffeur PL spécialisé = tarif horaire 20-30% supérieur et demande continue.',
    ], secteur: 'manuels-artisanat-transport' },

  { slug: 'ingenieur-ia', label: 'Ingénieur IA / Architecte MLOps', risk: 0, horizon: 10, status: 'croissance',
    dynamic: 'Tu es au sommet de la vague. Création de modèles de fondation, intégration cloud sécurisée, optimisation des flux d\'inférence : demande massive, salaires premium. LinkedIn recense 1,3M nouveaux postes IA.',
    sources: [11, 14], quadrant: 'pilotes', potential: 90, leviers: [
      'Construis ton playbook MLOps personnel — Templates Weights & Biases ou MLflow, pipelines réutilisables, evaluations standardisées. Capitalise sur chaque projet pour le suivant.',
      'Documente publiquement ce que tu fais — Blog post mensuel sur tes architectures agentic, retours d\'expérience LangChain ou LlamaIndex. Ta valeur de référent monte avant les autres.',
      'Vise une certification cloud ML — AWS ML Specialty, Azure AI Engineer, ou GCP ML Engineer. Différenciateur fort sur le marché et signal aux recruteurs que tu sais industrialiser.',
    ], secteur: 'tech-data-design' },

  { slug: 'integrateur-ia', label: 'Intégrateur IA', risk: 0, horizon: 10, status: 'croissance',
    dynamic: 'Tu es dans le bon wagon. Connecter les LLM aux systèmes métier d\'entreprise est la compétence la plus demandée - chaque société veut son IA opérationnelle, peu de gens savent vraiment la déployer en production.',
    sources: [14], quadrant: 'pilotes', potential: 85, leviers: [
      'Construis un agent de démo opérationnel avec LangChain ou LlamaIndex — Un agent qui répond sur les données internes d\'une entreprise type. C\'est ton portfolio vivant, plus convaincant que n\'importe quel CV.',
      'Documente tes intégrations sur GitHub avec exemples concrets — Chaque déploiement en prod est un cas d\'usage documentable. Anthropic Academy + retours terrain : ta réputation d\'intégrateur fiable se construit en public.',
      'Vise la certification Anthropic Academy ou DeepLearning.AI LangChain for LLM Application Development — Ces certifications ciblées signalent ta spécialisation aux DSI qui recrutent. Couple avec une présence LinkedIn active.',
    ], secteur: 'tech-data-design' },

  { slug: 'expert-cybersecurite', label: 'Expert cybersécurité', risk: 12, horizon: 10, status: 'croissance',
    dynamic: 'Tu es dans le bon wagon. L\'IA générative arme les attaquants : phishing personnalisé, génération de malware, ingénierie sociale automatisée. La demande d\'experts capables de contrer ces vagues explose.',
    sources: [9], quadrant: 'pilotes', potential: 80, leviers: [
      'Maîtrise Wiz ou Lacework pour la sécurité cloud IA cette semaine — Piloter ces plateformes de détection des risques cloud IA te place au niveau où peu d\'experts ont encore migré. L\'avance se creuse maintenant.',
      'Capitalise sur la menace LLM en entreprise — Construis un framework d\'audit des déploiements IA internes : prompt injection, exfiltration de données, hallucinations en prod. Propose-le en atelier à ta direction.',
      'Vise la certification CISSP ou la GIAC GAISC — Le marché cyber IA est si tendu que les certifications avancées te donnent un accès direct aux rôles RSSI et aux missions de conseil indépendant.',
    ], secteur: 'tech-data-design' },

  { slug: 'specialiste-big-data', label: 'Spécialiste Big Data', risk: 18, horizon: 10, status: 'croissance',
    dynamic: 'Tu es dans le bon wagon. L\'inflation du volume de données générées par l\'IA elle-même crée une demande structurelle pour ceux qui savent les architecturer, gouverner et exploiter de manière utile.',
    sources: [9], quadrant: 'pilotes', potential: 80, leviers: [
      'Intègre dbt + AI et Hex AI Notebooks dans tes pipelines — Génère les transformations de données, automatise les tests de qualité. Tu te libères du code répétitif pour te concentrer sur l\'architecture et la gouvernance.',
      'Capitalise sur la data governance des systèmes IA — Les entreprises déploient des LLM sur leurs données et paniquent sur la conformité RGPD et la qualité des données d\'entraînement. C\'est ton terrain d\'expertise naturel.',
      'Vise la certification Databricks Data Engineer ou Google Cloud Professional Data Engineer — Ces certifications cloud data sont les plus demandées. Couple avec une veille publique sur LinkedIn sur les architectures data IA.',
    ], secteur: 'tech-data-design' },

  { slug: 'ingenieur-fintech', label: 'Ingénieur fintech', risk: 22, horizon: 10, status: 'croissance',
    dynamic: 'Tu es dans le bon wagon. La fusion finance-IA-régulation crée une niche premium. Les banques transforment leurs systèmes legacy avec l\'IA et cherchent des profils hybrides finance + tech.',
    sources: [9], quadrant: 'pilotes', potential: 75, leviers: [
      'Pilote l\'intégration de modèles JAX ou Modal Labs dans tes pipelines quantitatifs — Les architectures de calcul financier IA sont le nouveau terrain de jeu. Construis un prototype de scoring ou de prédiction de risque augmenté.',
      'Capitalise sur la compliance IA dans la finance — DORA, MiCA, Bâle IV : les régulateurs exigent de l\'explicabilité sur les modèles IA décisionnels. Tu es le profil rare qui comprend les deux langages.',
      'Vise une certification AWS Fintech ou Azure AI Engineer — Couple avec des contributions open source sur des libs comme Numerai ou JAX. Le recrutement fintech IA est mondial, ta visibilité GitHub compte.',
    ], secteur: 'tech-data-design' },

  { slug: 'specialiste-energies-renouvelables', label: 'Spécialiste énergies renouvelables', risk: 4, horizon: 10, status: 'croissance',
    dynamic: 'Tu es dans le bon wagon. La transition énergétique structure une demande massive : conception, installation, maintenance d\'infrastructures solaires/éoliennes/hydrogène. Le marché embauche plus vite qu\'il forme.',
    sources: [9], quadrant: 'pilotes', potential: 65, leviers: [
      'Utilise Helioscope ou PVsyst pour dimensionner et simuler tes projets — Modélisation solaire en quelques minutes avec données météo locales intégrées. Tes études de faisabilité sont plus précises et plus rapides à produire.',
      'Automatise ta veille réglementaire avec ChatGPT — Colle les textes RE2020, loi Énergie-Climat et directives européennes, pose tes questions en langage courant. Tu restes à jour sans y passer des heures chaque semaine.',
      'Développe une expertise en maintenance prédictive IA — Uptake AI et SparkCognition transforment les opérations de parc solaire et éolien. Profil hybride technique + IA = la pénurie des 5 prochaines années dans le secteur.',
    ], secteur: 'juridique-extra-securite-divers' },

  { slug: 'technicien-eolien', label: 'Technicien éolien', risk: 3, horizon: 10, status: 'croissance',
    dynamic: 'Tu es dans le bon wagon. Maintenance en hauteur, diagnostic mécanique-électrique sur sites isolés et coordination terrain : irréductibles à l\'automatisation à court terme. Demande structurelle forte.',
    sources: [9], quadrant: 'tiens', potential: 35, leviers: [
      'Exploite les outils de maintenance prédictive Uptake AI ou SparkCognition — Données capteurs en temps réel, alertes de défaillance avant l\'arrêt machine. Tu passes d\'un rôle réactif à un rôle préventif, mieux valorisé.',
      'Utilise les drones DroneDeploy avec IA pour les inspections de pales — Détection automatique de fissures et érosion sur les images. Tu réduis le temps en hauteur sur les tâches d\'inspection visuelle pure.',
      'Certifie-toi GWO (Global Wind Organisation) et complète par un module IoT industriel — LinkedIn Learning propose des cours sur les capteurs et l\'IIoT. Profil rare et très recherché par les exploitants de parcs.',
    ], secteur: 'manuels-artisanat-transport' },

  { slug: 'technicien-solaire', label: 'Technicien solaire', risk: 4, horizon: 10, status: 'croissance',
    dynamic: 'Tu es dans le bon wagon. La diversité des toitures, des configurations résidentielles et des contraintes techniques rend l\'installation difficilement automatisable. Le marché manque cruellement de bras qualifiés.',
    sources: [9], quadrant: 'tiens', potential: 35, leviers: [
      'Utilise Helioscope ou PVsyst avec IA pour dimensionner les installations — Simulation de production solaire en quelques minutes selon l\'orientation et l\'ombrage. Tu proposes des devis plus précis, tu gagnes des chantiers.',
      'Prends des photos systématiques de chaque installation pour ton portfolio Google Business — Commentaire généré par ChatGPT, publié après chaque chantier. Ta visibilité locale se construit chantier après chantier.',
      'Monte en compétence sur le stockage batterie et les systèmes AC/DC couplés — AFPA ou CFA modules énergie. Le technicien solaire + storage est la pénurie des 3 prochaines années.',
    ], secteur: 'manuels-artisanat-transport' },

  { slug: 'specialiste-batiment-durable', label: 'Spécialiste bâtiment durable', risk: 5, horizon: 10, status: 'croissance',
    dynamic: 'Tu es dans le bon wagon. Rénovation énergétique, isolation thermique et matériaux biosourcés : la réglementation européenne crée une demande massive. Les entreprises peinent à recruter.',
    sources: [9], quadrant: 'pilotes', potential: 55, leviers: [
      'Utilise le BIM augmenté (Autodesk Revit + IA) pour tes projets de rénovation énergétique — Simulation thermique intégrée, détection des ponts thermiques, optimisation des matériaux. Tu produis des études plus solides en moins de temps.',
      'Automatise ta veille RE2020 et DPEF avec ChatGPT — Colle les textes réglementaires, pose tes questions en langage courant. Tu restes au niveau des exigences sans passer des heures à déchiffrer les décrets.',
      'Monte en compétence sur les outils de calcul carbone — Ecodesign et Climate Resolve AI intègrent les données de cycle de vie des matériaux. Profil spécialiste décarbonation = le différenciateur demandé par les maîtres d\'ouvrage publics en 2026.',
    ], secteur: 'juridique-extra-securite-divers' },

  { slug: 'coach-professionnel', label: 'Coach professionnel', risk: 22, horizon: 10, status: 'croissance',
    dynamic: 'Tu es dans le bon wagon. Face au déclassement cognitif induit par l\'IA, la demande de coaching de carrière, de reconversion et de gestion de stress explose. La présence humaine fait la différence.',
    sources: [21], quadrant: 'pilotes', potential: 60, leviers: [
      'Utilise Notion AI pour automatiser ton back-office coaching — Comptes-rendus de séances, plans d\'action personnalisés, suivi de progression : l\'IA structure, toi tu te concentres sur la relation et l\'accompagnement.',
      'Développe une spécialité sur la reconversion face à l\'IA — La moitié de tes futurs clients cherchent à survivre à la vague IA. Positionnement "coach de transition IA" : niche porteuse, peu encombrée, demande en forte hausse.',
      'Lance un podcast ou une newsletter sur le coaching à l\'ère IA — Riverside.fm pour l\'enregistrement, Descript pour le montage. Visibilité en ligne = flux entrant de clients sans prospection. 6 mois pour voir les premiers résultats.',
    ], secteur: 'marketing-comm-management' },

  { slug: 'formateur-adultes', label: 'Formateur d\'adultes', risk: 25, horizon: 10, status: 'croissance',
    dynamic: 'Tu es dans le bon wagon. Le WEF projette que 39% des compétences devront être réapprises d\'ici 2030. La requalification massive des actifs crée un appel d\'air pour les formateurs en présentiel.',
    sources: [10], quadrant: 'pilotes', potential: 65, leviers: [
      'Utilise Synthesia ou Loom AI pour créer tes modules e-learning — Slides animées, avatars vidéo, quiz générés : tu multiplies ton catalogue sans multiplier ton temps de tournage. Idéal pour les contenus à forte demande.',
      'Spécialise-toi sur la formation aux compétences IA — Prompting, usage de ChatGPT au bureau, automatisation no-code : c\'est le programme le plus commandé par les entreprises depuis 2024. Tu es dans le wagon de la demande.',
      'Certifie-toi DeepLearning.AI Generative AI for Everyone et affiche-le sur ton catalogue — Preuve que tu maîtrises ce que tu enseignes. Les organismes de formation cherchent des formateurs IA certifiés, pas des amateurs curieux.',
    ], secteur: 'marketing-comm-management' },

  // ── ARTISANAT & MÉTIERS DU CONCRET (PROTÉGÉ / CROISSANCE) ──

  { slug: 'menuisier', label: 'Menuisier', risk: 8, horizon: 10, status: 'protege',
    dynamic: 'L\'IA ne te remplace pas. Travail sur mesure, lecture du bois, ajustement à l\'existant : irréductible à la robotique. La demande pour le mobilier sur mesure et la rénovation reste solide.',
    sources: [21], quadrant: 'tiens', potential: 25, leviers: [
      'Utilise ChatGPT pour rédiger tes devis, fiches techniques et conditions générales — Décris le chantier, récupère un document pro en 2 minutes. Tu passes plus de temps en atelier, moins à la paperasse.',
      'Photographie chaque réalisation avec légendes — Publie sur Google Business et Instagram avec description générée par ChatGPT. Les clients qui cherchent "menuisier sur mesure [ville]" te trouvent.',
      'Explore la découpe CNC assistée par IA via logiciel CAO — Cabinet Maker ou Cut2D : tu gagnes en précision sur les pièces complexes. Signal différenciateur pour les architectes d\'intérieur qui veulent un partenaire fiable.',
    ], secteur: 'manuels-artisanat-transport' },

  { slug: 'ebeniste', label: 'Ébéniste', risk: 5, horizon: 10, status: 'protege',
    dynamic: 'L\'IA ne te remplace pas. La haute valeur ajoutée artisanale et la finition au sentiment échappent à l\'automatisation. Le marché du luxe et de la restauration soutient durablement la profession.',
    sources: [21], quadrant: 'tiens', potential: 25, leviers: [
      'Utilise Midjourney pour explorer des directions créatives avec ton client avant de démarrer — Tu présentes 6 variantes visuelles en 10 minutes, tu valides le style avant la première cheville. Zéro devis refusé pour mauvaise interprétation.',
      'Capte ton savoir-faire en vidéo courte — Time-lapse d\'une pièce, technique d\'assemblage, finition à la cire : Instagram et LinkedIn. Un ébéniste visible attire les architectes d\'intérieur et les marchés luxe sans démarchage.',
      'Utilise ChatGPT pour les devis et fiches de chantier — Descriptif des essences, tolérances dimensionnelles, délais et CGV. Tu envoies des documents de niveau cabinet d\'architecte, tu justifies ton tarif.',
    ], secteur: 'manuels-artisanat-transport' },

  { slug: 'boulanger', label: 'Boulanger / Pâtissier', risk: 10, horizon: 10, status: 'protege',
    dynamic: 'L\'IA ne te remplace pas. Tour de main, adaptation aux farines, gestion d\'un fournil et créativité culinaire restent humains. La demande de produits artisanaux locaux soutient le métier.',
    sources: [21], quadrant: 'tiens', potential: 25, leviers: [
      'Utilise Choco AI ou Apicbase pour tes prévisions de ventes et commandes fournisseurs — Tu réduis les invendus de fin de journée et les ruptures du samedi matin. 3-5% de marge récupérée sans changer ton four.',
      'Documente tes créations saisonnières avec Canva AI — Photos de la galette, de la bûche, des viennoiseries de Pâques : posts Google Business + Facebook prêts en 10 minutes. Les clients locaux partagent, le bouche-à-oreille numérique fait le reste.',
      'Utilise ChatGPT pour rédiger tes étiquettes allergènes et fiches techniques — Conformité réglementaire rapide sur chaque nouvelle recette. Tu évites l\'amende, tu montres le professionnalisme.',
    ], secteur: 'manuels-artisanat-transport' },

  { slug: 'boucher', label: 'Boucher', risk: 12, horizon: 10, status: 'protege',
    dynamic: 'L\'IA ne te remplace pas. Lecture anatomique, découpe précise et conseil client en proximité résistent à l\'automatisation économiquement viable. Le local et l\'artisanal soutiennent la demande.',
    sources: [21], quadrant: 'tiens', potential: 25, leviers: [
      'Utilise ChatGPT pour rédiger tes fiches produits, étiquettes et suggestions de recettes — "Avec ce rôti, essayez…" : tu transformes une vente en expérience. Les clients reviennent chercher le conseil, pas juste la viande.',
      'Poste des reels de découpe sur Instagram ou TikTok — Canva AI pour le texte. Boucher artisan visible = clientèle locale fidèle et commandes événementielles sans démarcher.',
      'Utilise Marketman AI ou Choco AI pour suivre ton stock et tes coûts matières — Réduction des pertes, commandes optimisées selon les ventes de la semaine. Tu pilotes ta marge sans Excel, en 10 minutes.',
    ], secteur: 'manuels-artisanat-transport' },

  { slug: 'coiffeur', label: 'Coiffeur', risk: 6, horizon: 10, status: 'protege',
    dynamic: 'L\'IA ne te remplace pas. Geste fin sur cheveu vivant + relation de confiance + contact physique : profondément humain. La demande reste solide même en récession.',
    sources: [21], quadrant: 'tiens', potential: 30, leviers: [
      'Déploie Planity ou Treatwell — Prise de rendez-vous en ligne optimisée par IA, relances automatiques des clients inactifs. Tu remplis ton agenda sans décrocher ton téléphone entre deux coupes.',
      'Utilise ChatGPT pour préparer des scripts de conseil personnalisés par profil capillaire — Type de cheveu, style de vie, entretien à domicile : tu proposes un accompagnement sur mesure, pas une prestation standard. Le ticket moyen monte.',
      'Poste des avant/après sur Instagram avec Canva AI pour les textes — 3 posts par semaine, 20 minutes. Le coiffeur visible localement ne fait pas de publicité : ses clients viennent en te cherchant.',
    ], secteur: 'manuels-artisanat-transport' },

  { slug: 'esthetique', label: 'Esthéticien(ne)', risk: 8, horizon: 10, status: 'protege',
    dynamic: 'L\'IA ne te remplace pas. Soins personnalisés, contact physique apaisant et conseil sur la peau spécifique du client restent humains. La demande de bien-être croît avec le stress ambiant.',
    sources: [21], quadrant: 'tiens', potential: 30, leviers: [
      'Utilise Atolla ou Skin Genius pour les diagnostics peau — Photo du visage, analyse IA du type et des problématiques cutanées. Tu personnalises ton protocole de soin avec un argument objectif que le client comprend et valorise.',
      'Déploie Planity ou Treatwell pour la prise de rendez-vous et les relances automatiques — Tu ne passes plus ta pause à confirmer des RDV. L\'IA gère l\'agenda, toi tu fais les soins.',
      'Crée du contenu visuel avant/après avec Canva AI pour Instagram — Résultats de soins, rituels de soin du soir, conseils produits. L\'esthéticien(ne) visible localement remplit son carnet sans publicité payante.',
    ], secteur: 'manuels-artisanat-transport' },

  { slug: 'fleuriste', label: 'Fleuriste', risk: 25, horizon: 10, status: 'protege',
    dynamic: 'L\'IA ne te remplace pas. Composition florale au feeling, conseil émotionnel pour mariages/funérailles et adaptation au stock saisonnier sont irréductiblement humains. Marché de niche stable.',
    sources: [21], quadrant: 'tiens', potential: 35, leviers: [
      'Utilise Midjourney pour explorer des compositions événementielles avec tes clients mariages — Tu génères 6 bouquets différents en 10 minutes pendant la consultation. Le client choisit, tu exécutes. Zéro malentendu le jour J.',
      'Gère ton stock saisonnier avec Floral Frog AI — Commandes fournisseurs ajustées aux saisons et aux événements calendaires. Moins d\'invendus, moins de pertes, marge préservée.',
      'Utilise ChatGPT pour rédiger tes messages personnalisés de communication événements — Mariage, deuil, Saint-Valentin : textes pour tes réseaux et tes cartes-cadeaux en 5 minutes. Tu vends une émotion, pas juste des fleurs.',
    ], secteur: 'manuels-artisanat-transport' },

  // ── SANTÉ ──────────────────────────────────────────────

  { slug: 'dentiste', label: 'Dentiste', risk: 14, horizon: 10, status: 'protege',
    dynamic: 'L\'IA t\'assiste sur le diagnostic radiologique. Mais l\'intervention en bouche, la sensation tactile sur tissu vivant et la responsabilité chirurgicale restent humaines.',
    sources: [21], quadrant: 'pilotes', potential: 60, leviers: [
      'Intègre Pearl AI ou Overjet dans ta lecture de radios dentaires — Détection assistée des caries, pertes osseuses et lésions sur panoramiques. Tu valides en quelques secondes, tu expliques au patient avec les visuels annotés.',
      'Utilise ChatGPT pour tes devis, comptes rendus et fiches patient post-acte — Rédaction structurée en 2 minutes. Tu réinvestis ce temps en explications cliniques : l\'expérience patient monte, le taux d\'acceptation des plans de traitement aussi.',
      'Documente tes cas d\'IA radiologique sur les réseaux dentaires (ADF, Linked-Dentist) — Retour d\'expérience concret + résultats : premier dentiste visible sur l\'IA dans ta région = flux de patients et de stagiaires.',
    ], secteur: 'sante-care-education' },

  { slug: 'kinesitherapeute', label: 'Kinésithérapeute', risk: 10, horizon: 10, status: 'protege',
    dynamic: 'L\'IA ne te remplace pas. Manipulation thérapeutique, adaptation à la douleur du patient et accompagnement de la rééducation exigent ta présence. La demande croît avec le vieillissement.',
    sources: [21], quadrant: 'pilotes', potential: 55, leviers: [
      'Utilise ChatGPT pour générer les programmes d\'exercices personnalisés — Protocole rééducation par diagnostic, fiche patient avec illustrations exportables. Tu passes plus de temps à manipuler et observer, moins à rédiger.',
      'Intègre une app de suivi patient inter-séances — Kaia Health ou Sword Health pour maintenir l\'observance. Le patient suit ses exercices entre les séances, tu ajustes au rendez-vous suivant sur la base des données réelles.',
      'Forme-toi à l\'analyse de mouvement vidéo-assistée — PhysiTrack ou Kinovea avec IA pour objectiver le bilan postural. Argument fort auprès des médecins prescripteurs et différenciateur dans les structures de rééducation avancées.',
    ], secteur: 'sante-care-education' },

  { slug: 'veterinaire', label: 'Vétérinaire', risk: 12, horizon: 10, status: 'protege',
    dynamic: 'L\'IA t\'assiste sur le diagnostic. Mais la manipulation d\'un animal vivant, la chirurgie et la communication avec les propriétaires restent humaines. La demande explose avec la place des animaux de compagnie.',
    sources: [21], quadrant: 'pilotes', potential: 60, leviers: [
      'Intègre IDEXX VetLab avec IA pour l\'interprétation des bilans biologiques — Alertes automatiques sur les résultats hors norme, corrélations cliniques suggérées. Tu valides et tu expliques au propriétaire avec un discours clair.',
      'Utilise ChatGPT pour tes fiches client et comptes rendus post-consultation — Rédige la synthèse de la consultation et les recommandations en 2 minutes. Propriétaire mieux informé = meilleure observance du traitement.',
      'Construis une présence en ligne sur ta spécialité — Blog ou compte Instagram sur la santé animale augmentée par la technologie. Vétérinaire visible dans ta niche (chats, exotiques, chevaux) = liste d\'attente et recommandations bouche à oreille.',
    ], secteur: 'sante-care-education' },

  // ── MÉTIERS DE BUREAU SECONDAIRES ──────────────────────

  { slug: 'controller-gestion', label: 'Contrôleur de gestion', risk: 60, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute. Reporting standardisé, écarts budgétaires et tableaux de bord sont automatisés. Tu te concentres sur le partenariat business, l\'arbitrage de scenarii stratégiques et la lecture critique des données.',
    sources: [7], quadrant: 'mutes', potential: 75, leviers: [
      'Automatise ton reporting avec Power BI + Claude — Connecte tes sources de données, génère les tableaux de bord automatiquement, laisse Claude rédiger le commentaire de gestion. Tu passes de producteur à interprète stratégique.',
      'Deviens le partenaire business de ta direction — Réunions de pilotage, scénarios stratégiques, aide à la décision : c\'est là que tu construis une valeur irremplaçable. Propose un rituel mensuel de revue stratégique avec le CODIR.',
      'Certifie-toi en finance augmentée par IA — Le CIMA (Chartered Institute of Management Accountants) propose des modules de finance digitale. LinkedIn Learning a des parcours « Data-Driven Finance ». Documente tes cas d\'usage.',
    ], secteur: 'cognitif-admin-finance-juridique' },

  { slug: 'auditeur', label: 'Auditeur financier', risk: 65, horizon: 5, status: 'danger',
    dynamic: 'Ton métier mute. Tests de procédures, échantillonnage et revue documentaire : automatisés à 80%. Les Big 4 réduisent leurs effectifs juniors. Mute vers le jugement professionnel, l\'audit IA et la relation client senior — c\'est là que tu tiens.',
    sources: [7], quadrant: 'mutes', potential: 70, leviers: [
      'Intègre Claude dans tes revues documentaires — Colle les contrats, procès-verbaux et annexes dans Claude pour une première passe de risques. Tu concentres ton jugement sur les points d\'attention identifiés, pas sur la lecture exhaustive.',
      'Repositionne-toi sur l\'audit des systèmes IA — Les entreprises déploient des IA de gestion sans protocole de contrôle. L\'auditeur capable de challenger les modèles IA et leurs biais est une compétence rare et très demandée dans les Big 4.',
      'Vise la certification en audit des systèmes d\'information — CISA (Certified Information Systems Auditor) ou les modules IFACI sur le risque IA : ces certifications distinguent les auditeurs qui survivent à la vague des juniors automatisés.',
    ], secteur: 'cognitif-admin-finance-juridique' },

  { slug: 'chargee-clientele', label: 'Chargé(e) de clientèle', risk: 60, horizon: 5, status: 'danger',
    dynamic: 'Ton métier mute. Conseil transactionnel basique, ouverture de compte et mise à jour de dossiers sont automatisés. Pivote vers le conseil patrimonial et la gestion de relation client complexe — là où la banque de détail investit encore.',
    sources: [3], quadrant: 'mutes', potential: 55, leviers: [
      'Utilise Claude pour préparer chaque entretien client en 5 minutes — Synthèse du portefeuille, alertes sur les contrats arrivant à terme, opportunités de conseil : l\'IA fait le diagnostic, toi tu fais la relation.',
      'Monte vers le conseil patrimonial — Épargne, retraite, transmission : ces sujets exigent écoute, adaptation et confiance. Demande à ton manager un portefeuille de clients premium et les outils qui vont avec.',
      'Prépare l\'habilitation AMF ou une certification patrimoniale — L\'habilitation AMF et le DU gestion de patrimoine (disponibles en formation continue) sont les passeports vers les postes qui recrutent dans les banques privées et les CGP.',
    ], secteur: 'cognitif-admin-finance-juridique' },

  { slug: 'gestionnaire-paie', label: 'Gestionnaire de paie', risk: 68, horizon: 5, status: 'danger',
    dynamic: 'Ton métier mute. La paie standardisée est entièrement automatisée par les SIRH modernes. Tu te repositionnes sur la conformité multi-conventions, les cas d\'expatriation et la gouvernance des outils de paie IA.',
    sources: [3], quadrant: 'mutes', potential: 50, leviers: [
      'Maîtrise le SIRH de ton entreprise de bout en bout — ADP, Silae, Sage Paie : ceux qui configurent, paramètrent et déboguent l\'outil sont les derniers à partir. Deviens la référente technique interne.',
      'Repositionne-toi sur les conventions collectives complexes et la conformité — Paie des expatriés, gestion des multi-contrats, conventions atypiques : l\'IA rate ces cas, toi tu les maîtrises. C\'est ton territoire de valeur.',
      'Vise la certification CPFH ou le titre de responsable paie — La formation continue en droit social et paie complexe (via GERESO ou EFB) te distingue du gestionnaire de paie standardisée que le SIRH remplace.',
    ], secteur: 'cognitif-admin-finance-juridique' },

  { slug: 'documentaliste', label: 'Documentaliste', risk: 70, horizon: 5, status: 'danger',
    dynamic: 'Ton métier se contracte. Indexation, classement et recherche documentaire sont des fonctions natives des LLM. Le marché se resserre sur les contextes spécialisés — droit, médecine, archives — bascule vers ces niches sans attendre.',
    sources: [3], quadrant: 'pivotes', potential: 25, leviers: [
      'Pilote un outil de RAG (recherche augmentée) sur ta base documentaire — Teste Notion AI ou un outil de knowledge management interne pour créer un assistant documentaire. Être celui qui a construit le système te met à l\'abri.',
      'Pivote vers la gouvernance et la qualité de l\'information — Taxonomie, métadonnées, politique d\'archivage, conformité réglementaire : ces fonctions de pilotage stratégique de l\'information résistent à l\'automatisation.',
      'Spécialise-toi dans un domaine à haute exigence — Documentation juridique, médicale ou technique industrielle : la responsabilité sectorielle justifie encore un humain expert. Des formations via l\'ADBS (Association des professionnels de l\'information) existent.',
    ], secteur: 'cognitif-admin-finance-juridique' },

  { slug: 'archiviste', label: 'Archiviste', risk: 50, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute. La numérisation et l\'OCR cognitif transforment le métier de manipulation physique en métier de gouvernance numérique des fonds. La conservation patrimoniale reste humaine.',
    sources: [3], quadrant: 'mutes', potential: 50, leviers: [
      'Déploie Whisper pour transcrire tes archives audio et Claude pour l\'OCR de manuscrits — Indexation sémantique automatique, recherche vectorielle dans tes fonds : tu passes de l\'indexation manuelle à la gouvernance du savoir numérique.',
      'Repositionne-toi sur la gouvernance des fonds numériques et la médiation patrimoniale — L\'IA indexe ; toi tu décides ce qui mérite d\'être préservé, comment le rendre accessible et quelle histoire il raconte. C\'est un rôle de conservateur augmenté.',
      'Monte en compétences sur les bases vectorielles (Pinecone, Weaviate) et l\'IA documentaire — Formation en ligne EBSI ou modules Archimag IA. Deviens la référence qui sait transformer un fonds en base de connaissance interrogeable.',
    ], secteur: 'marketing-comm-management' },

  { slug: 'bibliothecaire', label: 'Bibliothécaire', risk: 35, horizon: 10, status: 'mutation',
    dynamic: 'Ton métier mute. Le conseil de lecture et la médiation culturelle deviennent le cœur du métier, à mesure que le catalogage et la recherche se font naturellement par IA.',
    sources: [21], quadrant: 'mutes', potential: 45, leviers: [
      'Intègre des outils de recommandation IA dans tes espaces — Algorithmes de suggestion de lecture personnalisée, chatbot de recherche documentaire basé sur Claude : tu transformes la bibliothèque en espace de découverte augmentée.',
      'Repositionne-toi sur la médiation culturelle et la lutte contre la désinformation — Dans un monde saturé de contenus générés, ta compétence de sélection critique et de curation de sources fiables devient stratégique. Anime des ateliers info-vérification.',
      'Développe une expertise en humanités numériques et data curation — Formation Enssib IA ou modules en ligne sur les embeddings documentaires. Positionnement rare qui ouvre vers les archives nationales, les musées et les bibliothèques universitaires.',
    ], secteur: 'marketing-comm-management' },

  { slug: 'agent-immobilier', label: 'Agent immobilier', risk: 50, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute. Annonces, qualification de prospects et descriptifs : automatisés. La valeur se déplace vers la négociation, la connaissance fine du quartier et la gestion émotionnelle des transactions.',
    sources: [9], quadrant: 'mutes', potential: 55, leviers: [
      'Utilise ChatGPT pour générer tes fiches biens et descriptifs d\'annonces — 5 versions en 3 minutes, A/B testing automatique sur les portails. Tu libères ton temps pour les visites et la négociation.',
      'Repositionne-toi sur la connaissance hyper-locale et la gestion émotionnelle — L\'IA te sort les prix au m² ; toi tu sais pourquoi cet immeuble est mieux que l\'autre, et tu accompagnes un acheteur stressé à 300 000 €. Ça ne s\'automatise pas.',
      'Développe ta visibilité locale en ligne — Chaîne YouTube de visites commentées, avis Google optimisés, partenariats notaires locaux. Ta réputation de terrain est ton actif principal que l\'IA ne peut pas copier.',
    ], secteur: 'marketing-comm-management' },

  { slug: 'gestionnaire-stock', label: 'Gestionnaire de stock', risk: 62, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute. Prévision de demande, optimisation de réapprovisionnement et inventaires sont automatisés. Tu deviens orchestrateur d\'exceptions et négociateur fournisseurs - ou tu es remplacé.',
    sources: [3], quadrant: 'mutes', potential: 60, leviers: [
      'Déploie SAP IBP AI ou Manhattan Associates AI sur ton réapprovisionnement — Prévision de demande, alertes de rupture, optimisation des niveaux de stock : l\'IA tourne en continu, toi tu gères les exceptions et les fournisseurs critiques.',
      'Repositionne-toi sur la gestion des risques de rupture et la relation fournisseurs — Pénuries, délais, substitutions : c\'est l\'arbitrage humain dans l\'urgence que l\'IA ne fait pas. C\'est là que ta valeur est visible pour le management.',
      'Certifie-toi APICS CPIM ou vise une formation WMS + IA — Les certifications APICS couplées à la maîtrise d\'un WMS intelligent (SAP EWM, Manhattan) sont les signaux qui font la différence sur le marché de la supply chain.',
    ], secteur: 'sciences-ingenierie' },

  { slug: 'logisticien', label: 'Logisticien', risk: 45, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute. Planification, routage et optimisation sont accélérés 10x par l\'IA. Tu te concentres sur la gestion des aléas, les relations transporteurs et l\'arbitrage stratégique multi-sites.',
    sources: [3], quadrant: 'mutes', potential: 60, leviers: [
      'Pilote OptimoRoute AI ou Project44 AI sur ta planification de tournées et ton suivi transport — Optimisation dynamique des routes, alertes temps réel, reporting automatisé : tu passes du pilotage réactif au pilotage prédictif.',
      'Repositionne-toi sur la gestion des aléas et la négociation transporteurs — Grèves, intempéries, pics de volume imprévus : c\'est l\'arbitrage logistique dans l\'urgence qui reste humain. Documente tes cas de crise, c\'est ta preuve de valeur.',
      'Forme-toi à la supply chain digitale — Coursera Supply Chain Analytics ou certification SAP TM + IA. Le profil logisticien capable de configurer et d\'interpréter les outils IA est rare et très demandé en 3PL et grande distribution.',
    ], secteur: 'sciences-ingenierie' },

  // ── COMMUNICATION & MARKETING ──────────────────────────

  { slug: 'redacteur-publicitaire', label: 'Rédacteur publicitaire / Copywriter', risk: 70, horizon: 2, status: 'danger',
    dynamic: 'Ton métier mute. La production de copies, slogans et A/B variants est devenue triviale pour les LLM. Tu pilotes les agents, tu crées la stratégie et la signature — ou tu becomes le prestataire le moins cher. Le choix est maintenant.',
    sources: [1], quadrant: 'mutes', potential: 60, leviers: [
      'Construis ton workflow IA de production de copies — Claude pour les variants, toi pour la voix, l\'angle et le brief stratégique. Documente ton process et propose-le à tes clients comme une offre de volume augmenté.',
      'Repositionne-toi sur la stratégie de message et la direction créative — Le brief créatif, l\'architecture de marque, la hiérarchie des messages : l\'IA exécute, toi tu décides quoi dire et pourquoi. C\'est là que la valeur se reconstruit.',
      'Développe ta signature publique — Portfolio de cas, publication de tes analyses de campagne sur LinkedIn, conférences sectorielles : dans un monde où les copies se commoditisent, ta réputation est ton seul différenciateur durable.',
    ], secteur: 'cognitif-admin-finance-juridique' },

  { slug: 'responsable-com', label: 'Responsable communication', risk: 45, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute. Production de contenus, communiqués et reporting sont automatisés. Tu deviens stratège éditorial, gestionnaire de crise et garant de la marque - la part politique et humaine du rôle.',
    sources: [1], quadrant: 'mutes', potential: 65, leviers: [
      'Intègre Claude ou ChatGPT dans ta chaîne de production de communiqués et contenus — Première version en 5 minutes, toi tu arbitres le ton, la validation juridique et le timing. Gagne 3h par semaine dès maintenant.',
      'Repositionne-toi sur la communication de crise et la réputation de marque — Meltwater AI surveille les signaux, Cision agrège les retombées. Toi tu prends les décisions que personne d\'autre ne peut prendre sous pression.',
      'Publie ta veille IA comm sur LinkedIn ou en interne — Newsletter hebdo sur ce que l\'IA change dans la com institutionnelle. En 6 mois, tu deviens la référence que les directions viennent consulter.',
    ], secteur: 'marketing-comm-management' },

  { slug: 'social-media-manager', label: 'Social Media Manager', risk: 55, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute. Création de posts, programmation et reporting analytics : automatisés. Tu te concentres sur la stratégie, la gestion de communauté authentique et la réaction de crise.',
    sources: [9], quadrant: 'mutes', potential: 65, leviers: [
      'Automatise la production de contenu avec Jasper ou Writesonic + Buffer AI — Calendrier éditorial généré, visuels Canva AI déclinés, scheduling automatique. Tu libères 60% de ton temps pour l\'engagement réel.',
      'Repositionne-toi sur la stratégie de croissance et l\'analyse de performance — GA4 + AI insights, Brandwatch pour la veille : tu interprètes les signaux, tu décides la direction. L\'IA exécute, toi tu ajustes.',
      'Monte une expertise Ads IA et complète la certification Meta AI ou Google Skillshop AI — Le Social Media Manager qui pilote les campagnes IA vaut trois fois celui qui poste du contenu manuellement.',
    ], secteur: 'marketing-comm-management' },

  { slug: 'event-manager', label: 'Chef de projet événementiel', risk: 28, horizon: 10, status: 'protege',
    dynamic: 'L\'IA t\'assiste sur la coordination logistique. Mais la gestion en temps réel d\'un événement vivant, les relations VIP et l\'adaptation aux imprévus restent fondamentalement humains.',
    sources: [21], quadrant: 'tiens', potential: 40, leviers: [
      'Intègre Monday.com AI ou Asana AI pour gérer ta coordination fournisseurs et ton rétroplanning — Alertes automatiques, relances prestataires, gestion des tâches critiques : tu passes moins de temps à la logistique, plus à la direction artistique et aux relations.',
      'Capitalise ta valeur sur la gestion de crise et les relations VIP — L\'IA optimise un planning, elle ne gère pas un CEO qui arrive en retard ou un traiteur qui annule à J-2. C\'est ton territoire exclusif.',
      'Obtiens une certification CSEP (Certified Special Events Professional) et documente tes événements en cas d\'étude — Portfolio d\'événements bien photographiés + témoignages clients : ta réputation est le seul actif marketing qui compte dans l\'événementiel.',
    ], secteur: 'marketing-comm-management' },

  { slug: 'photographe', label: 'Photographe', risk: 40, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute. La génération d\'images IA commoditise la photo de stock et publicitaire. Subsistent le portrait, l\'événementiel intime et le photojournalisme de terrain - la photo "qui a été là".',
    sources: [9], quadrant: 'mutes', potential: 50, leviers: [
      'Intègre Lightroom AI et Photoshop Generative Fill dans ton post-traitement — Retouche, détourage, extension de cadre : ce qui prenait 1h prend 10 minutes. Tu te concentres sur la prise de vue et la direction artistique.',
      'Repositionne-toi sur les segments IA-résistants — Portrait corporate de direction, mariage, reportage humanitaire, photojournalisme d\'événement : la présence physique et la relation humaine créent ce que Midjourney ne peut pas produire.',
      'Documente et publie ta workflow IA + éthique photographique — Les clients entreprise cherchent des photographes qui savent utiliser l\'IA sans perdre leur ADN. Un article ou une conférence sur ce sujet te positionne en pionnier.',
    ], secteur: 'marketing-comm-management' },

  { slug: 'videaste', label: 'Vidéaste / Monteur', risk: 50, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute. Génération vidéo et montage automatique progressent vite. Tu te concentres sur la direction artistique, la captation singulière et la narration - la valeur de l\'œil.',
    sources: [9], quadrant: 'mutes', potential: 55, leviers: [
      'Intègre DaVinci Resolve Studio AI et Runway Gen-3 dans ta chaîne de montage — Sous-titrage automatique, color grading IA, transitions générées : tu gardes la direction artistique, l\'IA fait l\'exécution répétitive.',
      'Repositionne-toi sur la narration et la captation en conditions réelles — Les vidéos corpo générées par IA sont propres mais vides. Ton oeil, ta direction de tournage, tes interviews terrain : c\'est le contenu qui garde de la valeur.',
      'Monte une offre hybride IA + captation et communique dessus — "Je produis 3x plus vite grâce à l\'IA, au même niveau de qualité." Pitch clair, portfolio IA visible : tu décroches des budgets que les vidéastes non-IA ne peuvent pas tenir.',
    ], secteur: 'marketing-comm-management' },

  // ── ÉDUCATION & FORMATION ──────────────────────────────

  { slug: 'enseignant-college', label: 'Enseignant collège / lycée', risk: 8, horizon: 10, status: 'protege',
    dynamic: 'L\'IA ne te remplace pas. Autorité pédagogique, médiation des conflits, transmission de la culture commune et présence physique sont au cœur de la mission éducative.',
    sources: [6], quadrant: 'pilotes', potential: 60, leviers: [
      'Utilise Khanmigo ou Magic School AI pour personnaliser tes exercices — Différenciation par élève en quelques minutes. Tu te concentres sur le présentiel et le suivi humain.',
      'Repositionne-toi sur la médiation et l\'éducation à l\'IA — Tes élèves vont l\'utiliser quoi qu\'il arrive. Apprends-leur à l\'utiliser bien : sources, esprit critique, biais.',
      'Forme-toi via INSPÉ ou DPC IA pédagogie — DeepLearning.AI Generative AI for Educators + ressources Eduscol. Différenciateur fort pour les postes en pilotage pédagogique.',
    ], secteur: 'sante-care-education' },

  { slug: 'enseignant-primaire', label: 'Enseignant primaire', risk: 6, horizon: 10, status: 'protege',
    dynamic: 'L\'IA ne te remplace pas. Apprentissage des fondamentaux, socialisation et structure affective ne peuvent être délégués à une machine. La demande structurelle est forte.',
    sources: [6], quadrant: 'tiens', potential: 35, leviers: [
      'Utilise Magic School AI ou Canva AI pour préparer tes supports de cours — Fiches illustrées, exercices différenciés par niveau, évaluations formatrices en 10 minutes. Tu passes ton énergie sur la classe, pas sur la photocopieuse.',
      'Repositionne-toi sur la détection précoce et l\'accompagnement individualisé — Les outils IA traitent le groupe. Toi tu repères l\'enfant qui décroche, qui présente un trouble non diagnostiqué. C\'est ce que les parents et les directions apprécient et paient.',
      'Intègre les ressources Eduscol IA primaire dans ta pratique — Quizlet AI, outils de lecture assistée : montre à tes collègues et parents d\'élèves comment utiliser l\'IA intelligemment. Référent numérique dans ton école = évolution professionnelle.',
    ], secteur: 'sante-care-education' },

  // ── TRANSPORT & MOBILITÉ ───────────────────────────────

  { slug: 'pilote-ligne', label: 'Pilote de ligne', risk: 18, horizon: 10, status: 'protege',
    dynamic: 'L\'IA t\'assiste massivement, mais la responsabilité finale, la gestion de crise (Hudson River) et la conformité réglementaire (deux pilotes minimum) garantissent la profession encore longtemps.',
    sources: [21], quadrant: 'tiens', potential: 45, leviers: [
      'Exploite ForeFlight avec IA ou NaviAir AI pour tes briefings pré-vol — Météo augmentée, NOTAMs synthétisés, analyse de route optimisée en 5 minutes. Tu arrives au briefing mieux préparé que la majorité.',
      'Utilise ChatGPT pour ta formation continue et tes révisions de procédures — Scénarios d\'urgence, questions ATPL, quiz personnalisés selon tes lacunes identifiées. Révisions plus efficaces, heure de simulateur mieux utilisée.',
      'Documente ta montée en expertise sur les systèmes automatisés — FMS, TCAS, autothrottle IA : un pilote qui comprend et explique l\'automatisation devient instructeur de référence et consultant sécurité.',
    ], secteur: 'manuels-artisanat-transport' },

  { slug: 'controleur-aerien', label: 'Contrôleur aérien', risk: 30, horizon: 10, status: 'protege',
    dynamic: 'L\'IA t\'assiste, mais la responsabilité légale absolue de la séparation aérienne et la gestion d\'incidents restent humaines. La demande explose avec la croissance du trafic post-COVID.',
    sources: [21], quadrant: 'tiens', potential: 40, leviers: [
      'Maîtrise les systèmes de gestion de trafic augmentés IA (SESAR/iTEC) — Séparation assistée, prédiction de conflits, optimisation de flux : comprendre ce que fait l\'outil te rend plus efficace et plus sûr que ceux qui l\'utilisent passivement.',
      'Utilise ChatGPT pour préparer tes sessions de formation continue — Scénarios d\'urgence, phraséologie OACI, gestion de trafic intense. Révisions plus ciblées, moins de temps passé sur ce que tu maîtrises déjà.',
      'Capitalise sur ton expertise pour viser des rôles de supervision ou de formation — Instructeur OJT, inspecteur DGAC : l\'IA augmente la capacité des contrôleurs en place, elle ne crée pas les experts de demain.',
    ], secteur: 'manuels-artisanat-transport' },

  { slug: 'conducteur-train', label: 'Conducteur de train', risk: 35, horizon: 10, status: 'mutation',
    dynamic: 'Ton métier mute lentement. Lignes automatisées (métro, certaines LGV) progressent, mais le réseau classique et le fret nécessitent la présence d\'un conducteur - pour des raisons techniques et syndicales.',
    sources: [21], quadrant: 'tiens', potential: 40, leviers: [
      'Maîtrise les systèmes d\'aide à la conduite SNCF avec IA (ERTMS, Hercule) — Comprendre l\'outil c\'est conduire mieux et gérer les alertes avec plus de sang-froid. Tu passes de conducteur passif à opérateur technique de référence.',
      'Utilise ChatGPT pour préparer tes qualifications et révisions réglementaires — Questions d\'examen EPSF, procédures dégradées, marche à suivre sur incidents. Révisions plus rapides, confiance renforcée en situation réelle.',
      'Vise les qualifications sur lignes complexes ou fret — Le conducteur qualifié sur réseau classique + fret + grande vitesse est le profil le moins exposé à la substitution par automatisation partielle.',
    ], secteur: 'manuels-artisanat-transport' },

  { slug: 'chauffeur-taxi-vtc', label: 'Chauffeur taxi / VTC', risk: 28, horizon: 10, status: 'protege',
    dynamic: 'L\'IA ne te remplace pas tout de suite. Le robotaxi avance dans certaines villes US, mais la complexité urbaine européenne, la régulation et le service client maintiennent la demande humaine.',
    sources: [21], quadrant: 'tiens', potential: 35, leviers: [
      'Optimise tes plages horaires avec les données algorithmes Uber ou Bolt — Les apps te montrent déjà les zones à forte demande : apprends à lire les patterns et à te positionner avant le pic. Tu gagnes 15-20% de courses sans rouler plus.',
      'Utilise ChatGPT pour gérer tes communications clients et tes avis Google — Réponse aux avis négatifs, message de bienvenue personnalisé, fidélisation clientèle régulière. Ta note moyenne monte, ta visibilité aussi.',
      'Démarque-toi sur le segment premium ou santé — Véhicule adapté PMR, transport médical non urgent : certifications TPMR. Moins de concurrence, tarif supérieur, clients récurrents institutionnels.',
    ], secteur: 'manuels-artisanat-transport' },

  // ── MÉTIERS SCIENTIFIQUES ──────────────────────────────

  { slug: 'biologiste', label: 'Biologiste / Chercheur en biologie', risk: 28, horizon: 10, status: 'mutation',
    dynamic: 'Ton métier mute. L\'IA accélère drastiquement le criblage moléculaire, la génomique et la rédaction d\'articles. La paillasse expérimentale et la conception d\'hypothèses restent humaines.',
    sources: [21], quadrant: 'mutes', potential: 70, leviers: [
      'Intègre AlphaFold + Benchling AI dans ta paillasse — Prédictions de structures protéiques en heures, suivi d\'expériences automatisé. Tu te concentres sur l\'hypothèse et la validation.',
      'Repositionne-toi sur la conception d\'expériences et la critique des résultats IA — Causaly et BenchSci accélèrent la revue de littérature, mais le sense-making biologique reste humain.',
      'Forme-toi au ML appliqué à la bio — Coursera AlphaFold 2 ou DeepLearning.AI Specialization. Compétence ultra-recherchée en biotech et pharma 2026.',
    ], secteur: 'sciences-ingenierie' },

  { slug: 'chimiste', label: 'Chimiste', risk: 32, horizon: 10, status: 'mutation',
    dynamic: 'Ton métier mute. Le design de molécules par IA et la simulation de réactions accélèrent la R&D. Tu te concentres sur la formulation, la validation expérimentale et l\'industrialisation.',
    sources: [21], quadrant: 'mutes', potential: 70, leviers: [
      'Pilote ChemAI ou Reaxys AI pour accélérer ta veille de synthèse et ton design moléculaire — Des milliers de routes de synthèse analysées en minutes. Tu arbitres la faisabilité expérimentale, l\'IA génère les candidats.',
      'Repositionne-toi sur la formulation avancée et la validation réglementaire — REACH, GHS, dossiers d\'homologation : la responsabilité chimiste sur la conformité et l\'industrialisation est inaliénable. C\'est là que ta valeur est verrouillée.',
      'Forme-toi au ML moléculaire — DeepLearning.AI AI for Drug Discovery ou Wolfram U pour la chimie computationnelle. Profil chimiste x IA : rare, très demandé en pharma et chimie spécialisée.',
    ], secteur: 'sciences-ingenierie' },

  { slug: 'physicien', label: 'Physicien / Chercheur en physique', risk: 25, horizon: 10, status: 'mutation',
    dynamic: 'Ton métier mute. L\'IA accélère le traitement de données expérimentales massives (collisionneurs, télescopes). La théorie, l\'hypothèse et l\'expérimentation conceptuelle restent humaines.',
    sources: [21], quadrant: 'mutes', potential: 65, leviers: [
      'Automatise l\'analyse de tes jeux de données avec TensorFlow/PyTorch + Jupyter AI — Traitement de signaux, réduction dimensionnelle, détection d\'anomalies : tu libères du temps pour la modélisation théorique.',
      'Repositionne-toi sur la physique computationnelle et les simulations à grande échelle — COMSOL + IA ou Wolfram Mathematica : la capacité à coupler simulation numérique et hypothèse physique est ton avantage durable.',
      'Capitalise sur ta rigueur expérimentale pour piloter des projets IA industriels — Quantique, photonique, capteurs : les industriels (Thales, CEA, Airbus) recrutent des physiciens capables de valider des modèles IA. C\'est le pivot le plus rentable.',
    ], secteur: 'sciences-ingenierie' },

  { slug: 'ingenieur-civil', label: 'Ingénieur civil / BTP', risk: 28, horizon: 10, status: 'protege',
    dynamic: 'L\'IA t\'assiste sur la modélisation et le calcul de structures. Mais la responsabilité d\'ouvrage, la coordination chantier et l\'adaptation au réel restent humaines. La transition énergétique soutient la demande.',
    sources: [21], quadrant: 'tiens', potential: 45, leviers: [
      'Maîtrise le BIM augmenté IA avec Revit AI ou Bentley OpenBuildings — Détection de conflits, optimisation structurelle et suivi chantier via drones + photogrammétrie : tu gagnes en visibilité terrain sans y passer tes journées.',
      'Capitalise ta responsabilité d\'ouvrage comme avantage concurrentiel — Calculs de structures, conformité Eurocodes, certification CE : c\'est la signature légale que l\'IA ne peut pas assumer. Positionne-toi là.',
      'Forme-toi à Autodesk Forma ou Spacemaker pour la conception durable — Ces outils IA analysent ensoleillement, ventilation et bilan carbone en amont. Compétence clé pour les marchés rénovation énergétique et construction bas-carbone.',
    ], secteur: 'sciences-ingenierie' },

  { slug: 'architecte', label: 'Architecte', risk: 38, horizon: 10, status: 'mutation',
    dynamic: 'Ton métier mute. La génération de plans et de rendus par IA commoditise une partie de la production. Tu te concentres sur la signature artistique, le dialogue client et la maîtrise réglementaire.',
    sources: [21], quadrant: 'mutes', potential: 60, leviers: [
      'Intègre Spacemaker (Autodesk Forma) ou Finch3D dans ta conception — Analyse d\'ensoleillement, densité, simulation thermique en temps réel. Tu explores 10x plus de partis architecturaux avant même de présenter au client.',
      'Repositionne-toi sur la maîtrise d\'œuvre et la responsabilité décennale — Permis de construire, conformité PLU/RT2020, coordination MOE : c\'est la responsabilité légale de l\'architecte signataire que l\'IA ne peut pas assumer.',
      'Forme-toi au BIM manageur IA — Revit AI + certification BIM Level 2 ou 3. Les maîtres d\'ouvrage publics et privés exigent le BIM ; maîtriser la couche IA te place en architecte coordinateur plutôt qu\'exécutant.',
    ], secteur: 'sciences-ingenierie' },

  { slug: 'urbaniste', label: 'Urbaniste', risk: 32, horizon: 10, status: 'mutation',
    dynamic: 'Ton métier mute. Modélisation urbaine et études d\'impact sont accélérées par l\'IA. Tu te concentres sur la concertation publique, l\'arbitrage politique et la vision territoriale long-terme.',
    sources: [21], quadrant: 'mutes', potential: 55, leviers: [
      'Pilote Spacemaker AI ou TestFit pour tes études de capacité urbaine — Simulation de scénarios d\'aménagement, impact carbone, densité : tu produis 5x plus de variantes en phase d\'études préalables.',
      'Repositionne-toi sur la gouvernance territoriale et la concertation — SCoT, PLU bioclimatique, ZAN : les arbitrages entre parties prenantes et la responsabilité réglementaire restent irréductiblement humains. C\'est ton cœur de valeur.',
      'Maîtrise les outils de données urbaines ouvertes + IA — QGIS + Python + données INSEE / OpenStreetMap : l\'urbaniste qui produit ses propres analyses spatiales augmentées est rare et très demandé dans les agences d\'urbanisme et collectivités.',
    ], secteur: 'sciences-ingenierie' },

  // ── DIVERS ─────────────────────────────────────────────

  { slug: 'directeur-general', label: 'Directeur général / CEO', risk: 15, horizon: 10, status: 'protege',
    dynamic: 'L\'IA ne te remplace pas. Vision, arbitrage stratégique, leadership et responsabilité ultime restent humains par construction. L\'IA t\'assiste sur l\'analyse, mais pas sur la décision.',
    sources: [21], quadrant: 'pilotes', potential: 60, leviers: [
      'Construis ton dashboard de pilotage augmenté — Notion AI ou Claude Projects branché sur tes KPIs business + benchmarks marché. Tu arbitres sur des données fraîches, pas des slides obsolètes.',
      'Repositionne-toi sur la vision et l\'orchestration humaine — L\'IA fait l\'analyse ; toi tu décides, tu motives, tu arbitres les conflits internes. Ton leadership devient le différenciateur ultime.',
      'Forme-toi à l\'AI Strategy — HEC AI Business ou Reforge AI Strategy. Compétence de board attendue dès 2026. Documente publiquement comment tu intègres l\'IA dans la boîte.',
    ], secteur: 'juridique-extra-securite-divers' },

  { slug: 'directeur-financier', label: 'Directeur financier (CFO)', risk: 30, horizon: 10, status: 'mutation',
    dynamic: 'Ton métier mute. Reporting et consolidation accélérés par l\'IA. Tu deviens partenaire stratégique du CEO, gestionnaire de la communication financière et arbitre des arbitrages capital-allocation.',
    sources: [7], quadrant: 'mutes', potential: 65, leviers: [
      'Déploie Anaplan ou Workday Adaptive avec IA pour tes cycles de planification financière — Scénarios en temps réel, consolidation automatisée, alertes sur les écarts budgétaires. Tu passes de la production de chiffres à l\'interprétation stratégique.',
      'Repositionne-toi comme partenaire business du CEO — L\'IA produit le reporting ; toi tu arbitres les allocations de capital, tu gères les relations investisseurs, tu portes la vision financière de long terme. Ce rôle de conseil ne se délègue pas.',
      'Forme-toi via Bloomberg Terminal AI et les modules AI for Finance de HEC ou Wharton Online — Compétence attendue par les boards dès 2026. Le CFO qui pilote ses outils IA est plus crédible face aux actionnaires et aux analystes.',
    ], secteur: 'juridique-extra-securite-divers' },

  { slug: 'comedien', label: 'Comédien / Acteur', risk: 28, horizon: 10, status: 'protege',
    dynamic: 'L\'IA t\'imite (deepfake, voix synthétique). Mais la présence scénique, la prise de risque corporel et la connexion incarnée avec un public restent humaines. Le secteur se polarise vers les noms et l\'authenticité.',
    sources: [21], quadrant: 'tiens', potential: 40, leviers: [
      'Utilise ChatGPT pour préparer tes auditions et analyser tes personnages — Génère des questions que le réalisateur pourrait poser, explore la psychologie du rôle, construis ton backstory. Tu arrives plus préparé que les autres candidats.',
      'Documente ton processus créatif sur les réseaux sociaux avec Canva AI — Coulisses de répétitions, réflexions sur les rôles, extraits de performances. Ta signature artistique se construit publiquement ; c\'est elle qui génère les opportunités.',
      'Forme-toi à l\'éthique IA et aux contrats deepfake avec la BBC Academy ou les syndicats d\'acteurs — Savoir négocier les clauses de droits à l\'image face aux studios est devenu une compétence vitale. L\'acteur informé protège son patrimoine artistique.',
    ], secteur: 'juridique-extra-securite-divers' },

  { slug: 'musicien', label: 'Musicien / Compositeur', risk: 35, horizon: 10, status: 'mutation',
    dynamic: 'Ton métier mute. La musique générative IA inonde le streaming. Tu te concentres sur la performance live, la signature artistique forte et la création d\'œuvres incarnées.',
    sources: [21], quadrant: 'mutes', potential: 45, leviers: [
      'Utilise Suno ou ElevenLabs pour générer des maquettes et explorer des directions musicales — L\'IA produit les brouillons sonores, toi tu sélectionnes, tu raffines, tu signes. Tu passes moins de temps sur les démos, plus sur la composition qui compte.',
      'Construis ta marque artistique via les réseaux avec ChatGPT pour le texte et Canva AI pour les visuels — La musique IA générique ne remplace pas la narrativité d\'un artiste avec une histoire. Ta signature est ton meilleur rempart.',
      'Forme-toi aux droits d\'auteur à l\'ère IA via Berklee Online ou la SACEM — Les contrats d\'exploitation et les clauses IA évoluent vite. L\'artiste qui comprend ses droits négocie mieux avec les labels et les plateformes.',
    ], secteur: 'juridique-extra-securite-divers' },

  { slug: 'artiste-plasticien', label: 'Artiste plasticien', risk: 30, horizon: 10, status: 'mutation',
    dynamic: 'Ton métier mute. La génération d\'images IA bouleverse le marché. La valeur se déplace vers la pratique incarnée, la signature et le récit conceptuel. Le marché de l\'art récompense le geste irréductible.',
    sources: [21], quadrant: 'mutes', potential: 40, leviers: [
      'Intègre Midjourney ou Adobe Firefly dans ta phase d\'exploration créative — Génère des centaines de variations conceptuelles en quelques heures. Tu affines ta direction artistique plus vite, tu gardes les mains libres pour l\'œuvre finale.',
      'Renforce ton récit conceptuel et ta présence en ligne — ChatGPT pour rédiger tes notes d\'intention, Canva AI pour tes dossiers de candidature. Les galeries et les collectionneurs achètent une démarche autant qu\'une œuvre.',
      'Explore les résidences et prix "art & IA" — Ce territoire est jeune et peu encombré. L\'artiste plasticien qui intègre l\'IA comme médium (pas comme substitut) crée une niche propre et attire une attention éditoriale forte.',
    ], secteur: 'juridique-extra-securite-divers' },

  { slug: 'sportif-pro', label: 'Sportif professionnel', risk: 0, horizon: 10, status: 'protege',
    dynamic: 'L\'IA ne te remplace pas. La performance physique et l\'incarnation du jeu restent humaines par essence. Le secteur monétise même l\'IA pour optimiser l\'entraînement et l\'analyse vidéo.',
    sources: [21], quadrant: 'tiens', potential: 25, leviers: [
      'Optimise ta préparation avec Hudl ou Catapult AI — Analyse vidéo de tes performances, détection des points d\'amélioration. Tu progresses plus vite sans changer ton volume d\'entraînement.',
      'Capitalise sur ton image et ton récit — Documente ton parcours sur les réseaux avec Canva AI + ChatGPT. Ta valeur d\'athlète passe aussi par ta narration personnelle.',
      'Prépare l\'après-carrière maintenant — Coach mental, content creator, consultant tactique. Forme-toi à l\'IA générique (DeepLearning.AI gratuit) pour avoir des cordes hors-stade.',
    ], secteur: 'juridique-extra-securite-divers' },

  { slug: 'guide-touristique', label: 'Guide touristique', risk: 35, horizon: 10, status: 'protege',
    dynamic: 'L\'IA t\'assiste mais ne te remplace pas. Le récit incarné sur le lieu, l\'adaptation au groupe et l\'authenticité restent demandés. Le tourisme expérientiel soutient la profession.',
    sources: [21], quadrant: 'tiens', potential: 40, leviers: [
      'Prépare tes visites avec ChatGPT adapté à chaque groupe — Profil de groupe (familles, experts, étrangers), anecdotes ciblées, FAQ anticipées. Tu arrives avec un récit sur mesure sans y passer des heures de recherche.',
      'Construis une présence sur GetYourGuide ou Airbnb Expériences avec des avis optimisés — ChatGPT pour répondre aux commentaires et rédiger ta fiche. Les plateformes te trouvent des clients ; ta réputation fait le reste.',
      'Développe des visites thématiques de niche — Architecture, gastronomie, histoire sociale, etc. L\'IA t\'aide à documenter les thèmes, toi tu incarnes l\'expérience. Les circuits de niche se vendent plus cher et fidélisent mieux.',
    ], secteur: 'juridique-extra-securite-divers' },

  // ── MÉTIERS RESTAURÉS (legacy slugs préservés depuis le scanner v0.7) ──
  // Ces entrées maintiennent les URLs `/scanner/<slug>` (et anciennes query-strings réécrites)
  // historiques pour ne pas casser les liens partagés. Le contenu est mis à niveau au schéma
  // 2026 (statut éditorial + dynamique).

  { slug: 'technicien-support', label: 'Technicien support IT', risk: 66, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute. Le dépannage logiciel et matériel de niveau 1 est pris en charge par des agents internes capables de lire les logs et guider les utilisateurs. Tu remontes en complexité ou tu te fais commoditiser.',
    sources: [3], quadrant: 'mutes', potential: 70, leviers: [
      'Intègre Intercom AI ou Zendesk AI à ton flux — Triage automatique, réponses brouillon, escalade intelligente. Tu te concentres sur les tickets niveau 2-3 que les agents ne savent pas résoudre.',
      'Repositionne-toi vers SRE ou cybersécurité — Le support de niveau 1 disparaît, mais l\'incident response, les audits de logs et la sécurité opérationnelle explosent. Ton expérience terrain est précieuse.',
      'Certifie-toi côté infra ou sécu — AWS Solutions Architect, Microsoft Cybersecurity, ou ITIL 4 + Anthropic Academy. Marché tendu sur les profils hybrides support → SRE.',
    ], secteur: 'tech-data-design' },

  { slug: 'analyste-donnees', label: 'Analyste données', risk: 67, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute. Nettoyage, agrégation et reporting standardisé sont absorbés par les agents intégrés aux plateformes BI. Tu pivotes vers la modélisation business, le storytelling data et l\'arbitrage stratégique.',
    sources: [3], quadrant: 'mutes', potential: 70, leviers: [
      'Bascule sur Hex AI Notebooks ou DataIku pour ton SQL et tes dashboards — Génération de requêtes par prompt, dashboards IA-augmentés. Tu libères 50% de ton temps sur la valeur ajoutée business.',
      'Repositionne-toi sur le storytelling data et l\'arbitrage — Les chiffres sont commoditisés, l\'interprétation ne l\'est pas. Tu deviens le pont entre data et décision business, pas le producteur du tableau.',
      'Forme-toi au ML appliqué et à la communication exécutive — DeepLearning.AI Data-Centric AI + Reforge Data Strategy. Le data analyst 2026 sait pitcher au CEO, pas juste pondre du SQL.',
    ], secteur: 'tech-data-design' },

  { slug: 'gestionnaire-projet', label: 'Gestionnaire de projet', risk: 52, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute. Suivi de tâches, comptes rendus et coordination basique sont automatisés. Tu te concentres sur la gestion humaine d\'équipe, l\'arbitrage de scope et la communication exécutive.',
    sources: [9], quadrant: 'mutes', potential: 60, leviers: [
      'Automatise tes rapports de projet avec Claude + Notion AI — Génère les comptes rendus, tableaux de bord et synthèses de réunion automatiquement. Consacre ce temps à la coordination humaine et à la gestion des risques.',
      'Repositionne-toi comme pilote de projets de transformation IA — Chaque entreprise déploie de l\'IA et cherche quelqu\'un pour gérer ces projets spécifiques. Propose-toi volontaire sur le prochain projet IA de ton équipe.',
      'Certifie-toi PMP ou PSM et ajoute un module sur l\'IA en gestion de projet — PMI propose désormais des contenus IA. Ce signal combiné à une expérience terrain te distingue des gestionnaires de projet classiques.',
    ], secteur: 'tech-data-design' },

  { slug: 'responsable-qualite', label: 'Responsable qualité', risk: 50, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute. Contrôle conformité, reporting ISO et détection d\'anomalies sont accélérés par l\'IA. Tu te recentres sur la culture qualité, la gouvernance et l\'audit stratégique des risques.',
    sources: [3], quadrant: 'mutes', potential: 55, leviers: [
      'Déploie ETQ Reliance AI ou MasterControl AI sur ton système de gestion qualité — Non-conformités, CAPA, audits : automatise le suivi et la traçabilité. Tu libères du temps pour l\'animation de la culture qualité terrain.',
      'Repositionne-toi sur la gouvernance qualité et l\'audit stratégique — Revue de direction, analyse de risques produit, interface avec les clients grands comptes : c\'est la responsabilité qualité de haut niveau que l\'IA n\'assume pas.',
      'Maîtrise le contrôle qualité par vision IA — Cognex ou Keyence + IA pour le contrôle non-destructif. Couple avec une veille réglementaire augmentée via Thomson Reuters Regulatory Intelligence. Signal fort pour les industriels.',
    ], secteur: 'sciences-ingenierie' },

  { slug: 'controleur-gestion', label: 'Contrôleur de gestion', risk: 60, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute. Reporting standardisé, écarts budgétaires et tableaux de bord sont automatisés. Tu te concentres sur le partenariat business, l\'arbitrage de scenarii stratégiques et la lecture critique des données.',
    sources: [7], quadrant: 'mutes', potential: 75, leviers: [
      'Automatise ton reporting avec Power BI + Claude — Connecte tes sources de données, génère les tableaux de bord automatiquement, laisse Claude rédiger le commentaire de gestion. Tu passes de producteur à interprète stratégique.',
      'Deviens le partenaire business de ta direction — Réunions de pilotage, scénarios stratégiques, aide à la décision : c\'est là que tu construis une valeur irremplaçable. Propose un rituel mensuel de revue stratégique avec le CODIR.',
      'Certifie-toi en finance augmentée par IA — Le CIMA (Chartered Institute of Management Accountants) propose des modules de finance digitale. LinkedIn Learning a des parcours « Data-Driven Finance ». Documente tes cas d\'usage.',
    ], secteur: 'cognitif-admin-finance-juridique' },

  { slug: 'assistant-direction', label: 'Assistant de direction', risk: 62, horizon: 5, status: 'danger',
    dynamic: 'Ton métier se contracte. Gestion d\'agendas, préparation de réunions, suivi de courriels : confiés à des agents virtuels. Bascule vers les postes proches du pouvoir exécutif où la confiance et la discrétion priment — c\'est le seul terrain solide.',
    sources: [3], quadrant: 'pivotes', potential: 30, leviers: [
      'Bascule sur le rôle Chief of Staff ou Office Manager senior — La confiance, la discrétion et la coordination stratégique restent humaines. Vise les structures où tu deviens le bras droit, pas l\'exécutant.',
      'Apprends le prompt engineering en 10h — DeepLearning.AI gratuit + Anthropic Academy. Compétence portable qui te rend précieuse face aux agents IA, plutôt que substituable par eux.',
      'Identifie le métier adjacent qui croît — Ops manager, customer success, executive coordination. Ton ADN organisationnel reste recherché, pas dans le secrétariat traditionnel.',
    ], secteur: 'cognitif-admin-finance-juridique' },

  { slug: 'chef-de-produit', label: 'Chef de produit', risk: 48, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute. Specs, user stories et roadmaps brouillons sont générés par l\'IA. Tu te concentres sur la priorisation arbitrage, l\'alignement stakeholders et la vision produit - la partie irréductiblement politique.',
    sources: [10], quadrant: 'mutes', potential: 70, leviers: [
      'Intègre Notion AI ou Asana AI dans ta gestion de roadmap — Génère les user stories, identifie les dépendances, structure tes briefs. Tu te concentres sur l\'alignement cross-fonctionnel et la décision stratégique.',
      'Repositionne ta valeur sur la définition de vision et la gestion des parties prenantes — L\'IA fait les specs techniques ; toi tu sais pourquoi on construit cette feature, pour qui, et comment convaincre l\'engineering de la prioriser.',
      'Complète la certification PSPO ou un cours IA produit (Reforge, Product School) — Affiche ta maîtrise des outils IA produit sur ton CV. Le chef de produit qui comprend les LLM et les systèmes IA est le profil le plus demandé.',
    ], secteur: 'marketing-comm-management' },

  { slug: 'responsable-logistique', label: 'Responsable logistique', risk: 45, horizon: 10, status: 'mutation',
    dynamic: 'Ton métier mute. Planification, optimisation de routes et prévision de demande sont accélérées par l\'IA. Tu deviens orchestrateur d\'exceptions, négociateur transporteurs et arbitre stratégique multi-sites.',
    sources: [3], quadrant: 'mutes', potential: 60, leviers: [
      'Déploie Blue Yonder AI ou o9 Solutions sur ta planification — Prévision de demande, optimisation de routes, alertes de rupture : 50% du pilotage opérationnel passe par l\'IA.',
      'Repositionne-toi sur la gestion d\'aléas et la stratégie multi-sites — Crises géopolitiques, ruptures fournisseurs, réorganisation du sourcing : c\'est l\'arbitrage humain qui paie, pas le tableau Excel.',
      'Forme-toi à la supply chain digitale — Anthropic Academy + AWS for Industrial ML + certification SAP IBP. Marché ultra-tendu sur les profils hybrides supply x IA.',
    ], secteur: 'sciences-ingenierie' },

  { slug: 'responsable-communication', label: 'Responsable communication', risk: 42, horizon: 10, status: 'mutation',
    dynamic: 'Ton métier mute. Production de contenus, communiqués et reporting sont automatisés. Tu deviens stratège éditorial, gestionnaire de crise et garant de la marque - la part politique et humaine du rôle.',
    sources: [1], quadrant: 'mutes', potential: 65, leviers: [
      'Déploie un stack IA comm — Claude pour les contenus, Meltwater AI pour la veille, Canva AI pour les visuels. Automatise la production, recentre ton énergie sur la stratégie narrative et les relations médias.',
      'Capitalise ta position sur la communication de crise augmentée par les données — Les signaux précoces d\'e-réputation et les scénarios de crise se modélisent avec l\'IA. Toi tu décides comment répondre : c\'est irremplaçable.',
      'Obtiens la certification Reforge AI Strategy ou un module IA executive (HEC, Sciences Po) — Positionne-toi comme le profil qui fait le pont entre direction et équipes créatives à l\'ère IA. Rare, valorisé.',
    ], secteur: 'marketing-comm-management' },

  { slug: 'technicien-laboratoire', label: 'Technicien de laboratoire', risk: 38, horizon: 10, status: 'mutation',
    dynamic: 'Ton métier mute. Robotique de laboratoire et IA d\'interprétation des résultats accélèrent les analyses. Tu te concentres sur la mise au point de protocoles, l\'assurance qualité et l\'expertise sur cas atypiques.',
    sources: [21], quadrant: 'mutes', potential: 50, leviers: [
      'Pilote Benchling AI ou Labguru AI pour gérer tes protocoles et résultats — Traçabilité automatisée, interprétation des données brutes, alertes d\'anomalies : tu libères du temps pour la mise au point et les cas complexes.',
      'Repositionne-toi sur le contrôle qualité et la validation des résultats IA — Les analyses IA génèrent des faux positifs que seul un technicien expérimenté détecte. Ton expertise sensorielle et méthodologique reste le filtre critique.',
      'Maîtrise l\'analyse d\'images automatisée — CellProfiler ou ilastik pour la microscopie, Opentrons pour la robotique de labo. Ce savoir-faire augmenté est rare et recherché en pharma, biotech et contrôle qualité industriel.',
    ], secteur: 'sciences-ingenierie' },

  { slug: 'infographiste', label: 'Infographiste', risk: 62, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute. La génération d\'images, retouches et déclinaisons de gabarits sont commoditisées par l\'IA. La direction artistique et la signature visuelle survivent ; l\'exécution se vend de moins en moins seule.',
    sources: [1], quadrant: 'mutes', potential: 60, leviers: [
      'Intègre Adobe Firefly ou Midjourney dans ta chaîne de production — Déclinaisons, variantes de formats, retouches rapides : confie l\'exécution à l\'IA. Tu libères ton temps pour la direction créative et la relation client.',
      'Construis un portfolio de direction artistique IA — Montre que tu pilotes les outils génératifs avec un brief clair et un oeil exigeant. C\'est la preuve que tu restes le cerveau derrière la création, pas juste les mains.',
      'Forme-toi à Recraft et Magicpattern pour la création de systèmes visuels — Ces outils permettent de créer des identités visuelles cohérentes augmentées par IA. Couple avec un module en branding sur O\'Reilly Live Trainings.',
    ], secteur: 'tech-data-design' },

  { slug: 'actuaire', label: 'Actuaire', risk: 62, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute. Modélisation tarifaire, calcul de provisions et stress tests sont accélérés par l\'IA. Tu te concentres sur l\'innovation produit, la conformité Solvency et la gouvernance des modèles.',
    sources: [7], quadrant: 'mutes', potential: 65, leviers: [
      'Automatise tes modèles de tarification avec Python + Claude et H2O.ai AutoML — Génère le code des modèles standards, libère du temps pour l\'interprétation métier et la validation réglementaire Solvency.',
      'Repositionne-toi sur la gouvernance des modèles IA en assurance — L\'ACPR et l\'EIOPA exigent de l\'explicabilité sur les modèles IA décisionnels en assurance. Construis l\'expertise en gouvernance de modèle : c\'est la niche rare.',
      'Vise une certification Institute and Faculty of Actuaries (IFoA) Data Science ou CAS Predictive Analytics — Ces certifications actuarielles spécialisées IA sont rares et très valorisées par les grandes compagnies d\'assurance.',
    ], secteur: 'tech-data-design' },

  { slug: 'administrateur-sys', label: 'Administrateur système', risk: 58, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute. Provisioning, patches et monitoring sont gérés par des agents IA et des outils IaC. Tu pivotes vers SRE, sécurité opérationnelle et architecture cloud - ou tu es remplacé par un script.',
    sources: [3], quadrant: 'mutes', potential: 65, leviers: [
      'Maîtrise Pulumi AI ou Terraform Stacks pour l\'infrastructure as code — L\'IaC augmentée IA est ce qui remplace les scripts manuels. Être celui qui pilote ces outils, pas celui qui fait ce qu\'ils font, c\'est la survie.',
      'Pilote Datadog AI ou Coralogix pour le monitoring intelligent — Configure des alertes prédictives, des runbooks automatisés. Repositionne-toi comme SRE qui orchestre les agents, pas technicien qui résout les incidents.',
      'Prépare la certification AWS SysOps Administrator ou Google Cloud SRE — Ces certifications cloud SRE sont le signal de ta montée en compétence. Couple avec un module de sécurité cloud : la combo est très demandée.',
    ], secteur: 'tech-data-design' },

  { slug: 'ingenieur-reseau', label: 'Ingénieur réseau', risk: 50, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute. Configuration, troubleshooting et optimisation des liens sont automatisés. Tu te recentres sur l\'architecture réseau, la sécurité périmétrique et l\'intégration cloud-edge.',
    sources: [3], quadrant: 'mutes', potential: 55, leviers: [
      'Intègre Cisco Cloud Security AI ou Cloudflare AI Gateway dans ton stack — Ces outils automatisent la détection d\'anomalies réseau et la réponse aux incidents. Pilote-les et libère-toi du troubleshooting répétitif.',
      'Repositionne-toi sur la sécurité réseau cloud-edge — Le périmètre réseau classique a disparu avec le cloud et le remote. L\'expertise Zero Trust et SD-WAN est la valeur que les agents ne remplacent pas encore.',
      'Vise la certification CCNP Security ou AWS Advanced Networking Specialty — Ces certifications signalent ta montée vers l\'architecture. Couple avec un projet personnel de réseau cloud documenté sur GitHub.',
    ], secteur: 'tech-data-design' },

  { slug: 'responsable-si', label: 'Responsable SI / DSI', risk: 45, horizon: 10, status: 'mutation',
    dynamic: 'Ton métier mute. La gouvernance IT classique cède la place à la gouvernance des agents IA, de la donnée et des risques cyber. Tu deviens stratège technologique au service du métier - pas administrateur d\'infrastructure.',
    sources: [4], quadrant: 'mutes', potential: 60, leviers: [
      'Pilote ton premier déploiement d\'agent IA interne cette semaine — Choisis un use case concret (support IT, synthèse de réunions, documentation). C\'est ta preuve de compétence en gouvernance IA, pas un projet théorique.',
      'Construis la politique de gouvernance IA de ton entreprise — Règles d\'usage des LLM, sécurité des données, conformité RGPD et audit des modèles : c\'est ton nouveau coeur de métier DSI. Rédige un document d\'ici 30 jours.',
      'Complète l\'executive program MIT Sloan AI Strategy ou Coursera Google Cloud ML — Ces formations courtes pour dirigeants tech crédibilisent ton positionnement stratégique en interne et sur le marché.',
    ], secteur: 'tech-data-design' },

  { slug: 'acheteur', label: 'Acheteur', risk: 52, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute. Sourcing fournisseurs, RFP et benchmark prix sont accélérés par l\'IA. Tu te concentres sur la négociation stratégique, la résilience de la supply chain et la RSE des fournisseurs.',
    sources: [3], quadrant: 'mutes', potential: 60, leviers: [
      'Pilote Coupa AI ou SAP Ariba AI pour ton sourcing et ton analyse des dépenses — Identification de fournisseurs alternatifs, benchmark prix en temps réel, scoring RSE automatisé : tu passes de l\'exécution à la stratégie d\'achat.',
      'Repositionne-toi sur la négociation et la gestion des risques fournisseurs — Géopolitique, défaillances, concentration de sourcing : l\'arbitrage sur la résilience de la chaîne est humain. C\'est là que tu construis ta valeur long terme.',
      'Certifie-toi CIPS (Chartered Institute of Procurement & Supply) et maîtrise Beroe AI ou Mintec — Ce binôme certification x intelligence marchés IA t\'impose comme acheteur stratégique face aux directions qui sous-estiment encore le sujet.',
    ], secteur: 'sciences-ingenierie' },

  { slug: 'responsable-achats', label: 'Directeur des achats', risk: 40, horizon: 10, status: 'mutation',
    dynamic: 'Ton métier mute. Le pilotage analytique des dépenses et la veille fournisseurs sont assistés par IA. La valeur reste dans la stratégie make-or-buy, la gestion des risques géopolitiques et la négociation top-niveau.',
    sources: [9], quadrant: 'mutes', potential: 55, leviers: [
      'Déploie Sievo ou Spendkey AI pour ton analyse de dépenses en temps réel — Segmentation automatique, détection d\'opportunités d\'économies, reporting CODIR : tu passes du tableau de bord à la décision stratégique.',
      'Repositionne-toi sur la stratégie make-or-buy et la résilience géopolitique — Diversification du sourcing Asie-Europe, dual sourcing, gestion de la criticité des composants : c\'est le niveau de valeur que les outils d\'analyse n\'atteignent pas.',
      'Capitalise avec Jaggaer AI et une certification CPO Leadership — Pilote un projet de digitalisation achats dans ton entreprise et documente le ROI. C\'est le signal le plus fort pour une direction générale ou un board.',
    ], secteur: 'sciences-ingenierie' },

  { slug: 'geometre', label: 'Géomètre', risk: 35, horizon: 10, status: 'mutation',
    dynamic: 'Ton métier mute. Drones, LiDAR et IA de traitement nuage de points accélèrent les relevés. Tu te concentres sur l\'expertise foncière, la responsabilité légale et les missions complexes.',
    sources: [21], quadrant: 'mutes', potential: 50, leviers: [
      'Intègre Pix4D AI ou DroneDeploy AI dans tes relevés terrain — Nuage de points, orthophotos, modèles 3D en quelques heures au lieu de jours. Tu te recentres sur l\'interprétation et la validation foncière.',
      'Repositionne-toi sur l\'expertise bornage et la responsabilité légale — Acte authentique, bornage contradictoire, expertise judiciaire : c\'est la mission de géomètre-expert que l\'IA ne peut pas signer. C\'est ton verrou légal.',
      'Certifie-toi Trimble University sur les outils IA de relevé — Trimble RealWorks + IA et la maîtrise des workflows drone avancés te différencient des cabinets qui n\'ont pas encore basculé. Avantage compétitif fort en 2026.',
    ], secteur: 'sciences-ingenierie' },

  { slug: 'ingenieur-automatisme', label: 'Ingénieur automatisme', risk: 40, horizon: 10, status: 'mutation',
    dynamic: 'Ton métier mute. La programmation d\'automates et la mise au point de cycles sont accélérées par l\'IA générative et les jumeaux numériques. Tu pivotes vers l\'intégration cyber-physique et la robotique collaborative.',
    sources: [9], quadrant: 'mutes', potential: 55, leviers: [
      'Intègre Siemens MindSphere ou AVEVA AI dans ta supervision de lignes — Détection d\'anomalies prédictives, jumeaux numériques de tes équipements : tu pilotes la ligne depuis les données, pas depuis le terrain.',
      'Repositionne-toi sur la robotique collaborative et l\'intégration OT/IT — Cobot + ROS + cybersécurité industrielle : c\'est la convergence que peu d\'automaticiens maîtrisent. Ce croisement vaut deux fois plus sur le marché.',
      'Certifie-toi Rockwell Plex AI ou Siemens Automation Specialist — Couple avec un module cybersécurité ICS (SANS ICS515 ou ISA/IEC 62443). Profil rare, très demandé dans l\'automobile et l\'agroalimentaire.',
    ], secteur: 'sciences-ingenierie' },

  { slug: 'formateur', label: 'Formateur professionnel', risk: 35, horizon: 10, status: 'croissance',
    dynamic: 'Tu es dans le bon wagon. Le WEF projette que 39% des compétences devront être réapprises d\'ici 2030. La requalification massive crée un appel d\'air pour les formateurs en présentiel, surtout sur les soft skills.',
    sources: [10], quadrant: 'pilotes', potential: 65, leviers: [
      'Utilise Descript ou Loom AI pour produire tes supports de formation en asynchrone — Modules vidéo montés en 30 minutes, sous-titrés automatiquement, exportés en SCORM. Tu doubles ton catalogue sans doubler ton temps de production.',
      'Capitalise sur la demande de formation IA en entreprise — Prompting, automatisation, IA générative au travail : les budgets formation explosent sur ces sujets. Positionne 1 à 2 modules IA dans ton catalogue dès maintenant.',
      'Certifie-toi DeepLearning.AI ou Anthropic Academy et affiche le badge en tête de catalogue — Preuve que tu maîtrises ce que tu enseignes. Différenciateur immédiat face aux formateurs qui parlent d\'IA sans l\'avoir pratiquée.',
    ], secteur: 'marketing-comm-management' },

  { slug: 'responsable-hse', label: 'Responsable HSE', risk: 32, horizon: 10, status: 'protege',
    dynamic: 'L\'IA t\'assiste sur la veille réglementaire et l\'analyse de risques. Mais l\'audit terrain, la culture sécurité et la responsabilité juridique restent humaines. La pression réglementaire soutient durablement la demande.',
    sources: [21], quadrant: 'tiens', potential: 40, leviers: [
      'Automatise ta veille réglementaire avec LexisNexis Risk ou Thomson Reuters Regulatory Intelligence — Nouvelles directives ICPE, mises à jour REACH, évolutions code du travail : l\'IA surveille, toi tu évalues l\'impact terrain et tu décides.',
      'Capitalise ta responsabilité terrain comme avantage irremplaçable — Document unique, analyse ATEX, enquête accident : l\'engagement juridique du responsable HSE signataire est ce que l\'IA ne peut pas assumer. C\'est ton ancre.',
      'Maîtrise ChatGPT pour la production de synthèses ISO 45001 / ISO 14001 — Rédaction de procédures, préparation des revues de direction, plans de formation sécurité : tu gagnes 30% de temps administratif à réinvestir en présence terrain.',
    ], secteur: 'sciences-ingenierie' },

  { slug: 'agent-de-voyage', label: 'Agent de voyage', risk: 65, horizon: 5, status: 'danger',
    dynamic: 'Ton métier se contracte. La réservation autonome, les agents IA et les comparateurs ont absorbé le métier généraliste. Bascule vers le voyage de niche — luxe, affaires complexes, aventure — c\'est là que la valeur humaine reste.',
    sources: [3], quadrant: 'pivotes', potential: 25, leviers: [
      'Utilise ChatGPT pour créer des itinéraires sur mesure ultra-personnalisés — Client brief en 10 minutes, programme complet sur 14 jours en 30 minutes. Tu fais en une heure ce que le client ne trouvera pas sur Booking.',
      'Repositionne-toi sur le voyage B2B complexe ou le luxe — Séminaires d\'entreprise, luna de miel, safaris : ce que l\'IA ne peut pas garantir c\'est la relation de confiance et la gestion de crise sur le terrain. C\'est ton terrain.',
      'Certifie-toi sur une destination ou une niche via IATA ou les offices de tourisme — Spécialiste Maldives, expert croisière fluviale, voyage responsable : un signal externe précis qui attire les clients qui veulent l\'expert, pas le généraliste.',
    ], secteur: 'manuels-artisanat-transport' },

  { slug: 'chef-de-chantier', label: 'Chef de chantier', risk: 32, horizon: 10, status: 'protege',
    dynamic: 'L\'IA t\'assiste sur la planification et le suivi BIM. Mais la coordination terrain, la gestion d\'équipes humaines en environnement chaotique et la responsabilité d\'exécution restent fondamentalement humaines.',
    sources: [21], quadrant: 'tiens', potential: 35, leviers: [
      'Utilise ChatGPT pour générer tes plans de prévention, comptes rendus de réunion et rapports d\'avancement — Dictée ou notes en entrée, document structuré en sortie. Tu envoies des rapports de niveau bureau d\'études en 10 minutes.',
      'Intègre un outil de suivi chantier photo IA comme Fieldwire ou PlanGrid — Relevés d\'avancement, réserves photographiées et géolocalisées, suivi des sous-traitants en temps réel. Tu coordonnes depuis le terrain sans perdre le fil du bureau.',
      'Monte en compétence BIM avec Revit ou Autodesk Construction Cloud — La DPGF et les maîtres d\'œuvre exigent de plus en plus le suivi maquette numérique. Chef de chantier BIM-capable = profil rare et mieux payé.',
    ], secteur: 'manuels-artisanat-transport' },

  { slug: 'ingenieur-mecanique', label: 'Ingénieur mécanique', risk: 35, horizon: 10, status: 'mutation',
    dynamic: 'Ton métier mute. Le design génératif, la simulation et l\'optimisation topologique sont accélérés par l\'IA. Tu te concentres sur l\'intégration systémique, la responsabilité produit et l\'innovation conceptuelle.',
    sources: [6], quadrant: 'mutes', potential: 60, leviers: [
      'Bascule sur le design génératif avec Autodesk Generative ou nTopology — Topologie optimisée, simulations CFD/FEA en heures au lieu de semaines. Tu valides l\'output, l\'IA explore l\'espace de design.',
      'Repositionne-toi sur l\'intégration systémique et la responsabilité produit — L\'IA produit des pièces, toi tu garantis la conformité, la sécurité, l\'industrialisation. C\'est ta signature qui paie.',
      'Forme-toi aux jumeaux numériques + AI — Siemens Digital Industries Academy ou Coursera Industrial AI MIT. Différenciateur fort dans l\'auto et l\'aérospatial 2026.',
    ], secteur: 'sciences-ingenierie' },

  { slug: 'technicien-son', label: 'Technicien son / image', risk: 38, horizon: 10, status: 'mutation',
    dynamic: 'Ton métier mute. Mixage automatique, étalonnage IA et upscaling vidéo commoditisent une partie du travail. Tu te concentres sur les captations live, la direction artistique sonore et les productions premium.',
    sources: [21], quadrant: 'mutes', potential: 50, leviers: [
      'Intègre iZotope Neutron AI et Auphonic dans ta chaîne de post-production — Nettoyage audio, mastering automatisé, balance spectrale : les tâches répétitives disparaissent, tu te concentres sur le rendu artistique.',
      'Repositionne-toi sur la captation live et la direction technique premium — Concert, broadcast, cinéma : la gestion acoustique en temps réel dans un environnement vivant reste hors de portée de l\'IA. C\'est ton terrain irremplaçable.',
      'Maîtrise Topaz Video AI et DaVinci Resolve AI pour les productions haut de gamme — Upscaling 4K/8K, restauration d\'archives, étalonnage IA : ces compétences augmentées ouvrent les portes des productions qui paient bien.',
    ], secteur: 'sciences-ingenierie' },

  { slug: 'carreleur', label: 'Carreleur', risk: 8, horizon: 10, status: 'protege',
    dynamic: 'L\'IA ne te remplace pas. Lecture du support, ajustement aux contraintes du chantier et précision millimétrique restent hors de portée des robots. La rénovation immobilière soutient durablement la demande.',
    sources: [21], quadrant: 'tiens', potential: 25, leviers: [
      'Utilise ChatGPT pour rédiger tes devis et fiches de calepinage — Dimensions, quantitatifs, descriptif des poses complexes : tu envoies un document pro en 5 minutes. Les particuliers choisissent l\'artisan qui rassure sur papier.',
      'Photographie tes poses complexes en cours et terminées — Avant/après publié sur Google Business. Le carreleur visible localement ne cherche pas ses clients, ils le cherchent.',
      'Approfondis les techniques de pose grandes dalles et salle de bain PMR — Formations AFPA ou CFA. Le carreleur spécialisé en grands formats et accessibilité est le plus sollicité par les promoteurs et les architectes.',
    ], secteur: 'manuels-artisanat-transport' },

  { slug: 'professeur-lycee', label: 'Professeur (lycée)', risk: 18, horizon: 10, status: 'protege',
    dynamic: 'L\'IA ne te remplace pas. Autorité pédagogique, médiation des conflits, transmission de la culture commune et présence physique sont au cœur de la mission éducative. La demande structurelle est forte.',
    sources: [6], quadrant: 'pilotes', potential: 60, leviers: [
      'Utilise ChatGPT ou Khanmigo pour préparer tes cours, sujets de bac blancs et corrigés types — Gagne 3h par semaine sur la production de ressources. Tu te concentres sur le cours vivant, la relation, la préparation des oraux.',
      'Repositionne-toi sur l\'éducation à l\'IA et la culture numérique critique — Les lycéens utilisent déjà l\'IA pour leurs devoirs. Transforme ça en cours sur les biais algorithmiques, la désinformation IA, les enjeux du marché du travail. Personne d\'autre ne le fait mieux que toi.',
      'Forme-toi via INSPÉ IA pédagogie + DeepLearning.AI Generative AI for Educators — Référent numérique dans ton lycée : tu accompagnes la charte IA, tu formes les collègues. Signal fort pour les mutations sur postes à responsabilité.',
    ], secteur: 'sante-care-education' },

  { slug: 'chef-cuisinier', label: 'Chef cuisinier', risk: 15, horizon: 10, status: 'protege',
    dynamic: 'L\'IA ne te remplace pas. Créativité culinaire, leadership en cuisine sous pression et signature gastronomique sont fondamentalement humaines. La gastronomie expérientielle continue de croître.',
    sources: [21], quadrant: 'tiens', potential: 25, leviers: [
      'Utilise ChatGPT pour gérer les inventaires et les menus saisonniers — Suggestions de recettes optimisant ton stock, fiches techniques en 5 minutes. Tu libères 3-4h par semaine sur l\'admin.',
      'Capture ton savoir avec Otter.ai ou Whisper — Dicte tes recettes signatures, tes tours de main pendant la mise en place. Tu construis ton manuel de cuisine sans jamais écrire.',
      'Utilise Claude pour ta veille hebdo tendances — Résumé de 5 minutes sur les nouvelles techniques, produits, concurrents. Tu restes à la page sans y passer ta soirée.',
    ], secteur: 'manuels-artisanat-transport' },

  { slug: 'technicien-maintenance', label: 'Technicien de maintenance', risk: 15, horizon: 10, status: 'protege',
    dynamic: 'L\'IA ne te remplace pas. Diagnostic sensoriel, intervention dans des espaces contraints et adaptation à des installations vieillissantes hétérogènes restent hors de portée des robots. La demande est structurelle.',
    sources: [21], quadrant: 'tiens', potential: 25, leviers: [
      'Pilote une GMAO avec IA comme Mobility Work AI ou Praxedo — Historique des pannes, alertes préventives, gestion des pièces détachées optimisée. Tu préviens les arrêts machines plutôt que tu les subis.',
      'Utilise ChatGPT pour décrypter les manuels techniques en anglais et générer des procédures d\'intervention — Procédure claire en 3 minutes sur une machine inconnue. Tu réduis les erreurs, tu accélères l\'intervention.',
      'Monte en compétence sur la maintenance prédictive avec capteurs — Senseye ou IBM Maximo : module en ligne, 10h. Le technicien qui comprend les capteurs IoT et l\'IA de maintenance est le profil rare que les industriels s\'arrachent.',
    ], secteur: 'manuels-artisanat-transport' },

  { slug: 'moniteur-auto-ecole', label: 'Moniteur d\'auto-école', risk: 18, horizon: 10, status: 'protege',
    dynamic: 'L\'IA ne te remplace pas. Pédagogie au volant, gestion du stress de l\'élève et adaptation en temps réel restent humaines. Le permis de conduire reste un rite de passage requérant un humain à côté.',
    sources: [21], quadrant: 'tiens', potential: 25, leviers: [
      'Utilise les apps de suivi élève avec IA — iCar ou Ornikar Pro permettent de tracker la progression de chaque élève, identifier les lacunes persistantes et prioriser les heures. Tu passes moins de temps à te souvenir, plus à corriger.',
      'Utilise ChatGPT pour créer des fiches personnalisées de bilan de séance — Tu dictes les observations après chaque heure, ChatGPT structure le bilan élève. Relation de confiance renforcée, progression accélérée.',
      'Obtiens la mention deux-roues ou la qualification ECF conduite accompagnée — Spécialisations qui t\'ouvrent un public plus large et un tarif différencié. Signal externe qui joue en ta faveur dans les dossiers de rachat d\'auto-école.',
    ], secteur: 'manuels-artisanat-transport' },

  { slug: 'ambulancier', label: 'Ambulancier', risk: 12, horizon: 10, status: 'croissance',
    dynamic: 'Tu es dans le bon wagon. Soins d\'urgence, transport médicalisé et accompagnement psychologique du patient restent humains. Le vieillissement démographique fait croître structurellement la demande.',
    sources: [21], quadrant: 'pilotes', potential: 50, leviers: [
      'Utilise Whisper ou un outil de transcription IA pour tes bilans de régulation — Dictée du bilan patient en route, transmis automatiquement aux urgences. Gain de temps, meilleure qualité d\'information à l\'arrivée.',
      'Repositionne-toi sur la coordination et le pré-triage — Les essais NHS England montrent l\'IA utile en aide au tri d\'appels. Toi tu évalues sur le terrain, tu décides du vecteur et du niveau d\'urgence. L\'IA prépare, tu tranches.',
      'Évolue vers les fonctions d\'ambulancier paramédical ou de formateur — AFGSU niveau 2, modules de simulation IA en médecine d\'urgence : profil rare pour les SMUR et centres de formation professionnelle.',
    ], secteur: 'sante-care-education' },

  { slug: 'ergotherapeute', label: 'Ergothérapeute', risk: 14, horizon: 10, status: 'croissance',
    dynamic: 'Tu es dans le bon wagon. Réadaptation fonctionnelle, adaptation du domicile et accompagnement post-AVC sont irréductibles à l\'IA. Le vieillissement et la complexité des handicaps soutiennent la demande.',
    sources: [21], quadrant: 'pilotes', potential: 55, leviers: [
      'Utilise ChatGPT pour rédiger tes plans de réadaptation et bilans ergothérapiques — Synthèse structurée des évaluations ADL en 5 minutes. Tu réinvestis ce temps en séances et en visite à domicile.',
      'Intègre les solutions domotique IA dans tes préconisations d\'aménagement — Loona, Google Nest, capteurs de chute connectés : l\'ergothérapeute qui prescrit un environnement IA-augmenté offre une valeur que les familles comprennent et financent.',
      'Développe une expertise en réadaptation cognitive augmentée — Apps IA de rééducation post-AVC (Constant Therapy, BrainHQ) : propose-les en complément de tes séances. Signal d\'expertise fort pour les MDPH et les services de MPR.',
    ], secteur: 'sante-care-education' },

  { slug: 'educateur-specialise', label: 'Éducateur spécialisé', risk: 12, horizon: 10, status: 'croissance',
    dynamic: 'Tu es dans le bon wagon. Accompagnement de personnes en situation de handicap, médiation familiale et insertion sociale exigent un jugement moral et une présence que l\'IA ne peut pas offrir.',
    sources: [22], quadrant: 'pilotes', potential: 50, leviers: [
      'Utilise ChatGPT pour rédiger tes synthèses de bilans éducatifs et rapports MDPH — Première rédaction structurée à partir de tes notes en 10 minutes. Tu libères du temps pour la relation éducative, pas la paperasse institutionnelle.',
      'Intègre les outils CRM social (Sigma+ AI, outils de suivi de parcours) — Suivi des étapes d\'insertion, alertes de rupture de parcours, coordination des partenaires. Toi tu animes le réseau, l\'outil suit la traçabilité.',
      'Forme-toi via le CNFPT ou l\'EHESP modules IA et handicap — Premier éducateur spécialisé de ton équipe à documenter des pratiques IA = profil de référent pour les postes de coordinateur de parcours ou de chef de service.',
    ], secteur: 'sante-care-education' },

  { slug: 'peintre-batiment', label: 'Peintre en bâtiment', risk: 8, horizon: 10, status: 'protege',
    dynamic: 'L\'IA ne te remplace pas. Préparation des supports, ajustement aux configurations et finition à l\'œil restent humaines. Robots peintres existent en industrie, jamais sur chantier résidentiel.',
    sources: [21], quadrant: 'tiens', potential: 25, leviers: [
      'Utilise ChatGPT pour rédiger tes devis avec descriptifs techniques détaillés — Surface, nombre de couches, préparation du support, garantie : un devis clair et professionnel. Tu justifies ton prix face aux artisans qui écrivent trois lignes.',
      'Utilise les outils de simulation colorimétrique IA — ColorSnap AI (Sherwin-Williams) ou Dulux Visualizer : tu projettes la couleur directement sur les photos du chantier client. La vente de la prestation peinture se fait pendant la visite.',
      'Photographie chaque chantier terminé avec des photos qualité — Avant/après publié sur Google Business avec légende ChatGPT. Le peintre qui a une vitrine visuelle ne cherche pas ses chantiers, ils viennent à lui.',
    ], secteur: 'manuels-artisanat-transport' },

  { slug: 'patissier', label: 'Pâtissier', risk: 7, horizon: 10, status: 'protege',
    dynamic: 'L\'IA ne te remplace pas. Geste précis, créativité gustative et adaptation aux ingrédients restent humains. Le marché de l\'artisanat pâtissier soutient durablement la profession.',
    sources: [21], quadrant: 'tiens', potential: 25, leviers: [
      'Utilise ChatGPT pour rédiger tes fiches techniques et calculs de coûts matières — Recette, ratio prix de revient, allergie : tu as un document réglementaire et commercial propre pour chaque création. Tu seras moins surpris par ta marge.',
      'Capte tes créations saisonnières sur photo et publie avec Canva AI — Bûche, galette, gâteau de Pâques : la pâtisserie est visuelle. Instagram ou Google Business avec une description ChatGPT. Les commandes arrivent avant même d\'ouvrir.',
      'Explore les prévisions de ventes avec Apicbase — Données de vente historiques, prévisions par produit et par jour. Tu produis ce qui se vend, tu jettes moins. 3-5% de marge récupérée sans changer une recette.',
    ], secteur: 'manuels-artisanat-transport' },

  { slug: 'moniteur-sport', label: 'Moniteur de sport', risk: 13, horizon: 10, status: 'protege',
    dynamic: 'L\'IA ne te remplace pas. Encadrement physique, motivation incarnée et adaptation au niveau de l\'élève restent humains. La demande de bien-être et de coaching personnalisé soutient la profession.',
    sources: [21], quadrant: 'tiens', potential: 25, leviers: [
      'Intègre une app de suivi de progression IA — TrainHeroic ou TrueCoach pour suivre les performances, adapter les charges et visualiser la progression de tes élèves. Tu personnalises sans tenir un tableur.',
      'Utilise des apps d\'analyse posturale vidéo-assistée — Technique Running ou Dartfish Express : enregistre un mouvement, l\'IA détecte les défauts techniques. Tu montres à l\'élève ce qu\'il ne ressent pas lui-même.',
      'Utilise ChatGPT pour préparer tes plans de séance et tes bilans clients — Programme hebdomadaire, fiche de bilan mensuel, suggestions de progression : 10 minutes de prep pour une heure de séance impeccable.',
    ], secteur: 'manuels-artisanat-transport' },

  { slug: 'dieteticien', label: 'Diététicien', risk: 20, horizon: 10, status: 'croissance',
    dynamic: 'Tu es dans le bon wagon. Apps de tracking nutritionnel proposent des plans automatisés, mais l\'accompagnement personnalisé sur troubles alimentaires et pathologies chroniques exige l\'humain. La demande explose.',
    sources: [21], quadrant: 'pilotes', potential: 60, leviers: [
      'Utilise ChatGPT pour générer des plans nutritionnels personnalisés sur base des bilans biologiques — Premier jet en 5 minutes, tu ajustes selon le contexte clinique et les préférences alimentaires. Tu passes plus de temps en consultation, moins en Excel.',
      'Intègre MyFitnessPal AI ou Cronometer dans ton suivi patient — Le patient saisit ses repas, tu analyses les tendances à distance, tu ajustes avant la prochaine séance. Suivi continu sans multiplication des rendez-vous.',
      'Construis une présence en nutrition clinique augmentée — Compte Instagram ou LinkedIn sur les troubles alimentaires et l\'IA : ce qui fonctionne, ce qui ne fonctionne pas. Diététicien clinique visible = flux patients prescrit par les médecins endocrinologues et généralistes.',
    ], secteur: 'sante-care-education' },

  { slug: 'technicien-cvc', label: 'Technicien CVC (chauffage)', risk: 10, horizon: 10, status: 'croissance',
    dynamic: 'Tu es dans le bon wagon. Pompes à chaleur, climatisation et rénovation énergétique : la transition écologique structure une demande massive. Les entreprises peinent à recruter assez vite.',
    sources: [9], quadrant: 'tiens', potential: 35, leviers: [
      'Utilise ChatGPT pour générer tes rapports d\'intervention et devis de remplacement — Décris l\'installation visitée, récupère un rapport structuré et un devis chiffré. Tu passes moins de temps au bureau, plus sur chantier.',
      'Monte en compétence sur les pompes à chaleur et la régulation connectée — Formations Daikin, Mitsubishi ou Atlantic certifiantes. Le technicien CVC qualifié PAC est la pénurie des 5 prochaines années, avec des tarifs en hausse.',
      'Explore les outils de diagnostic à distance comme Resideo ou Ecobee Pro — Suivi à distance des installations clients, alertes de panne préventive. Tu crées un service de maintenance préventive qui fidélise et génère un revenu récurrent.',
    ], secteur: 'manuels-artisanat-transport' },

  { slug: 'serrurier', label: 'Serrurier', risk: 9, horizon: 10, status: 'protege',
    dynamic: 'L\'IA ne te remplace pas. Intervention d\'urgence, expertise mécanique et serrurerie sécurisée sur installations existantes restent humaines. La demande est stable.',
    sources: [21], quadrant: 'tiens', potential: 25, leviers: [
      'Utilise ChatGPT pour rédiger tes devis d\'urgence et fiches d\'intervention détaillées — Description de la serrure, référence du cylindre, travaux réalisés : un document pro envoyé depuis le téléphone avant de repartir du chantier.',
      'Améliore ta visibilité locale sur Google Business avec des photos d\'interventions — Serrures haute sécurité posées, blindages installés, coffres ouverts : le serrurier visible avec des avis récents est celui qu\'on appelle à 3h du matin.',
      'Spécialise-toi sur la domotique et les serrures connectées — Yale, Somfy, Nuki : le serrurier qui installe et dépanne du connecté est rare et bien payé. Signal fort pour les syndics et les promoteurs qui équipent en smart lock.',
    ], secteur: 'manuels-artisanat-transport' },

  { slug: 'conducteur-engins', label: 'Conducteur d\'engins', risk: 18, horizon: 10, status: 'croissance',
    dynamic: 'Tu es dans le bon wagon. Engins autonomes progressent en mine et en agriculture, mais le BTP urbain non standardisé reste humain. La transition énergétique et le logement structurent la demande.',
    sources: [9], quadrant: 'tiens', potential: 30, leviers: [
      'Familiarise-toi avec les systèmes d\'aide à la conduite sur les engins récents — GPS de chantier, nivelage automatique (Trimble, Leica Geosystems) : un conducteur à l\'aise avec ces outils est plus précis et recruté en priorité.',
      'Utilise ChatGPT pour rédiger tes carnets de bord d\'intervention et les fiches de sécurité — PPSPS, VIC, registre de maintenance : moins de paperasse, plus de terrain. Signal professionnel fort sur les grands chantiers.',
      'Élargis tes catégories CACES — R482 catégorie A à G : chaque catégorie supplémentaire te rend polyvalent et recruté plus facilement. Investissement de quelques jours qui se rentabilise en quelques semaines.',
    ], secteur: 'manuels-artisanat-transport' },

  { slug: 'pompiste', label: 'Technicien de surface', risk: 8, horizon: 10, status: 'protege',
    dynamic: 'L\'IA ne te remplace pas. Le nettoyage en environnements complexes, l\'adaptation aux salissures et la responsabilité hygiène en milieu sensible restent fondamentalement humains.',
    sources: [21], quadrant: 'tiens', potential: 25, leviers: [
      'Utilise ChatGPT pour rédiger tes fiches de poste et plannings d\'équipe — Décris les tâches en langage courant, récupère des documents structurés. Tu gagnes du temps sur l\'administratif et tu communiques mieux avec ta hiérarchie.',
      'Documente tes protocoles de nettoyage avec Notion AI — Fiches techniques par type de surface, milieu sensible (médical, agroalimentaire, transport). Une base documentée te démarque dans les appels d\'offres de propreté.',
      'Monte en compétence sur les certifications hygiène renforcée — HACCP, normes ISO 22000 pour les milieux sensibles. Les entreprises de propreté paient davantage les techniciens certifiés. Utilise l\'IA pour préparer les examens plus efficacement.',
    ], secteur: 'juridique-extra-securite-divers' },

  // ── AJOUTS COMMUNAUTÉ (métiers signalés par les utilisateurs) ──

  { slug: 'business-analyst', label: 'Business Analyst', risk: 58, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute. Traduction des besoins métier en specs, reporting et analyse de données structurées sont accélérés par l\'IA. Tu te concentres sur l\'arbitrage entre stakeholders, la modélisation de processus complexes et la conduite du changement.',
    sources: [3, 4], quadrant: 'mutes', potential: 70, leviers: [
      'Automatise tes analyses avec Claude + Hex ou Mode Analytics — Génère les requêtes SQL, les tableaux de bord et les synthèses de données automatiquement. Libère ton temps pour l\'arbitrage métier et la recommandation stratégique.',
      'Repositionne-toi sur la modélisation de processus IA — Chaque déploiement d\'IA en entreprise nécessite un BA qui sait cartographier les processus avant et après l\'automatisation. Propose-toi sur ces projets en interne.',
      'Certifie-toi CBAP (Certified Business Analysis Professional) et complète un cours de process mining — Celonis propose des formations sur l\'analyse de processus augmentée IA. Ce combo te distingue des BA sans expertise outils.',
    ], secteur: 'tech-data-design' },

  { slug: 'asset-manager', label: 'Asset Manager', risk: 52, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute. McKinsey projette 8% de gain d\'efficacité par l\'IA générative sur la recherche, l\'analyse de tendances et la due diligence. Tu te recentres sur la relation client institutionnel et l\'arbitrage stratégique.',
    sources: [4, 7], quadrant: 'mutes', potential: 65, leviers: [
      'Intègre Bloomberg Terminal AI ou BlackRock Aladdin dans ta veille marché — Automatise la synthèse de rapports, l\'analyse sectorielle et les alertes d\'événements. Recentre ton énergie sur la conviction d\'investissement.',
      'Repositionne-toi sur la relation client institutionnel et l\'allocation complexe — L\'IA optimise les portefeuilles standards. Ta valeur est dans les mandats sur-mesure, la confiance long terme et les marchés illiquides où l\'algorithme ne sait pas naviguer.',
      'Vise le CFA AI in Investing Certificate ou le CQF (Certificate in Quantitative Finance) — Ces certifications spécialisées signalent ta montée en compétence sur l\'IA financière auprès des allocataires institutionnels.',
    ], secteur: 'tech-data-design' },

  { slug: 'portfolio-manager', label: 'Portfolio Manager', risk: 54, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute. Screening, rebalancing et optimisation de portefeuilles sont accélérés par l\'IA prédictive. La valeur humaine se déplace vers la conviction d\'investissement, la gestion des biais émotionnels du client et les cas atypiques.',
    sources: [4, 7], quadrant: 'mutes', potential: 65, leviers: [
      'Pilote Bcomp ou Wolfram Alpha pour l\'analyse quantitative de tes positions — Automatise le screening et le rebalancing sur les stratégies standardisées. Libère ton attention pour les convictions différenciantes et les risques tail.',
      'Capitalise ta valeur sur le biais comportemental et la volatilité émotionnelle — L\'algorithme optimise, il ne console pas le client institutionnel qui panique en correction de marché. C\'est ton terrain irremplaçable.',
      'Vise le CFA Institute AI in Asset Management ou participe à Numerai — Numerai permet de soumettre des modèles quant et de construire une réputation publique dans la communauté. Signal fort pour les gérants alternatifs.',
    ], secteur: 'tech-data-design' },

  { slug: 'consultant-it', label: 'Consultant IT', risk: 45, horizon: 10, status: 'mutation',
    dynamic: 'Ton métier mute. Audits techniques, roadmaps de transformation et benchmarks fournisseurs sont accélérés par l\'IA. La demande explose à l\'inverse pour les consultants spécialisés IA - déploiement, gouvernance, MLOps.',
    sources: [4, 13], quadrant: 'mutes', potential: 75, leviers: [
      'Intègre Notion AI et Confluence AI dans ta production de livrables — Roadmaps, comptes-rendus d\'audit, matrices de risque : l\'IA produit le squelette, toi tu apportes l\'analyse et la recommandation client.',
      'Repositionne-toi sur la gouvernance IA et l\'implémentation MLOps — Les clients ont besoin de quelqu\'un qui sait déployer, monitorer et gouverner des systèmes IA en prod. C\'est le brief le plus demandé et le moins pourvu.',
      'Certifie-toi Google Cloud AI ou AWS AI Practitioner et vise une spécialité IA Act compliance — Le consultant IT qui parle gouvernance IA et conformité réglementaire est le profil le plus rare et le mieux payé du marché.',
    ], secteur: 'marketing-comm-management' },

  { slug: 'expert-immobilier', label: 'Expert immobilier', risk: 42, horizon: 10, status: 'mutation',
    dynamic: 'Ton métier mute. Les AVM (modèles de valorisation automatique) absorbent les biens standards en data-rich markets. Tu te concentres sur les biens atypiques, l\'expertise judiciaire et la responsabilité légale - irréductibles à l\'IA.',
    sources: [21], quadrant: 'mutes', potential: 50, leviers: [
      'Intègre PriceHubble ou JLL ML dans tes valorisations de biens standards — Automatise la première estimation, gagne 2h par dossier. Tu te positionnes sur les biens complexes où l\'algorithme se plante.',
      'Repositionne-toi sur l\'expertise judiciaire et les biens atypiques — Châteaux, biens en litige, valeur vénale pour successions : l\'IA ne peut pas assumer la responsabilité légale de ces missions. Toi oui.',
      'Obtiens une certification REV (Royal Institution of Chartered Surveyors) ou spécialise-toi en expertise judiciaire — Ce positionnement t\'extrait définitivement du marché de la valorisation standardisée que l\'IA va dominer.',
    ], secteur: 'marketing-comm-management' },

  { slug: 'juriste', label: 'Juriste d\'entreprise', risk: 55, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute. Revue contractuelle, recherche jurisprudentielle et notes de conformité sont les terrains de chasse les plus efficaces des LLM. Tu pivotes vers le conseil stratégique au business, la gestion du risque réglementaire et l\'arbitrage des cas complexes - ou tu te fais commoditiser.',
    sources: [3, 7], quadrant: 'mutes', potential: 60, leviers: [
      'Intègre Claude dans tes revues contractuelles — Une première passe IA sur un contrat identifie les clauses à risque en 3 minutes. Tu interviens sur la stratégie de négociation, pas sur la lecture exhaustive. Gagne 2 heures par dossier.',
      'Repositionne-toi sur le conseil stratégique au business — Risques réglementaires, fusions-acquisitions, conformité RGPD et IA Act : c\'est là que la valeur juridique se reconstruit. L\'IA ne conseille pas le CODIR, toi oui.',
      'Pilote un outil LegalTech et deviens la référente interne — ContractPodAi, Ironclad ou Leeway pour la gestion contractuelle : maîtriser ces outils te positionne en partenaire stratégique de la direction juridique, pas en exécutante.',
    ], secteur: 'cognitif-admin-finance-juridique' },

  { slug: 'greffier', label: 'Greffier(ère)', risk: 58, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute. Transcription d\'audience, indexation de dossiers, rédaction d\'actes types : la quasi-totalité du quotidien est en première ligne des LLM. La foi du greffe et la certification officielle te protègent, mais le poste se contracte - moins de greffiers pour plus de procédures.',
    sources: [3, 7], quadrant: 'mutes', potential: 50, leviers: [
      'Maîtrise les outils numériques de ton greffe — Portail Tribunaux.fr, e-Barreau, logiciels de gestion de dossiers : être la référente sur les outils numériques est la meilleure protection dans un greffe en voie de rationalisation.',
      'Repositionne-toi sur la certification et la foi du greffe — La valeur légale de l\'acte authentifié, la responsabilité du greffier-certificateur et la gestion des dossiers sensibles : c\'est le coeur irréductible de ta mission que l\'IA ne peut pas assumer.',
      'Développe une expertise sur un contentieux spécialisé — Procédures collectives, tribunal de commerce, conseils de prud\'hommes : la spécialisation sur un type de contentieux complexe renforce ta valeur. Les formations ENM (École nationale de la magistrature) proposent des modules continus.',
    ], secteur: 'cognitif-admin-finance-juridique' },
]

// ── Fonctions utilitaires ─────────────────────────────────

export function findJobBySlug(slug: string): Job | undefined {
  return JOBS.find(j => j.slug === slug)
}

export function searchJobs(query: string, limit = 8): Job[] {
  const q = query.trim().toLowerCase()
  if (q.length < 2) return []
  return JOBS
    .filter(j => j.label.toLowerCase().includes(q))
    .slice(0, limit)
}
