---
type: claim
title: "Le rôle change la réponse en alignant le vocabulaire et le ton sur le métier spécifié"
slug: role-change-reponse-alignement-vocabulaire
maintainer: hermes
provenance:
  - source: content/rapports/2026-05-21-comment-ecrire-prompt-ameliore-reponses.md
    extracted_at: 2026-06-03T18:22:00Z
linked_concepts: []
linked_claims: []
linked_examples: []
confidence: 0.94
quarantined: false
---

En définissant un rôle (ex: *expert RH suisse senior*, *analyste data B2B*), l’utilisateur pousse le LLM à adopter le vocabulaire, le ton et les références propres au métier. Cela évite les réponses génériques et rend la sortie directement utilisable dans un contexte professionnel.

## Contexte

Un prompt standard oriente l’IA vers une **voix grand public neutre**. En y ajoutant un rôle métier, la réponse gagne en spécificité, précision et pertinence métier.

## Cross-references

- Exemple d’application : [[six-composants-structurer-prompt]] (composant *Rôle*).
- Lien avec [[llm-complete-patterns-statistiques]] pour comprendre pourquoi le rôle réduit la variance des réponses.

## Source brute

> « Le rôle est l'ancre du pattern. Sans rôle, le LLM répond depuis sa moyenne statistique, qui est une voix grand public neutre. Avec rôle, il bascule dans le vocabulaire, le ton et les références du métier que tu lui as donné. »
