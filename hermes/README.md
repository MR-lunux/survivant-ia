# Hermes — Pipeline de contenu Survivant-IA

Dossier de référence opérationnelle pour le projet Hermes.
Spec canonique : `docs/superpowers/specs/2026-06-02-hermes-pipeline-contenu-design.md`.
Ce dossier-ci est le **breakdown navigable** des sections du design + logs et checklists actionnables.

## Navigation

| Fichier | Quoi |
|---|---|
| `01-infrastructure.md` | VPS, Coolify, Traefik, DNS, routing modèles, monitoring |
| `02-vault-structure.md` | Arborescence repo, frontmatter, conventions Hermes/Mathieu, `.hermesignore` |
| `03-karpathy-pipeline.md` | Skills ingest / query / lint, hard rules, cross-model audit |
| `04-push-flow.md` | Telegram bot, Web UI, draft-from-idea, mode annonce-outil, validation V1 |
| `05-pull-flow.md` | 9 sources, pipeline filtrage, brief matinal 6h30, garde-fous anti-burnout |
| `06-security-ops-install.md` | Secrets, backup, update, pre-install checklist, calendrier 3 semaines |
| `decisions-log.md` | Log brainstorming 2026-06-02 — toutes les décisions et leurs raisons |
| `install-checklist.md` | Checklist actionnable J1-J2 |
| `research-findings.md` | Synthèse 18+ sources avec liens (pour comprendre les arbitrages) |

## TL;DR du projet

Un agent Hermes (Nous Research, MIT, self-hosted) tourne sur le VPS Infomaniak (`hermes.survivant-ia.ch`), connecté à Infomaniak AI. Il transforme un article ou un outil shippé en dérivés LinkedIn + TikTok via un second cerveau Karpathy LLM Wiki versionné dans le repo Git. Validation manuelle systématique sur Telegram, publication à la main par Mathieu. Newsletter La Fréquence différée (0 numéro envoyé). Coût cible 6-20 CHF/mois.

## État

- **Brainstorming** : terminé 2026-06-02
- **Spec écrit** : 2026-06-02
- **Implementation plan** : à écrire après review Mathieu du spec
- **Install** : pas démarré

## Hard rules à garder en tête à tout moment

1. Hermes ne publie JAMAIS. Hermes draft, Mathieu publie.
2. Hermes ne touche JAMAIS un fichier `maintainer: human`.
3. Hermes n'invente JAMAIS un chiffre, date, lieu, ou détail bio sur Mathieu.
4. Citation verbatim obligatoire dans toute atomic note.
5. Voice-check humanizer obligatoire avant livraison de draft.
6. Si exit criteria atteint → Hermes alerte et s'arrête.
