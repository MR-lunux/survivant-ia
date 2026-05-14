---
code: generateur-ecriture-comptable
kind: app
title: Générateur d'écriture comptable
subtitle: Dicte ou écris une écriture, l'IA la structure dans ton journal.
description: Outil interactif gratuit pour comptable et fiduciaire Suisse. Dicte ou écris une écriture en langage naturel, l'IA souveraine d'Infomaniak (AI Service) la structure selon le plan comptable PME. Télécharge ton journal au format Excel importable dans Bexio, Abacus ou Sage 50.
kicker: OUTIL · GÉNÉRATEUR D'ÉCRITURE COMPTABLE
parentArticleSlug:
metiers:
  - comptable
  - expert-comptable
  - assistant-administratif
specs:
  - "VOIX + TEXTE"
  - "PLAN COMPTABLE PME"
  - "IA HÉBERGÉE EN SUISSE"
  - "10 ESSAIS / JOUR"
calloutPitch: "Dicte ou écris une écriture en langage naturel, l'IA souveraine d'Infomaniak la structure dans ton journal Excel. Plan comptable PME Suisse, TVA, conversion HT/TTC. Rien n'est sauvé."
intro: |
  Cet outil structure une écriture comptable Suisse à partir d'une description en langage naturel. Tu décris en tapant ou en dictant : « Migros 47.80 frais représentation client X hier », l'IA propose : date, libellé, comptes débit/crédit, TVA, HT/TTC. Tu valides ou tu corriges, tu ajoutes au journal, tu télécharges en Excel.
outro: ''
faq:
  - question: "Mes données partent-elles aux États-Unis ?"
    answer: "Non. Le moteur IA est hébergé dans les datacenters Infomaniak en Suisse (certifiés ISO 27001, conformes nLPD). Aucun appel n'est routé vers OpenAI, Anthropic, Google ou un fournisseur extra-européen."
  - question: "Mes prompts servent-ils à entraîner des modèles ?"
    answer: "Non. Infomaniak AI Service contracte explicitement le no-training : tes descriptions d'écriture ne nourrissent ni Mistral, ni Whisper, ni aucun modèle tiers. C'est l'avantage face à ChatGPT, Claude.ai ou Gemini grand public, qui entraînent par défaut sur les conversations."
  - question: "Qu'est-ce que Survivant-IA garde de mes écritures ?"
    answer: "Rien. Le journal vit uniquement dans ton navigateur (mémoire de session). Aucune base de données, aucun cache, aucun log applicatif ne stocke le contenu de tes écritures. Seuls les codes d'erreur techniques (timeout, validation ratée) sont loggés pour debug, jamais le texte saisi. Tu fermes l'onglet, tout disparaît côté Survivant-IA."
  - question: "Quel modèle d'IA fait le travail ?"
    answer: "Mistral Ministral-3 (14 milliards de paramètres, instruction-tuned), servi par Infomaniak. Le choix : modèle ouvert, performant en français, fort en JSON structuré, hébergé en Suisse. Pas du GPT-4 ou Claude, pas besoin de la puissance d'un frontier model pour structurer une ligne comptable."
  - question: "Combien coûte un appel à Survivant-IA ?"
    answer: "Côté Infomaniak (le moteur IA), une écriture parsée coûte environ 0,024 centime suisse (~700 tokens entrants à 0,30 CHF par million + ~80 tokens sortants à 0,40 CHF par million). Une dictée vocale de 10 secondes via Whisper V3 ajoute environ 0,1 centime. Concrètement : 1 franc te paye plus de 4000 écritures texte ou environ 1000 dictées. C'est offert ici, mais à toi de mesurer ce que ça représente vs. un comptable à 150 CHF de l'heure."
  - question: "Pourquoi seulement 10 essais par jour ?"
    answer: "Limite anti-abus par IP, pas pour t'embêter, pour éviter qu'un bot ratisse l'outil et fasse exploser ma facture Infomaniak. À 0,024 centime l'écriture, 10 essais par jour suffisent largement pour évaluer si c'est utile dans ton flux. Si tu veux passer en production sur de vrais volumes, écris-moi."
data:
  ratelimit_per_day: 10
  posthog_event_prefix: generateur_ecriture
---
