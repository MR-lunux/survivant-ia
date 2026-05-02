// app/data/jobs.ts

export type JobStatus = 'danger' | 'mutation' | 'protege' | 'croissance'

export interface Job {
  slug: string
  label: string
  risk: number              // 0–100
  horizon: number           // années avant impact majeur : 2 | 5 | 10
  status: JobStatus         // ÉDITORIAL — ne PAS dériver du risk %
  dynamic: string           // ≤ 300 chars, voix Survivant-IA (apostrophe + factuel)
  sources: number[]         // ids du catalogue sources.ts ; [] = pas de source spécifique
}

// Status taxonomy:
//   danger     — métier dans le viseur (contraction des effectifs, obsolescence en cours)
//   mutation   — le rôle se transforme radicalement, ne disparaît pas
//   protege    — peu menacé, valeur humaine non substituable
//   croissance — demande qui augmente structurellement

export const JOBS: Job[] = [
  // ── EN DANGER ──────────────────────────────────────────
  // (risque élevé, contraction réelle des effectifs)

  { slug: 'teleconseiller', label: 'Téléconseiller', risk: 78, horizon: 2, status: 'danger',
    dynamic: 'Tu es dans le viseur. La réception d\'appels et la résolution des plaintes courantes sont gérées par des agents conversationnels multimodaux à voix naturelle. Les centres de contact réduisent drastiquement leurs effectifs.',
    sources: [3] },

  { slug: 'televendeur', label: 'Télévendeur', risk: 92, horizon: 2, status: 'danger',
    dynamic: 'Tu es dans le viseur. La prospection à froid et la qualification de leads sont déléguées à des agents IA capables de mener des conversations vocales complètes. Le métier humain ne survit que sur les ventes complexes B2B.',
    sources: [3] },

  { slug: 'saisie-de-donnees', label: 'Agent de saisie de données', risk: 90, horizon: 2, status: 'danger',
    dynamic: 'Ton métier est en obsolescence active. La lecture de documents non structurés et leur saisie systémique sont résolues par l\'OCR cognitif et les LLM. Le WEF projette la disparition de 26 millions de ces postes.',
    sources: [3, 9] },

  { slug: 'redacteur-web', label: 'Rédacteur web', risk: 76, horizon: 2, status: 'danger',
    dynamic: 'Tu es dans le viseur. La rédaction de contenu web standardisé est massivement automatisée par les LLM. Seuls les créateurs d\'opinion à forte marque personnelle survivent — les autres subissent la contraction.',
    sources: [1, 15, 17] },

  { slug: 'traducteur', label: 'Traducteur', risk: 82, horizon: 2, status: 'danger',
    dynamic: 'Tu es dans le viseur. La traduction temps réel atteint une fidélité quasi-humaine. La profession humaine se cantonne à la traduction littéraire nuancée et à la diplomatie sensible de haut niveau.',
    sources: [1] },

  { slug: 'correcteur', label: 'Correcteur / Relecteur', risk: 85, horizon: 2, status: 'danger',
    dynamic: 'Tu es dans le viseur. Correction orthographique, grammaticale, formatage stylistique : l\'IA exécute avec une constance supérieure et fait disparaître les postes de relecture traditionnels.',
    sources: [1] },

  { slug: 'transcripteur', label: 'Transcripteur', risk: 88, horizon: 2, status: 'danger',
    dynamic: 'Tu es dans le viseur. La transcription audio→texte et la synthèse de réunions sont devenues des fonctionnalités natives gratuites des outils bureautiques. Le métier indépendant n\'a quasiment plus de marché.',
    sources: [3] },

  { slug: 'comptable', label: 'Comptable', risk: 72, horizon: 5, status: 'danger',
    dynamic: 'Ton métier est dans le viseur. Audit de base, rapprochement bancaire, détection de fraudes simples, tenue de livres : tout est automatisé. Les premiers qui pivotent vers le conseil stratégique survivent — les autres subissent la contraction.',
    sources: [1, 7] },

  { slug: 'analyste-credit', label: 'Analyste crédit', risk: 70, horizon: 5, status: 'danger',
    dynamic: 'Tu es dans le viseur. Le scoring crédit, l\'analyse des bilans et l\'évaluation du risque de défaut sont exécutés instantanément par des modèles entraînés sur des millions de dossiers. Le rôle humain se réduit aux exceptions.',
    sources: [7] },

  { slug: 'analyste-marketing', label: 'Analyste études de marché', risk: 65, horizon: 5, status: 'danger',
    dynamic: 'Tu es dans le viseur. La digestion de téraoctets de données qualitatives et la rédaction de rapports stratégiques synthétiques sont des domaines où les LLM excellent, rendant les rôles d\'analyse intermédiaires redondants.',
    sources: [1] },

  { slug: 'assistant-juridique', label: 'Assistant juridique', risk: 72, horizon: 5, status: 'danger',
    dynamic: 'Tu es dans le viseur. La revue contractuelle, la recherche jurisprudentielle et la production de notes juridiques de premier niveau sont automatisées. Le rôle humain disparaît avant de pouvoir muter.',
    sources: [7] },

  { slug: 'secretaire-juridique', label: 'Secrétaire juridique', risk: 77, horizon: 5, status: 'danger',
    dynamic: 'Tu es dans le viseur. La préparation de dossiers, la gestion de calendriers procéduraux et la rédaction de courriers types sont absorbées par les outils intégrés des cabinets. Le poste devient redondant.',
    sources: [7] },

  { slug: 'assistant-administratif', label: 'Assistant administratif', risk: 73, horizon: 5, status: 'danger',
    dynamic: 'Tu es dans le viseur. Gestion d\'agendas, priorisation des courriels, préparation de réunions : confiés à des agents virtuels. Le WEF anticipe une perte nette de 19 millions de postes administratifs.',
    sources: [3, 9] },

  { slug: 'receptionniste', label: 'Réceptionniste', risk: 80, horizon: 2, status: 'danger',
    dynamic: 'Tu es dans le viseur. Filtrage d\'appels, prise de rendez-vous et accueil informationnel sont gérés par des agents conversationnels disponibles 24/7. Seul l\'accueil physique haut de gamme résiste.',
    sources: [3] },

  { slug: 'standardiste', label: 'Standardiste', risk: 83, horizon: 2, status: 'danger',
    dynamic: 'Ton métier est en obsolescence active. La gestion d\'appels entrants et leur routage sont des fonctions natives des PBX cloud modernes. Le poste humain a quasiment disparu des grandes structures.',
    sources: [3] },

  { slug: 'agent-assurance', label: 'Agent d\'assurance', risk: 74, horizon: 5, status: 'danger',
    dynamic: 'Tu es dans le viseur. Souscription standardisée, calcul de primes, traitement de sinistres simples : automatisés. Le conseiller humain subsiste sur les contrats complexes et la relation patrimoniale.',
    sources: [3] },

  { slug: 'analyste-financier', label: 'Analyste financier', risk: 57, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute. L\'analyse exhaustive des bilans et flux d\'actualités est exécutée instantanément par l\'IA. Tu te concentres sur la gestion psychologique et relationnelle des clients, plus sur la production des chiffres.',
    sources: [3] },

  { slug: 'operateur-saisie', label: 'Opérateur de saisie', risk: 91, horizon: 2, status: 'danger',
    dynamic: 'Ton métier est en obsolescence active. L\'OCR cognitif et les LLM résolvent la lecture de documents sources et leur saisie systémique avec une précision supérieure à la main humaine.',
    sources: [3] },

  { slug: 'secretaire', label: 'Secrétaire', risk: 62, horizon: 5, status: 'danger',
    dynamic: 'Tu es dans le viseur. Gestion d\'agendas, priorisation des courriels, préparation de réunions : confiés à des secrétaires virtuels. Le WEF anticipe une perte nette de 19 millions de postes administratifs.',
    sources: [3, 9] },

  { slug: 'caissier', label: 'Caissier', risk: 78, horizon: 5, status: 'danger',
    dynamic: 'Tu es dans le viseur. Bornes self-checkout, paiement mobile, scan-and-go : la combinaison hardware + IA réduit massivement le besoin de caissiers humains dans la grande distribution.',
    sources: [9] },

  { slug: 'agent-recouvrement', label: 'Agent de recouvrement', risk: 80, horizon: 2, status: 'danger',
    dynamic: 'Tu es dans le viseur. La relance automatisée multicanale (SMS, email, voix synthétique) et la priorisation des dossiers par scoring IA rendent le travail d\'appel humain non rentable.',
    sources: [3] },

  { slug: 'employe-banque', label: 'Employé de banque / Guichetier', risk: 65, horizon: 5, status: 'danger',
    dynamic: 'Tu es dans le viseur. La digitalisation des services financiers et les conseillers virtuels suppriment la nécessité d\'interactions physiques. Les agences ferment en cascade.',
    sources: [20] },

  { slug: 'specialiste-rp', label: 'Spécialiste relations publiques', risk: 37, horizon: 5, status: 'danger',
    dynamic: 'Tu es dans le viseur. Communiqués de presse, identification de cibles médiatiques, veille réputationnelle : délégués à l\'IA, entraînant une réduction drastique des effectifs juniors en agence.',
    sources: [1] },

  { slug: 'editeur-reviseur', label: 'Éditeur / Réviseur', risk: 54, horizon: 5, status: 'danger',
    dynamic: 'Tu es dans le viseur. Correction, formatage stylistique et synthèse linguistique sont exécutés par l\'IA avec constance. Les postes de révision traditionnels disparaissent dans l\'édition standardisée.',
    sources: [1] },

  { slug: 'redacteur-technique', label: 'Rédacteur technique', risk: 42, horizon: 5, status: 'danger',
    dynamic: 'Tu es dans le viseur. Documentation de code et rédaction de manuels d\'utilisation sont extraites automatiquement par l\'IA depuis les dépôts de code source, supprimant le besoin d\'intermédiaires humains.',
    sources: [3] },

  { slug: 'specialiste-dossiers-medicaux', label: 'Spécialiste dossiers médicaux', risk: 67, horizon: 2, status: 'danger',
    dynamic: 'Tu es dans le viseur. Compilation, abstraction sémantique et codage administratif des données patients pour facturation/assurance sont pris en charge par des IA médicales spécialisées.',
    sources: [3] },

  { slug: 'testeur-qa', label: 'Testeur QA logiciel', risk: 52, horizon: 2, status: 'danger',
    dynamic: 'Tu es dans le viseur. Modification logicielle pour corriger des erreurs et exécution de scénarios de tests automatisés figurent parmi les tâches les plus exécutées par l\'IA en entreprise.',
    sources: [3] },

  // ── EN MUTATION SÉVÈRE ────────────────────────────────
  // (le rôle se transforme radicalement, ne disparaît pas)

  { slug: 'developpeur-logiciel', label: 'Développeur logiciel', risk: 55, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier ne disparaît pas. Il devient méconnaissable. L\'IA génère, teste et maintient le code de base. La demande s\'effondre pour les juniors exécutants ; le rôle pivote vers l\'architecture et l\'audit du code généré.',
    sources: [1, 15] },

  { slug: 'programmeur', label: 'Programmeur', risk: 74, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute brutalement. L\'IA pisse des lignes de code à vélocité surhumaine. Tu pivotes ou tu disparais : architecture système, audit de code IA, sécurité. Le "vibe code" génère une dette technique massive — sois celui qui sait la lire.',
    sources: [3] },

  { slug: 'designer-graphique', label: 'Designer graphique', risk: 58, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute. La génération multimodale réduit le besoin d\'équipes complètes à un directeur artistique assisté de plusieurs agents autonomes. La direction créative survit ; l\'exécution de production se commoditise.',
    sources: [1] },

  { slug: 'designer-web', label: 'Designer web / UI', risk: 55, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute. Génération instantanée d\'interfaces par modèles multimodaux : un seul directeur artistique pilote des agents qui produisent les variantes. La maquette à la main n\'est plus monnayable seule.',
    sources: [1] },

  { slug: 'ux-designer', label: 'UX Designer', risk: 45, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute. La recherche utilisateur quantitative, le wireframing et l\'A/B testing sont accélérés par l\'IA. Tu te recentres sur la stratégie produit, l\'ethnographie de terrain et l\'arbitrage business — ou tu deviens un PO-light.',
    sources: [1] },

  { slug: 'data-scientist', label: 'Data Scientist', risk: 37, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute. Paradoxalement, les créateurs des modèles voient le nettoyage des données, la sélection de variables et l\'optimisation hyperparamètres s\'automatiser (AutoML). Le rôle glisse vers l\'ingénierie MLOps et l\'alignement éthique.',
    sources: [3] },

  { slug: 'commercial', label: 'Commercial B2B', risk: 63, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute. Prospection à froid, e-mails personnalisés et démonstrations préliminaires sont délégués à des agents IA. Tu deviens négociateur final de contrats complexes et gardien de la relation senior.',
    sources: [3] },

  { slug: 'recruteur', label: 'Recruteur', risk: 58, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute. Sourcing, screening de CV et premier contact sont automatisés. Tu te recentres sur l\'évaluation comportementale, la marque employeur et le closing — l\'humain où l\'humain compte.',
    sources: [12] },

  { slug: 'responsable-rh', label: 'Responsable RH', risk: 50, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute. Reporting RH, paie standardisée, gestion administrative : automatisés. Le rôle pivote vers le développement humain, la culture d\'entreprise et la gestion du changement induit par l\'IA elle-même.',
    sources: [12] },

  { slug: 'conseiller-financier', label: 'Conseiller financier', risk: 48, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute. Allocation d\'actifs standardisée et plans patrimoniaux types sont gérés par robo-advisors. Tu te concentres sur la gestion psychologique des clients face aux marchés et les cas patrimoniaux complexes.',
    sources: [7] },

  { slug: 'architecte-logiciel', label: 'Architecte logiciel', risk: 35, horizon: 10, status: 'mutation',
    dynamic: 'Ton métier mute en valeur. L\'IA produit du code à vélocité industrielle, mais elle hallucine, casse des dépendances et introduit des failles. Toi qui sais lire et auditer l\'architecture, tu deviens hautement valorisable.',
    sources: [16] },

  { slug: 'community-manager', label: 'Community Manager', risk: 55, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute. Création de posts, programmation, modération basique et reporting : délégués à l\'IA. Tu te concentres sur la stratégie éditoriale, la gestion de crise et l\'animation authentique de communauté.',
    sources: [9] },

  { slug: 'expert-comptable', label: 'Expert-comptable', risk: 55, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute. Tenue de comptes et déclarations standardisées sont automatisées. Tu pivotes vers le conseil fiscal stratégique, l\'optimisation patrimoniale et l\'accompagnement des dirigeants — ou tu te fais commoditiser.',
    sources: [7] },

  { slug: 'consultant-strategie', label: 'Consultant en stratégie', risk: 42, horizon: 10, status: 'mutation',
    dynamic: 'Ton métier mute. Benchmarks, études de marché et synthèses sont produits en heures par l\'IA. Tu vends désormais le jugement, la confrontation au CEO et l\'exécution — pas le slide pack.',
    sources: [4] },

  { slug: 'product-manager', label: 'Product Manager', risk: 38, horizon: 10, status: 'mutation',
    dynamic: 'Ton métier mute. Specs, user stories et roadmaps brouillons sont générés par l\'IA. Tu te concentres sur la priorisation arbitrage, l\'alignement stakeholders et la vision produit — la partie irréductiblement politique du métier.',
    sources: [10] },

  { slug: 'journaliste-presse', label: 'Journaliste presse écrite', risk: 35, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute. Collecte d\'informations basiques, synthèse de rapports financiers, dépêches sportives : entièrement automatisées. L\'investigation complexe sur le terrain devient la seule véritable valeur ajoutée humaine.',
    sources: [1] },

  { slug: 'journaliste-tv', label: 'Journaliste TV / Radio', risk: 40, horizon: 10, status: 'mutation',
    dynamic: 'Ton métier mute. Présentation automatisée, voix synthétique, montage IA : la production technique se commoditise. La présence incarnée, le terrain et l\'enquête prolongée restent humains — pour combien de temps.',
    sources: [1] },

  { slug: 'analyste-renseignement', label: 'Analyste renseignement', risk: 64, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute. Traitement de signaux multiples, reconnaissance de formes dans le bruit informationnel et notes de synthèse sont augmentés par l\'IA. Tu deviens évaluateur critique de la véracité des sources générées.',
    sources: [6] },

  { slug: 'economiste', label: 'Économiste', risk: 63, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute. La modélisation macroéconomique et l\'analyse de vastes ensembles de données comportementales sont assistées par l\'IA. Les assistants de recherche disparaissent au profit de directeurs ultra-productifs.',
    sources: [6] },

  { slug: 'analyste-securite', label: 'Analyste sécurité informatique', risk: 63, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute. Audits de code de base, vulnérabilités connues, tests d\'intrusion standards : automatisés. L\'expertise humaine reste vitale pour anticiper l\'ingénierie sociale et les attaques générées par des IA adverses.',
    sources: [3] },

  { slug: 'ingenieur-automobile', label: 'Ingénieur automobile', risk: 62, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute. Conception itérative de pièces, optimisation aérodynamique, simulations de résistance : accélérées par le design génératif. Tu te concentres sur l\'intégration systémique et l\'innovation conceptuelle.',
    sources: [6] },

  { slug: 'ingenieur-industriel', label: 'Ingénieur industriel', risk: 45, horizon: 10, status: 'mutation',
    dynamic: 'Ton métier mute. Optimisation de chaînes, dimensionnement et planification de production sont accélérés par l\'IA. Tu deviens l\'orchestrateur entre systèmes IA et terrain humain — ou tu te fais déclasser.',
    sources: [7] },

  { slug: 'architecte-bdd', label: 'Architecte de bases de données', risk: 46, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute. Structuration, optimisation et migration des données sont gérées de manière autonome par des algorithmes apprenants. Le métier s\'oriente vers la gouvernance éthique et la sécurité des données massives.',
    sources: [6] },

  { slug: 'support-informatique', label: 'Support informatique (Helpdesk)', risk: 47, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute. Le dépannage de niveau 1 et 2 est pris en charge par des agents internes capables de lire les logs, diagnostiquer les pannes et guider les utilisateurs interactivement. Tu remontes en complexité ou tu disparais.',
    sources: [3] },

  { slug: 'chef-de-projet-it', label: 'Chef de projet IT', risk: 54, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute. Suivi de Jira, comptes rendus, planification : automatisés. Tu te concentres sur la gestion humaine des équipes, l\'arbitrage de scope et la communication exécutive — la partie politique du rôle.',
    sources: [9] },

  { slug: 'directeur-marketing', label: 'Directeur marketing', risk: 35, horizon: 10, status: 'mutation',
    dynamic: 'Ton métier mute. Campagnes, copies, analytics, segmentation : tout est accéléré 10x par l\'IA. Tu pilotes désormais une équipe réduite suralimentée par des agents — ou tu deviens le bottleneck que tu refusais d\'être.',
    sources: [9] },

  { slug: 'pharmacien', label: 'Pharmacien', risk: 42, horizon: 10, status: 'mutation',
    dynamic: 'Ton métier mute. Vérification d\'ordonnances et conseil basique sont assistés par IA en officine. Le rôle pivote vers l\'éducation thérapeutique, le suivi de patients chroniques et la pharmacovigilance.',
    sources: [21] },

  { slug: 'radiologue', label: 'Radiologue', risk: 48, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute. L\'IA détecte des anomalies sur imagerie médicale avec une sensibilité comparable ou supérieure à l\'humain. Tu deviens validateur expert, garant éthique des décisions et référent en cas complexes.',
    sources: [21] },

  { slug: 'politologue', label: 'Politologue / Chercheur social', risk: 40, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute. Revue de littérature, traitement de sondages à grande échelle et analyse sémantique des discours sont effectués en secondes par l\'IA. Les équipes de recherche se réduisent drastiquement.',
    sources: [3] },

  { slug: 'statisticien', label: 'Statisticien', risk: 65, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute. Analyse standardisée, modèles de régression et extrapolations sont absorbées par des agents nativement intégrés aux plateformes d\'entreprise. Tu pivotes vers la modélisation causale fine et la rigueur scientifique.',
    sources: [6] },

  // ── PROTÉGÉ ────────────────────────────────────────────
  // (peu menacé, valeur humaine non substituable)

  { slug: 'cardiologue', label: 'Cardiologue', risk: 1, horizon: 10, status: 'protege',
    dynamic: 'L\'IA ne te remplace pas — elle a besoin de toi. Elle augmente la précision diagnostique sur imagerie, mais responsabilité légale, empathie face au diagnostic vital et intervention physique de précision te maintiennent au centre du soin.',
    sources: [6] },

  { slug: 'medecin-generaliste', label: 'Médecin généraliste', risk: 8, horizon: 10, status: 'protege',
    dynamic: 'L\'IA ne te remplace pas — elle augmente ta capacité. Diagnostic différentiel, suivi de patients, écoute, orientation : la combinaison technique + relationnelle reste fondamentalement humaine. La pénurie démographique te rend irremplaçable.',
    sources: [6, 21] },

  { slug: 'chirurgien', label: 'Chirurgien', risk: 4, horizon: 10, status: 'protege',
    dynamic: 'L\'IA ne te remplace pas — elle assiste. La motricité fine, la décision en temps réel face à l\'imprévu chirurgical et la responsabilité vitale immédiate restent hors de portée des systèmes autonomes.',
    sources: [21] },

  { slug: 'psychologue', label: 'Psychologue / Thérapeute', risk: 1, horizon: 10, status: 'protege',
    dynamic: 'L\'IA ne te remplace pas — elle a besoin de toi. Empathie authentique, signaux non verbaux subtils, transfert psychologique et soutien émotionnel humain résistent à la modélisation. La confiance humaine est l\'essence du service.',
    sources: [6] },

  { slug: 'psychiatre', label: 'Psychiatre', risk: 3, horizon: 10, status: 'protege',
    dynamic: 'L\'IA ne te remplace pas. Le jugement clinique sur l\'urgence suicidaire, la responsabilité de prescription et la relation thérapeutique restent humains. L\'IA t\'assiste sur l\'historique et la pharmacovigilance.',
    sources: [21] },

  { slug: 'enseignant', label: 'Enseignant en sciences sociales', risk: 1, horizon: 10, status: 'protege',
    dynamic: 'L\'IA ne te remplace pas — elle ouvre l\'accès à l\'information. Mais mentorat, encouragement, modération de débats et rôle de modèle social exigent ta présence. L\'autorité pédagogique se construit en présentiel.',
    sources: [6] },

  { slug: 'professeur-universitaire', label: 'Professeur universitaire', risk: 12, horizon: 10, status: 'protege',
    dynamic: 'L\'IA t\'assiste sur la production de matériel pédagogique et la correction. Mais le jury, la direction de thèse, le mentorat doctoral et la production de savoir original restent fondamentalement humains.',
    sources: [21] },

  { slug: 'avocat', label: 'Avocat', risk: 22, horizon: 10, status: 'protege',
    dynamic: 'L\'IA t\'assiste : revue contractuelle, recherche jurisprudentielle, premiers brouillons. Mais la plaidoirie, la stratégie procédurale, la responsabilité ordinale et la confiance client te maintiennent indispensable.',
    sources: [21] },

  { slug: 'juge', label: 'Juge / Magistrat', risk: 5, horizon: 10, status: 'protege',
    dynamic: 'L\'IA ne te remplace pas. La décision de justice ne peut, par construction démocratique, être déléguée à un algorithme. L\'autorité de la chose jugée demeure humaine.',
    sources: [21] },

  { slug: 'notaire', label: 'Notaire', risk: 32, horizon: 10, status: 'protege',
    dynamic: 'L\'IA t\'assiste sur la rédaction d\'actes types. Mais l\'authentification, la responsabilité officielle et la médiation des intérêts entre parties te maintiennent au centre des transactions patrimoniales.',
    sources: [21] },

  { slug: 'artificier', label: 'Artificier / Manipulateur d\'explosifs', risk: 0, horizon: 10, status: 'protege',
    dynamic: 'L\'IA ne te remplace pas. Environnement létal, totalement imprévisible, exigeant une motricité fine instantanée : exclu des robots autonomes dans un avenir prévisible. Le coût de l\'échec rend ta présence indispensable.',
    sources: [6] },

  { slug: 'macon', label: 'Maçon / Bâtiment', risk: 0, horizon: 10, status: 'croissance',
    dynamic: 'Tu es dans le bon wagon. Manipulation de matériaux lourds dans des chantiers non structurés défie la robotique actuelle. La transition énergétique et les besoins en logement garantissent l\'emploi à long terme.',
    sources: [6] },

  { slug: 'plombier', label: 'Plombier', risk: 4, horizon: 10, status: 'protege',
    dynamic: 'L\'IA ne te remplace pas. Diagnostic dans des espaces contraints, intervention sur des installations vieillissantes hétérogènes et urgences d\'eau : hors de portée de la robotique économiquement viable.',
    sources: [21] },

  { slug: 'electricien', label: 'Électricien', risk: 6, horizon: 10, status: 'protege',
    dynamic: 'L\'IA ne te remplace pas. Diagnostic d\'installations vieillissantes, intervention en environnement contraint et responsabilité sécuritaire restent hors de portée des robots. La transition énergétique soutient durablement la demande.',
    sources: [21] },

  { slug: 'cuisinier-rapide', label: 'Cuisinier de restauration rapide', risk: 0, horizon: 10, status: 'protege',
    dynamic: 'L\'IA ne te remplace pas. Le travail physique cadencé dans un espace restreint résiste étonnamment bien à l\'IA. Bornes de commande automatisées oui, mais préparation physique des repas reste humaine.',
    sources: [6] },

  { slug: 'cuisinier-restaurant', label: 'Cuisinier restaurant', risk: 5, horizon: 10, status: 'protege',
    dynamic: 'L\'IA ne te remplace pas. Créativité culinaire, adaptation produit-saison et gestion d\'un coup de feu en service restent humains. Les robots de cuisine restent confinés aux process standardisés.',
    sources: [21] },

  { slug: 'soudeur', label: 'Soudeur / Coupeur', risk: 14, horizon: 10, status: 'protege',
    dynamic: 'L\'IA ne te remplace pas en grande partie. Robots industriels existent en chaîne, mais le sur-mesure, les réparations en extérieur et les interventions sur infrastructures vieillissantes échappent à l\'automatisation.',
    sources: [6] },

  { slug: 'mecanicien', label: 'Mécanicien automobile / moto', risk: 0, horizon: 10, status: 'protege',
    dynamic: 'L\'IA ne te remplace pas. Diagnostic basé sur perceptions sensorielles complexes (bruit, vibration, odeurs) et accès physique contraint aux pièces dans des environnements non standardisés garantissent le métier.',
    sources: [3] },

  { slug: 'masseur', label: 'Masseur-Kinésithérapeute', risk: 12, horizon: 10, status: 'protege',
    dynamic: 'L\'IA ne te remplace pas. Retour haptique, chaleur humaine, adaptation instantanée à la douleur du patient et manipulation anatomique précise constituent l\'essence même de la valeur thérapeutique.',
    sources: [6] },

  { slug: 'osteopathe', label: 'Ostéopathe', risk: 10, horizon: 10, status: 'protege',
    dynamic: 'L\'IA ne te remplace pas. Palpation, lecture corporelle et ajustement manuel précis dépendent d\'une expertise sensorielle et d\'une relation thérapeutique non modélisables. La demande reste forte.',
    sources: [21] },

  { slug: 'operateur-crematorium', label: 'Opérateur de crématorium', risk: 17, horizon: 10, status: 'protege',
    dynamic: 'L\'IA ne te remplace pas. Manipulation physique en environnement potentiellement dangereux + respect strict de protocoles culturels et moraux liés au deuil : profondément humain.',
    sources: [6] },

  { slug: 'pompier', label: 'Pompier', risk: 8, horizon: 10, status: 'protege',
    dynamic: 'L\'IA ne te remplace pas. Intervention en environnement chaotique, jugement vital sous stress et coopération équipe-terrain restent fondamentalement humains. La technologie augmente, ne remplace pas.',
    sources: [21] },

  { slug: 'policier', label: 'Policier', risk: 9, horizon: 10, status: 'protege',
    dynamic: 'L\'IA t\'assiste sur la reconnaissance et l\'analyse de données, mais l\'usage légitime de la force, le jugement de proportionnalité et l\'intervention humaine restent encadrés par la présence physique.',
    sources: [21] },

  { slug: 'militaire', label: 'Militaire', risk: 11, horizon: 10, status: 'protege',
    dynamic: 'L\'IA augmente massivement les capacités (drones, renseignement, logistique). Mais la décision d\'engagement, la responsabilité de commandement et le combat en environnement complexe restent humains.',
    sources: [21] },

  // ── EN CROISSANCE ──────────────────────────────────────
  // (demande qui augmente structurellement)

  { slug: 'travailleur-social', label: 'Travailleur social', risk: 5, horizon: 10, status: 'croissance',
    dynamic: 'Tu es dans le bon wagon. Gestion de crises intrafamiliales, protection de l\'enfance et réparation du tissu social exigent un jugement moral et une compassion que l\'IA ne peut pas et ne doit pas assumer.',
    sources: [9] },

  { slug: 'infirmier', label: 'Infirmier', risk: 18, horizon: 10, status: 'croissance',
    dynamic: 'Tu es dans le bon wagon. Soin physique corporel, hygiène, manipulation de patients fragiles et communication avec familles en détresse exigent une présence humaine irremplaçable. Le vieillissement démographique fait exploser la demande.',
    sources: [6] },

  { slug: 'aide-soignant', label: 'Aide-soignant', risk: 18, horizon: 10, status: 'croissance',
    dynamic: 'Tu es dans le bon wagon. La proximité physique, l\'aide à la toilette et l\'accompagnement des personnes dépendantes exigent ta présence. Le vieillissement démographique structure une demande explosive.',
    sources: [6] },

  { slug: 'auxiliaire-vie', label: 'Auxiliaire de vie', risk: 5, horizon: 10, status: 'croissance',
    dynamic: 'Tu es dans le bon wagon. Maintien à domicile des personnes âgées et dépendantes : la demande explose avec le vieillissement. L\'IA ne remplace ni la présence physique ni la chaleur humaine.',
    sources: [9] },

  { slug: 'sage-femme', label: 'Sage-femme', risk: 6, horizon: 10, status: 'croissance',
    dynamic: 'Tu es dans le bon wagon. Accouchement, suivi prénatal, accompagnement post-partum : la combinaison technique-relationnelle est irréductible. La demande structurelle reste forte malgré la baisse de natalité.',
    sources: [21] },

  { slug: 'orthophoniste', label: 'Orthophoniste', risk: 11, horizon: 10, status: 'croissance',
    dynamic: 'Tu es dans le bon wagon. Rééducation du langage, suivi des troubles cognitifs et accompagnement des familles : la demande dépasse l\'offre dans la plupart des bassins.',
    sources: [21] },

  { slug: 'agriculteur', label: 'Ouvrier agricole / Agriculteur', risk: 0, horizon: 5, status: 'croissance',
    dynamic: 'Tu es dans le bon wagon — peut-être le meilleur. Boostée par la transition écologique, l\'adaptation climatique et la sécurité alimentaire mondiale, la profession connaît la plus forte croissance absolue : +34M emplois projetés d\'ici 2030.',
    sources: [9] },

  { slug: 'maraicher', label: 'Maraîcher', risk: 4, horizon: 10, status: 'croissance',
    dynamic: 'Tu es dans le bon wagon. La demande de circuits courts et la transition agroécologique soutiennent durablement le métier. L\'automatisation reste partielle face à la diversité variétale et météorologique.',
    sources: [9] },

  { slug: 'eleveur', label: 'Éleveur', risk: 6, horizon: 10, status: 'croissance',
    dynamic: 'Tu es dans le bon wagon. Soin du vivant, gestion de la reproduction et adaptation aux pathologies animales restent fondamentalement humains. La demande de produits locaux soutient la profession.',
    sources: [9] },

  { slug: 'chauffeur-livreur', label: 'Chauffeur-livreur', risk: 10, horizon: 5, status: 'croissance',
    dynamic: 'Tu es dans le bon wagon. La complexité du dernier kilomètre — bâtiments non cartographiés, remise en main propre, interaction client — retarde indéfiniment l\'automatisation logistique complète.',
    sources: [9] },

  { slug: 'chauffeur-poids-lourd', label: 'Chauffeur poids-lourd', risk: 32, horizon: 10, status: 'croissance',
    dynamic: 'Tu restes dans le bon wagon… pour l\'instant. Le camion autonome avance, mais la complexité réglementaire, la responsabilité accident et les manœuvres en zone urbaine repoussent encore le déploiement à grande échelle.',
    sources: [21] },

  { slug: 'ingenieur-ia', label: 'Ingénieur IA / Architecte MLOps', risk: 0, horizon: 10, status: 'croissance',
    dynamic: 'Tu es au sommet de la vague. Création de modèles de fondation, intégration cloud sécurisée, optimisation des flux d\'inférence : demande massive, salaires premium. LinkedIn recense 1,3M nouveaux postes IA.',
    sources: [11, 14] },

  { slug: 'integrateur-ia', label: 'Intégrateur IA', risk: 0, horizon: 10, status: 'croissance',
    dynamic: 'Tu es dans le bon wagon. Connecter les LLM aux systèmes métier d\'entreprise est la compétence la plus demandée — chaque société veut son IA opérationnelle, peu de gens savent vraiment la déployer en production.',
    sources: [14] },

  { slug: 'expert-cybersecurite', label: 'Expert cybersécurité', risk: 12, horizon: 10, status: 'croissance',
    dynamic: 'Tu es dans le bon wagon. L\'IA générative arme les attaquants : phishing personnalisé, génération de malware, ingénierie sociale automatisée. La demande d\'experts capables de contrer ces vagues explose.',
    sources: [9] },

  { slug: 'specialiste-big-data', label: 'Spécialiste Big Data', risk: 18, horizon: 10, status: 'croissance',
    dynamic: 'Tu es dans le bon wagon. L\'inflation du volume de données générées par l\'IA elle-même crée une demande structurelle pour ceux qui savent les architecturer, gouverner et exploiter de manière utile.',
    sources: [9] },

  { slug: 'ingenieur-fintech', label: 'Ingénieur fintech', risk: 22, horizon: 10, status: 'croissance',
    dynamic: 'Tu es dans le bon wagon. La fusion finance-IA-régulation crée une niche premium. Les banques transforment leurs systèmes legacy avec l\'IA et cherchent des profils hybrides finance + tech.',
    sources: [9] },

  { slug: 'specialiste-energies-renouvelables', label: 'Spécialiste énergies renouvelables', risk: 4, horizon: 10, status: 'croissance',
    dynamic: 'Tu es dans le bon wagon. La transition énergétique structure une demande massive : conception, installation, maintenance d\'infrastructures solaires/éoliennes/hydrogène. Le marché embauche plus vite qu\'il forme.',
    sources: [9] },

  { slug: 'technicien-eolien', label: 'Technicien éolien', risk: 3, horizon: 10, status: 'croissance',
    dynamic: 'Tu es dans le bon wagon. Maintenance en hauteur, diagnostic mécanique-électrique sur sites isolés et coordination terrain : irréductibles à l\'automatisation à court terme. Demande structurelle forte.',
    sources: [9] },

  { slug: 'technicien-solaire', label: 'Technicien solaire', risk: 4, horizon: 10, status: 'croissance',
    dynamic: 'Tu es dans le bon wagon. La diversité des toitures, des configurations résidentielles et des contraintes techniques rend l\'installation difficilement automatisable. Le marché manque cruellement de bras qualifiés.',
    sources: [9] },

  { slug: 'specialiste-batiment-durable', label: 'Spécialiste bâtiment durable', risk: 5, horizon: 10, status: 'croissance',
    dynamic: 'Tu es dans le bon wagon. Rénovation énergétique, isolation thermique et matériaux biosourcés : la réglementation européenne crée une demande massive. Les entreprises peinent à recruter.',
    sources: [9] },

  { slug: 'coach-professionnel', label: 'Coach professionnel', risk: 22, horizon: 10, status: 'croissance',
    dynamic: 'Tu es dans le bon wagon. Face au déclassement cognitif induit par l\'IA, la demande de coaching de carrière, de reconversion et de gestion de stress explose. La présence humaine fait la différence.',
    sources: [21] },

  { slug: 'formateur-adultes', label: 'Formateur d\'adultes', risk: 25, horizon: 10, status: 'croissance',
    dynamic: 'Tu es dans le bon wagon. Le WEF projette que 39% des compétences devront être réapprises d\'ici 2030. La requalification massive des actifs crée un appel d\'air pour les formateurs en présentiel.',
    sources: [10] },

  // ── ARTISANAT & MÉTIERS DU CONCRET (PROTÉGÉ / CROISSANCE) ──

  { slug: 'menuisier', label: 'Menuisier', risk: 8, horizon: 10, status: 'protege',
    dynamic: 'L\'IA ne te remplace pas. Travail sur mesure, lecture du bois, ajustement à l\'existant : irréductible à la robotique. La demande pour le mobilier sur mesure et la rénovation reste solide.',
    sources: [21] },

  { slug: 'ebeniste', label: 'Ébéniste', risk: 5, horizon: 10, status: 'protege',
    dynamic: 'L\'IA ne te remplace pas. La haute valeur ajoutée artisanale et la finition au sentiment échappent à l\'automatisation. Le marché du luxe et de la restauration soutient durablement la profession.',
    sources: [21] },

  { slug: 'boulanger', label: 'Boulanger / Pâtissier', risk: 10, horizon: 10, status: 'protege',
    dynamic: 'L\'IA ne te remplace pas. Tour de main, adaptation aux farines, gestion d\'un fournil et créativité culinaire restent humains. La demande de produits artisanaux locaux soutient le métier.',
    sources: [21] },

  { slug: 'boucher', label: 'Boucher', risk: 12, horizon: 10, status: 'protege',
    dynamic: 'L\'IA ne te remplace pas. Lecture anatomique, découpe précise et conseil client en proximité résistent à l\'automatisation économiquement viable. Le local et l\'artisanal soutiennent la demande.',
    sources: [21] },

  { slug: 'coiffeur', label: 'Coiffeur', risk: 6, horizon: 10, status: 'protege',
    dynamic: 'L\'IA ne te remplace pas. Geste fin sur cheveu vivant + relation de confiance + contact physique : profondément humain. La demande reste solide même en récession.',
    sources: [21] },

  { slug: 'esthetique', label: 'Esthéticien(ne)', risk: 8, horizon: 10, status: 'protege',
    dynamic: 'L\'IA ne te remplace pas. Soins personnalisés, contact physique apaisant et conseil sur la peau spécifique du client restent humains. La demande de bien-être croît avec le stress ambiant.',
    sources: [21] },

  { slug: 'fleuriste', label: 'Fleuriste', risk: 25, horizon: 10, status: 'protege',
    dynamic: 'L\'IA ne te remplace pas. Composition florale au feeling, conseil émotionnel pour mariages/funérailles et adaptation au stock saisonnier sont irréductiblement humains. Marché de niche stable.',
    sources: [21] },

  // ── SANTÉ ──────────────────────────────────────────────

  { slug: 'dentiste', label: 'Dentiste', risk: 14, horizon: 10, status: 'protege',
    dynamic: 'L\'IA t\'assiste sur le diagnostic radiologique. Mais l\'intervention en bouche, la sensation tactile sur tissu vivant et la responsabilité chirurgicale restent humaines.',
    sources: [21] },

  { slug: 'kinesitherapeute', label: 'Kinésithérapeute', risk: 10, horizon: 10, status: 'protege',
    dynamic: 'L\'IA ne te remplace pas. Manipulation thérapeutique, adaptation à la douleur du patient et accompagnement de la rééducation exigent ta présence. La demande croît avec le vieillissement.',
    sources: [21] },

  { slug: 'veterinaire', label: 'Vétérinaire', risk: 12, horizon: 10, status: 'protege',
    dynamic: 'L\'IA t\'assiste sur le diagnostic. Mais la manipulation d\'un animal vivant, la chirurgie et la communication avec les propriétaires restent humaines. La demande explose avec la place des animaux de compagnie.',
    sources: [21] },

  // ── MÉTIERS DE BUREAU SECONDAIRES ──────────────────────

  { slug: 'controller-gestion', label: 'Contrôleur de gestion', risk: 60, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute. Reporting standardisé, écarts budgétaires et tableaux de bord sont automatisés. Tu te concentres sur le partenariat business, l\'arbitrage de scenarii stratégiques et la lecture critique des données.',
    sources: [7] },

  { slug: 'auditeur', label: 'Auditeur financier', risk: 65, horizon: 5, status: 'danger',
    dynamic: 'Tu es dans le viseur. Tests de procédures, échantillonnage et revue documentaire : automatisés à 80%. Les Big 4 réduisent silencieusement leurs effectifs juniors. Survivent ceux qui montent en jugement professionnel.',
    sources: [7] },

  { slug: 'chargee-clientele', label: 'Chargé(e) de clientèle', risk: 60, horizon: 5, status: 'danger',
    dynamic: 'Tu es dans le viseur. Conseil transactionnel basique, ouverture de compte et mise à jour de dossiers sont automatisés. Le poste se contracte massivement dans la banque de détail.',
    sources: [3] },

  { slug: 'gestionnaire-paie', label: 'Gestionnaire de paie', risk: 68, horizon: 5, status: 'danger',
    dynamic: 'Tu es dans le viseur. La paie standardisée est entièrement automatisée par les SIRH modernes. Le rôle subsiste sur la conformité multi-conventions et les cas d\'expatriation.',
    sources: [3] },

  { slug: 'documentaliste', label: 'Documentaliste', risk: 70, horizon: 5, status: 'danger',
    dynamic: 'Tu es dans le viseur. Indexation, classement et recherche documentaire sont des fonctions natives des LLM. Le métier subsiste uniquement dans des contextes spécialisés (droit, médecine, archives historiques).',
    sources: [3] },

  { slug: 'archiviste', label: 'Archiviste', risk: 50, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute. La numérisation et l\'OCR cognitif transforment le métier de manipulation physique en métier de gouvernance numérique des fonds. La conservation patrimoniale reste humaine.',
    sources: [3] },

  { slug: 'bibliothecaire', label: 'Bibliothécaire', risk: 35, horizon: 10, status: 'mutation',
    dynamic: 'Ton métier mute. Le conseil de lecture et la médiation culturelle deviennent le cœur du métier, à mesure que le catalogage et la recherche se font naturellement par IA.',
    sources: [21] },

  { slug: 'agent-immobilier', label: 'Agent immobilier', risk: 50, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute. Annonces, qualification de prospects et descriptifs : automatisés. La valeur se déplace vers la négociation, la connaissance fine du quartier et la gestion émotionnelle des transactions.',
    sources: [9] },

  { slug: 'gestionnaire-stock', label: 'Gestionnaire de stock', risk: 62, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute. Prévision de demande, optimisation de réapprovisionnement et inventaires sont automatisés. Tu deviens orchestrateur d\'exceptions et négociateur fournisseurs — ou tu es remplacé.',
    sources: [3] },

  { slug: 'logisticien', label: 'Logisticien', risk: 45, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute. Planification, routage et optimisation sont accélérés 10x par l\'IA. Tu te concentres sur la gestion des aléas, les relations transporteurs et l\'arbitrage stratégique multi-sites.',
    sources: [3] },

  // ── COMMUNICATION & MARKETING ──────────────────────────

  { slug: 'redacteur-publicitaire', label: 'Rédacteur publicitaire / Copywriter', risk: 70, horizon: 2, status: 'danger',
    dynamic: 'Tu es dans le viseur. La production de copies, slogans et A/B variants est devenue triviale pour les LLM. Subsistent les directeurs de création à forte signature et le copywriting stratégique haut de gamme.',
    sources: [1] },

  { slug: 'responsable-com', label: 'Responsable communication', risk: 45, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute. Production de contenus, communiqués et reporting sont automatisés. Tu deviens stratège éditorial, gestionnaire de crise et garant de la marque — la part politique et humaine du rôle.',
    sources: [1] },

  { slug: 'social-media-manager', label: 'Social Media Manager', risk: 55, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute. Création de posts, programmation et reporting analytics : automatisés. Tu te concentres sur la stratégie, la gestion de communauté authentique et la réaction de crise.',
    sources: [9] },

  { slug: 'event-manager', label: 'Chef de projet événementiel', risk: 28, horizon: 10, status: 'protege',
    dynamic: 'L\'IA t\'assiste sur la coordination logistique. Mais la gestion en temps réel d\'un événement vivant, les relations VIP et l\'adaptation aux imprévus restent fondamentalement humains.',
    sources: [21] },

  { slug: 'photographe', label: 'Photographe', risk: 40, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute. La génération d\'images IA commoditise la photo de stock et publicitaire. Subsistent le portrait, l\'événementiel intime et le photojournalisme de terrain — la photo "qui a été là".',
    sources: [9] },

  { slug: 'videaste', label: 'Vidéaste / Monteur', risk: 50, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute. Génération vidéo et montage automatique progressent vite. Tu te concentres sur la direction artistique, la captation singulière et la narration — la valeur de l\'œil.',
    sources: [9] },

  // ── ÉDUCATION & FORMATION ──────────────────────────────

  { slug: 'enseignant-college', label: 'Enseignant collège / lycée', risk: 8, horizon: 10, status: 'protege',
    dynamic: 'L\'IA ne te remplace pas. Autorité pédagogique, médiation des conflits, transmission de la culture commune et présence physique sont au cœur de la mission éducative.',
    sources: [6] },

  { slug: 'enseignant-primaire', label: 'Enseignant primaire', risk: 6, horizon: 10, status: 'protege',
    dynamic: 'L\'IA ne te remplace pas. Apprentissage des fondamentaux, socialisation et structure affective ne peuvent être délégués à une machine. La demande structurelle est forte.',
    sources: [6] },

  // ── TRANSPORT & MOBILITÉ ───────────────────────────────

  { slug: 'pilote-ligne', label: 'Pilote de ligne', risk: 18, horizon: 10, status: 'protege',
    dynamic: 'L\'IA t\'assiste massivement, mais la responsabilité finale, la gestion de crise (Hudson River) et la conformité réglementaire (deux pilotes minimum) garantissent la profession encore longtemps.',
    sources: [21] },

  { slug: 'controleur-aerien', label: 'Contrôleur aérien', risk: 30, horizon: 10, status: 'protege',
    dynamic: 'L\'IA t\'assiste, mais la responsabilité légale absolue de la séparation aérienne et la gestion d\'incidents restent humaines. La demande explose avec la croissance du trafic post-COVID.',
    sources: [21] },

  { slug: 'conducteur-train', label: 'Conducteur de train', risk: 35, horizon: 10, status: 'mutation',
    dynamic: 'Ton métier mute lentement. Lignes automatisées (métro, certaines LGV) progressent, mais le réseau classique et le fret nécessitent la présence d\'un conducteur — pour des raisons techniques et syndicales.',
    sources: [21] },

  { slug: 'chauffeur-taxi-vtc', label: 'Chauffeur taxi / VTC', risk: 28, horizon: 10, status: 'protege',
    dynamic: 'L\'IA ne te remplace pas tout de suite. Le robotaxi avance dans certaines villes US, mais la complexité urbaine européenne, la régulation et le service client maintiennent la demande humaine.',
    sources: [21] },

  // ── MÉTIERS SCIENTIFIQUES ──────────────────────────────

  { slug: 'biologiste', label: 'Biologiste / Chercheur en biologie', risk: 28, horizon: 10, status: 'mutation',
    dynamic: 'Ton métier mute. L\'IA accélère drastiquement le criblage moléculaire, la génomique et la rédaction d\'articles. La paillasse expérimentale et la conception d\'hypothèses restent humaines.',
    sources: [21] },

  { slug: 'chimiste', label: 'Chimiste', risk: 32, horizon: 10, status: 'mutation',
    dynamic: 'Ton métier mute. Le design de molécules par IA et la simulation de réactions accélèrent la R&D. Tu te concentres sur la formulation, la validation expérimentale et l\'industrialisation.',
    sources: [21] },

  { slug: 'physicien', label: 'Physicien / Chercheur en physique', risk: 25, horizon: 10, status: 'mutation',
    dynamic: 'Ton métier mute. L\'IA accélère le traitement de données expérimentales massives (collisionneurs, télescopes). La théorie, l\'hypothèse et l\'expérimentation conceptuelle restent humaines.',
    sources: [21] },

  { slug: 'ingenieur-civil', label: 'Ingénieur civil / BTP', risk: 28, horizon: 10, status: 'protege',
    dynamic: 'L\'IA t\'assiste sur la modélisation et le calcul de structures. Mais la responsabilité d\'ouvrage, la coordination chantier et l\'adaptation au réel restent humaines. La transition énergétique soutient la demande.',
    sources: [21] },

  { slug: 'architecte', label: 'Architecte', risk: 38, horizon: 10, status: 'mutation',
    dynamic: 'Ton métier mute. La génération de plans et de rendus par IA commoditise une partie de la production. Tu te concentres sur la signature artistique, le dialogue client et la maîtrise réglementaire.',
    sources: [21] },

  { slug: 'urbaniste', label: 'Urbaniste', risk: 32, horizon: 10, status: 'mutation',
    dynamic: 'Ton métier mute. Modélisation urbaine et études d\'impact sont accélérées par l\'IA. Tu te concentres sur la concertation publique, l\'arbitrage politique et la vision territoriale long-terme.',
    sources: [21] },

  // ── DIVERS ─────────────────────────────────────────────

  { slug: 'directeur-general', label: 'Directeur général / CEO', risk: 15, horizon: 10, status: 'protege',
    dynamic: 'L\'IA ne te remplace pas. Vision, arbitrage stratégique, leadership et responsabilité ultime restent humains par construction. L\'IA t\'assiste sur l\'analyse, mais pas sur la décision.',
    sources: [21] },

  { slug: 'directeur-financier', label: 'Directeur financier (CFO)', risk: 30, horizon: 10, status: 'mutation',
    dynamic: 'Ton métier mute. Reporting et consolidation accélérés par l\'IA. Tu deviens partenaire stratégique du CEO, gestionnaire de la communication financière et arbitre des arbitrages capital-allocation.',
    sources: [7] },

  { slug: 'comedien', label: 'Comédien / Acteur', risk: 28, horizon: 10, status: 'protege',
    dynamic: 'L\'IA t\'imite (deepfake, voix synthétique). Mais la présence scénique, la prise de risque corporel et la connexion incarnée avec un public restent humaines. Le secteur se polarise vers les noms et l\'authenticité.',
    sources: [21] },

  { slug: 'musicien', label: 'Musicien / Compositeur', risk: 35, horizon: 10, status: 'mutation',
    dynamic: 'Ton métier mute. La musique générative IA inonde le streaming. Tu te concentres sur la performance live, la signature artistique forte et la création d\'œuvres incarnées.',
    sources: [21] },

  { slug: 'artiste-plasticien', label: 'Artiste plasticien', risk: 30, horizon: 10, status: 'mutation',
    dynamic: 'Ton métier mute. La génération d\'images IA bouleverse le marché. La valeur se déplace vers la pratique incarnée, la signature et le récit conceptuel. Le marché de l\'art récompense le geste irréductible.',
    sources: [21] },

  { slug: 'sportif-pro', label: 'Sportif professionnel', risk: 0, horizon: 10, status: 'protege',
    dynamic: 'L\'IA ne te remplace pas. La performance physique et l\'incarnation du jeu restent humaines par essence. Le secteur monétise même l\'IA pour optimiser l\'entraînement et l\'analyse vidéo.',
    sources: [21] },

  { slug: 'guide-touristique', label: 'Guide touristique', risk: 35, horizon: 10, status: 'protege',
    dynamic: 'L\'IA t\'assiste mais ne te remplace pas. Le récit incarné sur le lieu, l\'adaptation au groupe et l\'authenticité restent demandés. Le tourisme expérientiel soutient la profession.',
    sources: [21] },

  // ── MÉTIERS RESTAURÉS (legacy slugs préservés depuis le scanner v0.7) ──
  // Ces entrées maintiennent les URLs `/scanner?job=<slug>` historiques pour ne pas casser
  // les liens partagés. Le contenu est mis à niveau au schéma 2026 (statut éditorial + dynamique).

  { slug: 'technicien-support', label: 'Technicien support IT', risk: 66, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute. Le dépannage logiciel et matériel de niveau 1 est pris en charge par des agents internes capables de lire les logs et guider les utilisateurs. Tu remontes en complexité ou tu te fais commoditiser.',
    sources: [3] },

  { slug: 'analyste-donnees', label: 'Analyste données', risk: 67, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute. Nettoyage, agrégation et reporting standardisé sont absorbés par les agents intégrés aux plateformes BI. Tu pivotes vers la modélisation business, le storytelling data et l\'arbitrage stratégique.',
    sources: [3] },

  { slug: 'gestionnaire-projet', label: 'Gestionnaire de projet', risk: 52, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute. Suivi de tâches, comptes rendus et coordination basique sont automatisés. Tu te concentres sur la gestion humaine d\'équipe, l\'arbitrage de scope et la communication exécutive.',
    sources: [9] },

  { slug: 'responsable-qualite', label: 'Responsable qualité', risk: 50, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute. Contrôle conformité, reporting ISO et détection d\'anomalies sont accélérés par l\'IA. Tu te recentres sur la culture qualité, la gouvernance et l\'audit stratégique des risques.',
    sources: [3] },

  { slug: 'controleur-gestion', label: 'Contrôleur de gestion', risk: 60, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute. Reporting standardisé, écarts budgétaires et tableaux de bord sont automatisés. Tu te concentres sur le partenariat business, l\'arbitrage de scenarii stratégiques et la lecture critique des données.',
    sources: [7] },

  { slug: 'assistant-direction', label: 'Assistant de direction', risk: 62, horizon: 5, status: 'danger',
    dynamic: 'Tu es dans le viseur. Gestion d\'agendas, préparation de réunions, suivi de courriels : confiés à des agents virtuels. Subsistent les rares postes proches du pouvoir où la confiance et la discrétion priment.',
    sources: [3] },

  { slug: 'chef-de-produit', label: 'Chef de produit', risk: 48, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute. Specs, user stories et roadmaps brouillons sont générés par l\'IA. Tu te concentres sur la priorisation arbitrage, l\'alignement stakeholders et la vision produit — la partie irréductiblement politique.',
    sources: [10] },

  { slug: 'responsable-logistique', label: 'Responsable logistique', risk: 45, horizon: 10, status: 'mutation',
    dynamic: 'Ton métier mute. Planification, optimisation de routes et prévision de demande sont accélérées par l\'IA. Tu deviens orchestrateur d\'exceptions, négociateur transporteurs et arbitre stratégique multi-sites.',
    sources: [3] },

  { slug: 'responsable-communication', label: 'Responsable communication', risk: 42, horizon: 10, status: 'mutation',
    dynamic: 'Ton métier mute. Production de contenus, communiqués et reporting sont automatisés. Tu deviens stratège éditorial, gestionnaire de crise et garant de la marque — la part politique et humaine du rôle.',
    sources: [1] },

  { slug: 'technicien-laboratoire', label: 'Technicien de laboratoire', risk: 38, horizon: 10, status: 'mutation',
    dynamic: 'Ton métier mute. Robotique de laboratoire et IA d\'interprétation des résultats accélèrent les analyses. Tu te concentres sur la mise au point de protocoles, l\'assurance qualité et l\'expertise sur cas atypiques.',
    sources: [21] },

  { slug: 'infographiste', label: 'Infographiste', risk: 62, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute. La génération d\'images, retouches et déclinaisons de gabarits sont commoditisées par l\'IA. La direction artistique et la signature visuelle survivent ; l\'exécution se vend de moins en moins seule.',
    sources: [1] },

  { slug: 'actuaire', label: 'Actuaire', risk: 62, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute. Modélisation tarifaire, calcul de provisions et stress tests sont accélérés par l\'IA. Tu te concentres sur l\'innovation produit, la conformité Solvency et la gouvernance des modèles.',
    sources: [7] },

  { slug: 'administrateur-sys', label: 'Administrateur système', risk: 58, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute. Provisioning, patches et monitoring sont gérés par des agents IA et des outils IaC. Tu pivotes vers SRE, sécurité opérationnelle et architecture cloud — ou tu es remplacé par un script.',
    sources: [3] },

  { slug: 'ingenieur-reseau', label: 'Ingénieur réseau', risk: 50, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute. Configuration, troubleshooting et optimisation des liens sont automatisés. Tu te recentres sur l\'architecture réseau, la sécurité périmétrique et l\'intégration cloud-edge.',
    sources: [3] },

  { slug: 'responsable-si', label: 'Responsable SI / DSI', risk: 45, horizon: 10, status: 'mutation',
    dynamic: 'Ton métier mute. La gouvernance IT classique cède la place à la gouvernance des agents IA, de la donnée et des risques cyber. Tu deviens stratège technologique au service du métier — pas administrateur d\'infrastructure.',
    sources: [4] },

  { slug: 'acheteur', label: 'Acheteur', risk: 52, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute. Sourcing fournisseurs, RFP et benchmark prix sont accélérés par l\'IA. Tu te concentres sur la négociation stratégique, la résilience de la supply chain et la RSE des fournisseurs.',
    sources: [3] },

  { slug: 'responsable-achats', label: 'Directeur des achats', risk: 40, horizon: 10, status: 'mutation',
    dynamic: 'Ton métier mute. Le pilotage analytique des dépenses et la veille fournisseurs sont assistés par IA. La valeur reste dans la stratégie make-or-buy, la gestion des risques géopolitiques et la négociation top-niveau.',
    sources: [9] },

  { slug: 'geometre', label: 'Géomètre', risk: 35, horizon: 10, status: 'mutation',
    dynamic: 'Ton métier mute. Drones, LiDAR et IA de traitement nuage de points accélèrent les relevés. Tu te concentres sur l\'expertise foncière, la responsabilité légale et les missions complexes.',
    sources: [21] },

  { slug: 'ingenieur-automatisme', label: 'Ingénieur automatisme', risk: 40, horizon: 10, status: 'mutation',
    dynamic: 'Ton métier mute. La programmation d\'automates et la mise au point de cycles sont accélérées par l\'IA générative et les jumeaux numériques. Tu pivotes vers l\'intégration cyber-physique et la robotique collaborative.',
    sources: [9] },

  { slug: 'formateur', label: 'Formateur professionnel', risk: 35, horizon: 10, status: 'croissance',
    dynamic: 'Tu es dans le bon wagon. Le WEF projette que 39% des compétences devront être réapprises d\'ici 2030. La requalification massive crée un appel d\'air pour les formateurs en présentiel, surtout sur les soft skills.',
    sources: [10] },

  { slug: 'responsable-hse', label: 'Responsable HSE', risk: 32, horizon: 10, status: 'protege',
    dynamic: 'L\'IA t\'assiste sur la veille réglementaire et l\'analyse de risques. Mais l\'audit terrain, la culture sécurité et la responsabilité juridique restent humaines. La pression réglementaire soutient durablement la demande.',
    sources: [21] },

  { slug: 'agent-de-voyage', label: 'Agent de voyage', risk: 65, horizon: 5, status: 'danger',
    dynamic: 'Tu es dans le viseur. La réservation autonome, les agents IA conversationnels et les comparateurs ont massivement absorbé le métier. Subsistent uniquement les agences de niche (luxe, voyages d\'affaires complexes).',
    sources: [3] },

  { slug: 'chef-de-chantier', label: 'Chef de chantier', risk: 32, horizon: 10, status: 'protege',
    dynamic: 'L\'IA t\'assiste sur la planification et le suivi BIM. Mais la coordination terrain, la gestion d\'équipes humaines en environnement chaotique et la responsabilité d\'exécution restent fondamentalement humaines.',
    sources: [21] },

  { slug: 'ingenieur-mecanique', label: 'Ingénieur mécanique', risk: 35, horizon: 10, status: 'mutation',
    dynamic: 'Ton métier mute. Le design génératif, la simulation et l\'optimisation topologique sont accélérés par l\'IA. Tu te concentres sur l\'intégration systémique, la responsabilité produit et l\'innovation conceptuelle.',
    sources: [6] },

  { slug: 'technicien-son', label: 'Technicien son / image', risk: 38, horizon: 10, status: 'mutation',
    dynamic: 'Ton métier mute. Mixage automatique, étalonnage IA et upscaling vidéo commoditisent une partie du travail. Tu te concentres sur les captations live, la direction artistique sonore et les productions premium.',
    sources: [21] },

  { slug: 'carreleur', label: 'Carreleur', risk: 8, horizon: 10, status: 'protege',
    dynamic: 'L\'IA ne te remplace pas. Lecture du support, ajustement aux contraintes du chantier et précision millimétrique restent hors de portée des robots. La rénovation immobilière soutient durablement la demande.',
    sources: [21] },

  { slug: 'professeur-lycee', label: 'Professeur (lycée)', risk: 18, horizon: 10, status: 'protege',
    dynamic: 'L\'IA ne te remplace pas. Autorité pédagogique, médiation des conflits, transmission de la culture commune et présence physique sont au cœur de la mission éducative. La demande structurelle est forte.',
    sources: [6] },

  { slug: 'chef-cuisinier', label: 'Chef cuisinier', risk: 15, horizon: 10, status: 'protege',
    dynamic: 'L\'IA ne te remplace pas. Créativité culinaire, leadership en cuisine sous pression et signature gastronomique sont fondamentalement humaines. La gastronomie expérientielle continue de croître.',
    sources: [21] },

  { slug: 'technicien-maintenance', label: 'Technicien de maintenance', risk: 15, horizon: 10, status: 'protege',
    dynamic: 'L\'IA ne te remplace pas. Diagnostic sensoriel, intervention dans des espaces contraints et adaptation à des installations vieillissantes hétérogènes restent hors de portée des robots. La demande est structurelle.',
    sources: [21] },

  { slug: 'moniteur-auto-ecole', label: 'Moniteur d\'auto-école', risk: 18, horizon: 10, status: 'protege',
    dynamic: 'L\'IA ne te remplace pas. Pédagogie au volant, gestion du stress de l\'élève et adaptation en temps réel restent humaines. Le permis de conduire reste un rite de passage requérant un humain à côté.',
    sources: [21] },

  { slug: 'ambulancier', label: 'Ambulancier', risk: 12, horizon: 10, status: 'croissance',
    dynamic: 'Tu es dans le bon wagon. Soins d\'urgence, transport médicalisé et accompagnement psychologique du patient restent humains. Le vieillissement démographique fait croître structurellement la demande.',
    sources: [21] },

  { slug: 'ergotherapeute', label: 'Ergothérapeute', risk: 14, horizon: 10, status: 'croissance',
    dynamic: 'Tu es dans le bon wagon. Réadaptation fonctionnelle, adaptation du domicile et accompagnement post-AVC sont irréductibles à l\'IA. Le vieillissement et la complexité des handicaps soutiennent la demande.',
    sources: [21] },

  { slug: 'educateur-specialise', label: 'Éducateur spécialisé', risk: 12, horizon: 10, status: 'croissance',
    dynamic: 'Tu es dans le bon wagon. Accompagnement de personnes en situation de handicap, médiation familiale et insertion sociale exigent un jugement moral et une présence que l\'IA ne peut pas offrir.',
    sources: [22] },

  { slug: 'peintre-batiment', label: 'Peintre en bâtiment', risk: 8, horizon: 10, status: 'protege',
    dynamic: 'L\'IA ne te remplace pas. Préparation des supports, ajustement aux configurations et finition à l\'œil restent humaines. Robots peintres existent en industrie, jamais sur chantier résidentiel.',
    sources: [21] },

  { slug: 'patissier', label: 'Pâtissier', risk: 7, horizon: 10, status: 'protege',
    dynamic: 'L\'IA ne te remplace pas. Geste précis, créativité gustative et adaptation aux ingrédients restent humains. Le marché de l\'artisanat pâtissier soutient durablement la profession.',
    sources: [21] },

  { slug: 'moniteur-sport', label: 'Moniteur de sport', risk: 13, horizon: 10, status: 'protege',
    dynamic: 'L\'IA ne te remplace pas. Encadrement physique, motivation incarnée et adaptation au niveau de l\'élève restent humains. La demande de bien-être et de coaching personnalisé soutient la profession.',
    sources: [21] },

  { slug: 'dieteticien', label: 'Diététicien', risk: 20, horizon: 10, status: 'croissance',
    dynamic: 'Tu es dans le bon wagon. Apps de tracking nutritionnel proposent des plans automatisés, mais l\'accompagnement personnalisé sur troubles alimentaires et pathologies chroniques exige l\'humain. La demande explose.',
    sources: [21] },

  { slug: 'technicien-cvc', label: 'Technicien CVC (chauffage)', risk: 10, horizon: 10, status: 'croissance',
    dynamic: 'Tu es dans le bon wagon. Pompes à chaleur, climatisation et rénovation énergétique : la transition écologique structure une demande massive. Les entreprises peinent à recruter assez vite.',
    sources: [9] },

  { slug: 'serrurier', label: 'Serrurier', risk: 9, horizon: 10, status: 'protege',
    dynamic: 'L\'IA ne te remplace pas. Intervention d\'urgence, expertise mécanique et serrurerie sécurisée sur installations existantes restent humaines. La demande est stable.',
    sources: [21] },

  { slug: 'conducteur-engins', label: 'Conducteur d\'engins', risk: 18, horizon: 10, status: 'croissance',
    dynamic: 'Tu es dans le bon wagon. Engins autonomes progressent en mine et en agriculture, mais le BTP urbain non standardisé reste humain. La transition énergétique et le logement structurent la demande.',
    sources: [9] },

  { slug: 'pompiste', label: 'Technicien de surface', risk: 8, horizon: 10, status: 'protege',
    dynamic: 'L\'IA ne te remplace pas. Le nettoyage en environnements complexes, l\'adaptation aux salissures et la responsabilité hygiène en milieu sensible restent fondamentalement humains.',
    sources: [21] },

  // ── AJOUTS COMMUNAUTÉ (métiers signalés par les utilisateurs) ──

  { slug: 'business-analyst', label: 'Business Analyst', risk: 58, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute. Traduction des besoins métier en specs, reporting et analyse de données structurées sont accélérés par l\'IA. Tu te concentres sur l\'arbitrage entre stakeholders, la modélisation de processus complexes et la conduite du changement.',
    sources: [3, 4] },

  { slug: 'asset-manager', label: 'Asset Manager', risk: 52, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute. McKinsey projette 8% de gain d\'efficacité par l\'IA générative sur la recherche, l\'analyse de tendances et la due diligence. Tu te recentres sur la relation client institutionnel et l\'arbitrage stratégique.',
    sources: [4, 7] },

  { slug: 'portfolio-manager', label: 'Portfolio Manager', risk: 54, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute. Screening, rebalancing et optimisation de portefeuilles sont accélérés par l\'IA prédictive. La valeur humaine se déplace vers la conviction d\'investissement, la gestion des biais émotionnels du client et les cas atypiques.',
    sources: [4, 7] },

  { slug: 'consultant-it', label: 'Consultant IT', risk: 45, horizon: 10, status: 'mutation',
    dynamic: 'Ton métier mute. Audits techniques, roadmaps de transformation et benchmarks fournisseurs sont accélérés par l\'IA. La demande explose à l\'inverse pour les consultants spécialisés IA — déploiement, gouvernance, MLOps.',
    sources: [4, 13] },

  { slug: 'expert-immobilier', label: 'Expert immobilier', risk: 42, horizon: 10, status: 'mutation',
    dynamic: 'Ton métier mute. Les AVM (modèles de valorisation automatique) absorbent les biens standards en data-rich markets. Tu te concentres sur les biens atypiques, l\'expertise judiciaire et la responsabilité légale — irréductibles à l\'IA.',
    sources: [21] },

  { slug: 'juriste', label: 'Juriste d\'entreprise', risk: 55, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute. Revue contractuelle, recherche jurisprudentielle et notes de conformité sont les terrains de chasse les plus efficaces des LLM. Tu pivotes vers le conseil stratégique au business, la gestion du risque réglementaire et l\'arbitrage des cas complexes — ou tu te fais commoditiser.',
    sources: [3, 7] },

  { slug: 'greffier', label: 'Greffier(ère)', risk: 58, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute. Transcription d\'audience, indexation de dossiers, rédaction d\'actes types : la quasi-totalité du quotidien est en première ligne des LLM. La foi du greffe et la certification officielle te protègent, mais le poste se contracte — moins de greffiers pour plus de procédures.',
    sources: [3, 7] },
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
