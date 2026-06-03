---
type: concept
title: "Le LLM complète des patterns statistiques plutôt que de comprendre comme un humain"
slug: llm-complete-patterns-statistiques
maintainer: hermes
provenance:
  - source: content/rapports/2026-05-21-comment-ecrire-prompt-ameliore-reponses.md
    extracted_at: 2026-06-03T18:22:00Z
linked_concepts: []
linked_claims: []
linked_examples: []
confidence: 0.95
quarantined: false
---

Un LLM ne fonctionne pas comme un humain : il génère du texte en choisissant le mot suivant le plus probable, en fonction des patterns statistiques présents dans ses données d’entraînement. Cela explique pourquoi un prompt vague produit des réponses moyennes (statistiquement médianes), alors qu’un prompt précis réduit le champ des réponses plausibles et oriente vers une sortie alignée avec l’intention de l’utilisateur.

## Contexte

Le modèle n’a pas de compréhension sémantique au sens humain. Il identifie des patterns et génère la suite la plus **statistiquement probable**. Plus les patterns fournis via le prompt sont précis, plus la réponse finale sera ciblée.

## Cross-references

- Contraste avec [[comprendre-vs-completer]] sur la notion d’intention vs prédiction.
- Lien avec [[prompt-mauvaise-cadrage-genere-reponses-moyennes]] pour l’impact d’un prompt imprécis.

## Source brute

> « Le LLM ne comprend pas comme un humain comprend bien qu'on lui parle en language naturel. Il complète des patterns statistiques. Plus le pattern qu'on lui pose est précis, plus la réponse qui suit est précise. »
