---
type: concept
title: "Les six composants clés pour structurer un prompt efficace"
slug: six-composants-structurer-prompt
maintainer: hermes
provenance:
  - source: content/rapports/2026-05-21-comment-ecrire-prompt-ameliore-reponses.md
    extracted_at: 2026-06-03T18:22:00Z
linked_concepts: []
linked_claims: []
linked_examples: []
confidence: 0.93
quarantined: false
---

Pour rédiger un prompt qui génère une réponse utile, six composants sont recommandés par les guides de référence (Anthropic, Google, etc.) :
- **Rôle** : définir l’identité de l’IA pour adapter sa réponse au contexte métier.
- **Tâche** : décrire l’action précise attendue, sans ambiguïté.
- **Format** : spécifier la structure, la longueur ou le ton de la réponse.
- **Contexte** (optionnel) : donner les informations nécessaires pour ancrer la réponse dans un cadre réel.
- **Contraintes** (optionnel) : exclure ce qui n’est pas souhaité.
- **Exemples** (optionnel) : montrer des templates pour guider le style.

## Contexte

Ces six leviers ne nécessitent pas de maîtriser un langage de programmation. Ils s’appliquent en français, en langage naturel structuré, pour réduire l’ambiguïté et maximiser l’utilité de la réponse.

## Cross-references

- Guide [[sructurer-son-prompt]] pour une application pratique.
- Lien avec [[role-change-reponse-alignement-vocabulaire]] pour l’impact du composant *Rôle*.

## Source brute

> « Trois sont obligatoires, trois sont optionnels mais souvent décisifs. [Les six composants :] 1. Le rôle, 2. La tâche, 3. Le format de sortie, 4. Le contexte (optionnel), 5. Les contraintes (optionnel), 6. Les exemples (optionnel). »
