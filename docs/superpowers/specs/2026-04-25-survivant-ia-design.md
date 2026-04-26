# Mathieu le Survivant de l'IA — Design Spec
**Date** : 2026-04-25
**Statut** : Approuvé

---

## Vision

Aider les professionnels français à ne pas se faire remplacer par l'IA en développant leurs soft skills et leur compréhension des algorithmes. Positionnement : guide humain et pragmatique — pas un expert tech, pas un alarmiste.

**Audience cible** : Employés "cols blancs" francophones qui ont peur pour leur poste, qui veulent des outils concrets et accessibles, sans jargon technique.

**Tagline concept** : "L'IA ARRIVE. NE SOYEZ PAS UNE VARIABLE SUPPRIMÉE."

---

## Phase 1 — Ce qu'on construit

| Fonctionnalité | Description |
|---|---|
| Site post-apo distinctif | Design "Brutalisme Corporatif Post-Apo", sombre, professionnel |
| Blog SEO | Articles pratiques sur soft skills et comprendre l'IA |
| Hub de contenu | Centralise les posts LinkedIn, Instagram, YouTube Shorts |
| Newsletter automatique | Nouvel article → Brevo envoie automatiquement via RSS |
| Formulaire d'inscription | Capture emails visiteurs ("Rejoindre la Fréquence") |
| Liens réseaux sociaux | LinkedIn, Instagram, YouTube dans le footer/header |
| SEO optimisé | Sitemap auto, balises, indexation Google |
| Stats newsletter | Dashboard Brevo : ouvertures, clics, heatmap |
| Scroll tracking | Microsoft Clarity : où les lecteurs décrochent |

## Phase 2 — Plus tard (quand ~300 abonnés)

| Fonctionnalité | Description |
|---|---|
| Système de grades | XP, niveaux façon Ken le Survivant |
| Diplôme de Survivor | Parcours de formation payant |
| Monétisation | Brevo automation triggers pour vente |

---

## Stack Technique

| Outil | Rôle | Coût |
|---|---|---|
| Nuxt 3 + TailwindCSS | Site, design, structure pages | Gratuit |
| Nuxt Content | Gestion articles en markdown | Gratuit |
| `@nuxtjs/seo` | Sitemap auto, balises SEO, canonical | Gratuit |
| Vercel | Hébergement + déploiement auto sur commit | Gratuit |
| Brevo | Newsletter + automations + stats + RSS-to-email | Gratuit |
| LinkedIn Newsletter | Top of funnel, découverte audience FR | Gratuit |
| Google Search Console | Indexation Google, suivi positions | Gratuit |
| Microsoft Clarity | Scroll tracking, heatmap visiteurs | Gratuit |
| Nom de domaine | survivant-ia.fr ou similaire | ~10€/an |

**Coût total : ~10€/an**

---

## Direction Artistique — "Brutalisme Corporatif Post-Apo"

L'ambiance : bunker high-tech abandonné. Professionnel et distinctif. Pas de désert orange ni de crânes — le clin d'œil survivant est dans les détails UI, pas dans la caricature.

### Palette de couleurs

| Token | Valeur | Usage |
|---|---|---|
| `--color-bg` | `#0D0D0D` | Fond principal (Noir Carbone) |
| `--color-text` | `#E0E0E0` | Texte courant (Gris clair) |
| `--color-accent` | `#00FF41` | Boutons, liens, statuts [ONLINE] (Vert Matrix) |
| `--color-danger` | `#FF3E3E` | Alertes, dangers IA dans articles (Rouge néon) |

### Typographie

| Usage | Police | Raison |
|---|---|---|
| Titres H1/H2 | Space Mono ou JetBrains Mono | Évoque le terminal, la machine |
| Corps de texte | Inter ou Plus Jakarta Sans | Lisibilité humaine, confort lecture |

Contraste intentionnel Humain (Inter) vs Machine (Mono) — c'est le message du projet incarné dans le design.

### Effets UI "Survivant" (subtils)

