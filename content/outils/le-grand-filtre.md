---
code: le-grand-filtre
kind: cheatsheet
title: Le grand filtre
subtitle: "La matrice qui croise conformité LPD, secret d'affaires et réalité opérationnelle pour 7 catégories d'outils IA."
description: "Matrice consultable. Croise conformité LPD, protection du secret d'affaires et réalité opérationnelle pour 7 catégories d'outils IA (ChatGPT, API, Azure, Bedrock, Infomaniak, self-host). Gratuit, PDF téléchargeable, indexable."
kicker: KIT · LE GRAND FILTRE
parentArticleSlug: angles-morts-ia-entreprise-suisse
specs:
  - "7 OUTILS"
  - "3 DIMENSIONS"
  - "MATRICE CONSULTABLE"
  - "PDF TÉLÉCHARGEABLE"
calloutPitch: "Tu veux savoir si ton outil IA expose ta boîte ? Le grand filtre croise trois dimensions (conformité LPD, secret d'affaires, réalité opérationnelle) pour 7 catégories d'outils. Une consultation, un verdict."
metiers: []
intro: |
  Tu veux intégrer l'IA dans ton entreprise sans mettre tes données client ou ton secret d'affaires en risque. Mais entre "ChatGPT", "API OpenAI", "Azure CH", "Infomaniak", "Llama en self-host", les éditeurs te jurent tous que c'est "sécurisé". Sauf que ce mot recouvre trois choses qui ne se recoupent pas.

  Le grand filtre croise ces trois choses pour 7 catégories d'outils.

  Lis dans cet ordre : matrice 1 (conformité LPD, ai-je le droit ?), matrice 2 (secret d'affaires, mon secret tient-il face au Cloud Act ?), matrice 3 (réalité opérationnelle, qu'est-ce qui va peser une fois l'outil choisi ?).

  **Légende verdicts** : vert = conforme / risque faible, orange = sous conditions (a, b, c, voir conditions plus bas), rouge = non / risque élevé.

  ### Matrice 1 : conformité LPD

  | Outil | Résidence | DPA | No-train | Verdict |
  |---|---|---|---|---|
  | ChatGPT perso (Free / Plus) | US | Non | Non | Non conforme |
  | ChatGPT Team / Enterprise | US (UE option) | Oui | Oui | Conforme sous condition **a** |
  | API OpenAI (+ ZDR) | US | Oui | Oui | Conforme sous condition **a** |
  | Azure OpenAI (CH North) | CH | Oui | Oui | Conforme |
  | AWS Bedrock (Zurich) | CH | Oui | Oui | Conforme |
  | Infomaniak AI (API) | CH | Oui | Oui | Conforme |
  | Self-host (Ollama / on-prem) | CH requis **c** | Sans objet | Oui | Conforme **c** |

  ### Matrice 2 : secret d'affaires et souveraineté

  | Outil | CMK / clés | Cloud Act | Verdict |
  |---|---|---|---|
  | ChatGPT perso | Non | Élevé | Exposé |
  | ChatGPT Team / Enterprise | Non | Élevé | Risqué |
  | API OpenAI (+ ZDR) | Non | Élevé | Risqué |
  | Azure OpenAI (CH North) | Oui (+ HYOK) | Moyen | Bon **b** |
  | AWS Bedrock (Zurich) | Oui (+ HYOK) | Moyen | Bon **b** |
  | Infomaniak AI (API) | Chiffrement CH | Nul | Protégé |
  | Self-host | Total | Nul | Maximal **c** |

  ### Matrice 3 : réalité opérationnelle

  | Outil | Point d'attention |
  |---|---|
  | ChatGPT perso | Le cauchemar du Shadow IT. Aucun contrôle d'accès, aucune visibilité sur ce que les employés copient-collent. |
  | ChatGPT Team / Enterprise | Faux sentiment de sécurité. Protège contre l'entraînement, pas contre une injonction étrangère. Exige une gouvernance SSO stricte. |
  | API OpenAI (+ ZDR) | Nécessite un middleware. Prévoir un tampon en amont pour filtrer ou pseudonymiser les requêtes avant le départ US. |
  | Azure OpenAI (CH North) | Lourdeur de configuration. Le niveau "Bon" suppose d'empiler HYOK + calcul confidentiel + exemption de journalisation. |
  | AWS Bedrock (Zurich) | Profil jumeau d'Azure. Souveraineté par empilement KMS externalisé + Nitro Enclaves. |
  | Infomaniak AI (API) | Écart de performance possible sur les raisonnements très complexes vs modèles frontière propriétaires. |
  | Self-host | Le piège de l'infrastructure. Le risque se déplace vers ta sécurité interne (accès, sauvegardes, durcissement). Coûts GPU souvent cachés. |
outro: |
  ## Lecture des verdicts et conditions

  Le verdict LPD dépend de la chaîne : résidence + DPA + non-entraînement + encadrement du transfert.
  Le verdict secret d'affaires dépend de qui peut, de fait, accéder au contenu : maîtrise des clés et exposition au Cloud Act.

  ### Condition a : transfert vers les États-Unis

  "Conforme" seulement si le mécanisme de transfert est en place : fournisseur certifié Swiss-US DPF (adéquation reconnue depuis septembre 2024, à vérifier sur la liste officielle dataprivacyframework.gov/list, certification annuelle) **ou** clauses contractuelles types + analyse d'impact (TIA). Le statut DPF d'OpenAI est ambigu selon les sources ; Microsoft est certifié.

  ### Condition b : niveau "Bon" Azure / Bedrock

  Atteint uniquement en empilant : clé en HYOK (hors d'atteinte de l'hébergeur), calcul confidentiel (TEE) pour l'inférence, et exemption de journalisation. Sans ces couches, le verdict retombe à "Moyen".

  ### Condition c : self-host

  Valable à deux conditions : serveur physiquement en Suisse (matériel propre ou hébergeur suisse type Infomaniak ; un VPS étranger ou un cloud américain fait retomber la résidence et peut réintroduire le Cloud Act par la couche infrastructure), **et** sécurité interne (accès, sauvegardes, durcissement) à la hauteur.

  ## Le cas des agents de codage (Claude Code, Cursor, Antigravity, Copilot, Codex)

  Les agents de codage ne sont pas une ligne de la matrice : ce sont des clients, pas des backends d'hébergement. Leur conformité hérite du moteur d'inférence vers lequel ils sont configurés.

  - **Claude Code** : configurable. Par défaut, API Anthropic (US), profil "API OpenAI". Routé vers Bedrock, Vertex ou Foundry (région européenne ou cloud privé), profil "Azure / Bedrock CH". Sur un plan grand public (Pro/Max) l'entraînement peut être actif par défaut, même piège que ChatGPT personnel. Sur les plans commerciaux (API, Bedrock, Vertex, Team, Enterprise) : pas d'entraînement.
  - **Antigravity (Google)** : cloud-native, code par défaut sur les serveurs Google, profil "US". Via la plateforme Google Cloud entreprise (région suisse, Google certifié DPF), il se rapproche du profil "Azure / Bedrock CH". En exécution locale (Ollama), il rejoint le profil "self-host".

  **Deux règles propres aux agents**

  - **Périmètre** : un agent touche du code, pas des données de production. Garder l'agent sur du code et des données de test ou synthétiques, jamais sur des données personnelles ou réglementées réelles. Surveiller les secrets (clés API, mots de passe) qui ne doivent finir ni dans un prompt ni dans un cache local.
  - **Accès local** : les agents lisent le dépôt, exécutent des commandes, pilotent parfois un navigateur. Certains conservent les transcripts en clair localement. La surface d'exposition (exfiltration, injection de prompt) est plus large qu'un chatbot et appelle un contrôle d'accès strict.

  ## Avant de déployer (checklist)

  - **DPA / contrat de sous-traitance signé** (art. 9 LPD)
  - **Mécanisme de transfert** pour tout flux hors CH/UE : adéquation Swiss-US DPF ou CCT + analyse d'impact (TIA)
  - **Confirmation contractuelle du non-entraînement** (et du zero-data-retention si disponible)
  - **AIPD** (analyse d'impact) si le risque est élevé
  - **Mise à jour du registre des traitements** et de la politique de confidentialité ; information des personnes concernées
  - **Mesures techniques** : chiffrement, contrôle d'accès, journalisation

  Spécifique Azure / Bedrock CH : clé externalisée en HYOK + calcul confidentiel (TEE) + exemption de journalisation.

  Périmètre FINMA : notification d'externalisation, clause d'audit, plan de réversibilité (Circ. 2018/3). Politique interne d'usage de l'IA + classification des données.

  ## Glossaire

  - **LPD** : Loi fédérale suisse sur la protection des données, dans sa version révisée en vigueur depuis le 1er septembre 2023.
  - **RGPD** : Règlement général européen sur la protection des données.
  - **Donnée personnelle** : information se rapportant à une personne identifiée ou identifiable.
  - **Anonymisation** : rupture durable du lien avec la personne (réidentification à effort disproportionné) ; sort la donnée du champ de la loi.
  - **Pseudonymisation** : remplacement des identifiants par un pseudonyme, clé conservée à part ; la donnée reste personnelle.
  - **DPA** : Data Processing Agreement, contrat de sous-traitance (art. 9 LPD).
  - **CCT / SCC** : clauses contractuelles types pour les transferts transfrontières.
  - **Swiss-US DPF** : Data Privacy Framework ; depuis le 15 septembre 2024, voie d'adéquation pour les transferts vers les entreprises US certifiées.
  - **TIA** : Transfer Impact Assessment, requise hors voie d'adéquation.
  - **ZDR** : Zero Data Retention.
  - **CMK** : Customer-Managed Keys.
  - **HYOK** : Hold Your Own Key, clé hors d'atteinte de l'hébergeur.
  - **TEE / calcul confidentiel** : Trusted Execution Environment, protège la donnée en mémoire pendant le traitement.
  - **Cloud Act** : loi américaine permettant d'exiger d'une entreprise US la communication de données, y compris stockées hors des États-Unis.
  - **AIPD** : Analyse d'impact relative à la protection des données.
  - **FINMA (Circ. 2018/3)** : cadre suisse de l'externalisation applicable aux établissements financiers.

  ## Limites

  Ce document est une aide à la décision. Il ne constitue pas un avis juridique. La qualification précise des données et la conformité d'un déploiement donné doivent être validées par un conseil juridique spécialisé, en particulier sur le volet FINMA. Les caractéristiques des fournisseurs (résidence, options de chiffrement, statut DPF, conditions contractuelles) évoluent et doivent être vérifiées au moment de la contractualisation.

  Date de dernière révision : 7 juin 2026.

  ## Télécharger le PDF

  Le grand filtre est aussi disponible en PDF : [le-grand-filtre.pdf](/downloads/le-grand-filtre.pdf)

  ## Pour aller plus loin

  L'article pilier ["Les angles morts de l'IA en entreprise suisse"](/rapports/angles-morts-ia-entreprise-suisse) déplie chacun des angles morts avec des exemples concrets.

  Pour recevoir les mises à jour de la matrice quand le marché bouge (nouveaux outils, changements de statut DPF, évolutions FINMA), inscris-toi à [La Fréquence](/frequence).
data:
  posthog_event_prefix: le_grand_filtre
---
