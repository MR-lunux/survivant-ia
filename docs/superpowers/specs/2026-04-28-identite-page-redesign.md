# Spec — Refonte de la page `/identite`

**Date :** 2026-04-28
**Objectif :** Transformer la page identité d'une présentation générique en une narrative de transformation qui crée la confiance et convertit vers la newsletter.

---

## Contexte stratégique

Le site survivant-ia.ch part de zéro abonné. La stratégie retenue (Option 1 — Fondation humaine) consiste à construire la confiance envers la personne avant de vendre le contenu. Le visiteur type est un professionnel 28–50 ans, non-tech, qui se demande "pourquoi j'écouterais cet homme ?". Cette page doit répondre à cette question en moins de 90 secondes.

## Parcours professionnel à afficher

| Employeur | Rôle |
|-----------|------|
| PwC | Audit IT (stage) |
| Nestlé | Business Analyst |
| Imopac | Consultant → Dev Xyrion → Head of Office Romandie |
| Solutions & Funds | Chef de projet IT / Deputy Head of IT |

## Structure de la page

### 1. Carte identité *(modifier)*

- Titre actuel : `CHEF DE PROJET IT — SURVIVANT EN COURS`
- Titre proposé : `DEPUTY HEAD OF IT — SURVIVANT EN COURS`

### 2. Bloc narratif *(réécriture complète)*

Structure en 4 temps :

**Le terrain**
> "Mon parcours n'a rien d'un parcours tech pur : économie, master en systèmes d'information, puis PwC en audit IT, Nestlé comme Business Analyst, Imopac où je suis passé de consultant à Head of Office Romandie, et aujourd'hui Deputy Head of IT chez Solutions & Funds. Des environnements différents, un fil rouge : être l'interface entre les gens, les process, et les outils."

**La plongée**
> "Quand l'IA s'est invitée dans mon quotidien, j'ai plongé. Claude, ChatGPT, automatisations, code... Je lis les articles, j'écoute les podcasts, je teste. Pendant un moment, j'ai cru que plus j'en utilisais, mieux je travaillais."

**La chute** *(volontairement maintenu — crédibilité par le vécu)*
> "Jusqu'au jour où j'ai réalisé que je n'avais plus la notion de l'effort. Je produisais vite, beaucoup — mais je ne construisais plus rien. L'IA faisait, je validais. Ce signal ne m'a pas rendu anti-IA. Il m'a rendu lucide."

**La mission**
> "Ce site existe pour les professionnels qui voient l'IA arriver sans savoir comment se positionner. Pas pour en faire des experts. Pour leur donner les cartes que j'aurais aimé avoir."

### 3. Bloc mission *(garder tel quel)*

> "Aider les gens à se préparer *avant* que l'IA ne prenne leur job — pas à pleurer *après*."

### 4. Bloc parcours *(nouveau)*

4 badges visuels dans le style existant (ScannerBorder, Space Mono, couleur accent), disposés en grille responsive :

- **PwC** — Audit IT / Stage
- **Nestlé** — Business Analyst
- **Imopac** — Consultant → Head of Office Romandie
- **Solutions & Funds** — Deputy Head of IT

### 5. CTA bas de page *(nouveau)*

Texte : *"Tu traverses la même zone ? Rejoins les premiers dans la Fréquence."*
Bouton : lien vers `/#newsletter`

---

## Décisions de design

- Conserver l'avatar "M" dans la carte identité (cohérent avec l'esthétique anonyme/signal)
- Badges parcours : fond `var(--color-surface)`, bordure accent subtile, pas d'icône logo d'entreprise (risque légal + poids visuel)
- Le CTA reprend le vocabulaire "Fréquence" pour rester dans l'univers narratif du site
- Garder `max-width: 780px` pour la lisibilité longue-forme

## Ce qui ne change pas

- Titre H1 "Qui suis-je ?"
- Label `// IDENTITÉ DU SURVIVANT`
- La phrase "Je ne suis pas l'expert IA ultime. Je suis quelqu'un qui traverse la même zone que vous" — à intégrer dans la réécriture
- Composant ScannerBorder

---

## Hors scope

- Logo / mascotte (chantier visuel séparé)
- Page à propos enrichie avec photo (décision personnelle non tranchée)
- Témoignages / preuve sociale par les chiffres (pas d'abonnés à ce stade)