- **Grain de film** : léger bruit CSS en arrière-plan sur tout le site (texture organique, pas trop lisse)
- **Bordures scanner** : coins de cadres seulement (pas de bordure complète) sur images et sections — effet viseur caméra
- **Effet scanline** : lignes horizontales semi-transparentes sur boutons et miniatures vidéo — référence moniteurs CRT
- **Glitch au survol** : effet glitch CSS sur les boutons CTA principaux

### Wording distinctif

| Standard | Survivant |
|---|---|
| S'inscrire | Rejoindre la Fréquence |
| Derniers articles | Rapports de Zone |
| À propos | Identité du Survivant |
| Contact | Envoyer un Signal |
| Accueil | Base Opérationnelle |

---

## Structure du Site

### Pages Phase 1

**`/` — Base Opérationnelle (Home)**
- Hero : fond noir carbone + grain, titre Space Mono vert néon, sous-titre Inter
- Manifeste en 3 lignes : qui est Mathieu, pourquoi ce projet
- Derniers "Rapports de Zone" (3 articles récents)
- CTA "Rejoindre la Fréquence" (formulaire Brevo inline)
- Liens réseaux sociaux

**`/rapports` — Rapports de Zone (Blog)**
- Grille d'articles avec bordures scanner
- Filtres par thème : Soft Skills / Comprendre l'IA / Cas Pratiques
- Chaque carte : titre Mono, extrait Inter, tag de catégorie en vert néon

**`/frequence` — Rejoindre la Fréquence (Newsletter)**
- Page dédiée inscription Brevo
- Promesse claire : "1 rapport de survie par semaine"
- Aperçu d'un ancien numéro

**`/identite` — Identité du Survivant (À propos)**
- Qui est Mathieu, son parcours chef de projet IT
- Pourquoi ce projet, l'angle humain
- Photo avec traitement graphique post-apo (optionnel)

### Structure des articles (Nuxt Content)

```
content/
  rapports/
    YYYY-MM-DD-slug-article.md
```

Frontmatter minimal :
```yaml
---
title: ""
description: ""
date: YYYY-MM-DD
category: soft-skills | comprendre-ia | cas-pratiques
---
```

---

## Stratégie Newsletter — "Le Tunnel de l'Abri"

### LinkedIn Newsletter = L'Appât (Top of Funnel)
- Contenu : analyses actualité IA, coups de gueule, contenu large et viral
- Objectif : prouver l'expertise, profiter du boost algorithmique LinkedIn
- CTA systématique : "Pour les fiches pratiques non censurées par l'algo → Rejoindre la Fréquence [lien site]"

### Brevo = L'Arsenal (Bottom of Funnel)
- Contenu : cas concrets détaillés, tutoriels soft skills, offres Phase 2
- Avantage : tracking comportemental (qui clique sur quoi → automation ciblée)
- Phase 2 : si abonné clique 3x sur "Formation IA" → séquence email automatique dédiée

### Workflow de publication (aucune double saisie)

```
1. Mathieu écrit l'article dans Nuxt Content (markdown)
2. Git commit → Vercel redéploie automatiquement
3. Brevo détecte le nouveau flux RSS → envoie "Nouveau Rapport de Zone disponible"
4. Mathieu poste un résumé punchy sur LinkedIn Newsletter + lien "Version complète sur le site"
```

---

## SEO

- `@nuxtjs/seo` : sitemap.xml auto-généré, Open Graph, Twitter Card, canonical
- Google Search Console : soumission sitemap une fois au lancement (5 min)
- Nuxt SSG (Static Site Generation) : pages pré-rendues en HTML pur, crawlable à 100%
- Stratégie de mots-clés : "survivre à l'IA", "compétences face à l'IA", "ne pas se faire remplacer par l'IA" — concurrence faible en français
- Microsoft Clarity : scroll depth pour optimiser la longueur des articles

---

## Contraintes Projet

- **Temps disponible** : 1h30/jour maximum (papa de 2 enfants en bas âge, 100% en poste)
- **Profil** : Chef de projet IT, utilise Claude Code pour le développement
- **Objectif 6 mois** : construire une audience, pas monétiser
- **Principe** : zéro maintenance technique, tout automatisé
