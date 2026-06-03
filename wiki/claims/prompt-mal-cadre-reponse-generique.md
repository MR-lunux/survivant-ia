---
type: claim
title: "Un prompt mal cadré produit une réponse générique, même avec le même modèle"
slug: prompt-mal-cadre-reponse-generique
maintainer: hermes
provenance:
  - source: content/rapports/2026-05-21-comment-ecrire-prompt-ameliore-reponses.md
    extracted_at: 2026-06-03T18:22:00Z
linked_concepts: []
linked_claims: []
linked_examples: []
confidence: 0.92
quarantined: false
---

En restructurant un prompt avec un rôle explicite, une tâche précise et un format défini, l’utilisateur guide le LLM vers une réponse ciblée. Ce n’est pas le modèle qui devient plus performant, mais le cadrage qui permet au LLM de limiter les réponses plausibles à celles qui répondent *vraiment* à la demande.

## Contexte

Un même prompt appliqué à un même modèle génère des réponses différentes selon sa formulation. Un cadrage **précis** diminue l’ambiguïté et augmente la pertinence de la sortie.

## Cross-references

- Complément à [[llm-complete-patterns-statistiques]] pour expliquer l’effet du cadrage sur les patterns générés.
- Lien avec [[six-composants-structurer-prompt]] pour une méthode de cadrage efficace.

## Source brute

> « Le même prompt brut, mal cadré, donne une réponse vague et générique. Le même prompt restructuré avec un rôle clair, une tâche précise, un format défini, donne une meilleure réponse. »
