# 05 — Pull flow (signaux → brief matinal 6h30)

L'inverse du Push. Hermes scrute, filtre, propose. Mathieu valide ou ignore. Piège majeur (recherche "second brain graveyard") : produire des briefs ignorés → désintérêt → mort. Donc anti-bloat from day 1.

## 5.1 — Sources activées au MVP (9 sources)

### Couche A — Presse tech anglo + raw feeds (RSS gratuits)

| # | Source | Pourquoi pour Survivant-IA |
|---|---|---|
| 1 | **MIT Technology Review** (AI feed) | Profondeur + policy. Aligné "comprendre l'IA sans en avoir peur". |
| 2 | **The Verge** (AI section) | Mainstream + accessible. Proxy de ce que le public croit sur l'IA cette semaine. |
| 3 | **Ars Technica** (AI tag) | Tech-deep mais lisible. Signal-rich pour démystifier. |
| 4 | **TechCrunch** (AI category) | Lancements + funding. "Qui a sorti quel outil cette semaine" → matière pour annoncer le tien. |
| 5 | **Financial Times Tech** (AI) | Business + travail. Bullseye pour audience pro. |
| 6 | **The Guardian Tech** (UK) | Couvre systématiquement "AI + jobs / labor". Excellent cluster professionnel. |
| 7 | **404 Media** | Investigative AI labor. "Ce qu'on cache sur l'IA au boulot". |
| 8 | **Hacker News** (front + AI tag) | Aggregator communautaire. Vote = signal saillance. |
| 9 | **ArXiv cs.AI / cs.CL** | Recherche brute. Filtrée sur titres pertinents par Hermes. |

**Sources skippées volontairement** :
- ~~X / Twitter~~ : API trop limitée, scraping fragile, Mathieu n'a pas d'avis sur les comptes
- ~~Substacks~~ : Mathieu ne lit pas Substack
- ~~LinkedIn~~ : pas d'API, browser-use fragile

### Couche C — Signaux internes (gratuits, à haute valeur)
- **PostHog** (project 169545) : anomalies détectées (spike d'utilisateurs sur un outil, drop d'engagement, nouvelles queries de recherche internes)
- **Git activity** : commit dans `content/outils/` = nouvel outil shippé → pré-charge brief avec proposition d'annonce
- **Brevo subscribers** : accélération/décel inscriptions newsletter (1 datapoint/jour)

### Couche D — Mentions de la marque
- **Google Alerts** (gratuit, feed RSS) sur "Survivant-IA", "survivant-ia.ch", "Mathieu Rerat IA"
- **Google News RSS** (gratuit) sur 10 keywords FR (remplace X pour le périmètre francophone)

### 10 keywords FR (cluster 2 ACTION prioritaire)

```
Cluster 2 ACTION (à amplifier) :
- "se former à l'IA"
- "prendre le virage IA"
- "compétences IA professionnel"
- "IA augmente travail"
- "piloter l'IA"
- "souveraineté IA suisse"

Surveillance cluster peur (pour décrypter, pas s'aligner) :
- "remplacement par IA"
- "métier menacé IA"
- "se faire remplacer IA"

Niche tactique (rotation par mois) :
- "comptable IA" / "RH IA" / "juriste IA"
```

Application via Google News RSS : `https://news.google.com/rss/search?q=<query>&hl=fr`.

## 5.2 — Pipeline de filtrage

```
1. COLLECT (cron 6h00 Geneva) — toutes sources A/C/D en parallèle,
   dédup par URL, normalisées en {title, source, url, body, ts}
   Budget : ~80-100 items bruts/jour

2. CLASSIFY (Nemotron-Nano-3B, ~0.005 CHF/jour)
   Pour chaque item :
   - Est-ce dans périmètre Survivant-IA ? (cluster 2 action prioritaire)
   - Score pertinence 0-10
   Coupe : top 30

3. EMBED + RAG MATCH (Qwen3-Embedding, cached)
   Pour chaque item :
   - Embedding du titre + 200 premiers mots
   - Match vs wiki existant → score "fit voix"
   - Match vs 10 derniers posts publiés → score "redite_risk"
   Coupe : top 10 avec fit ≥ 0.6 ET redite_risk ≤ 0.6

4. RANK final (multi-critère)
   Score = 0.4 × fit_voix + 0.3 × pertinence + 0.2 × freshness + 0.1 × engagement_signal
   Coupe : top 3

5. GENERATE brief (Mistral-Small-4, ~0.01 CHF)
   Pour chaque sujet top 3 :
   - 1 phrase de quoi ça parle
   - Source + lien
   - Angle Survivant-IA suggéré (1 phrase, voix correcte, pré-mâchée)
   - Tag pilier potentiel : [outil-concret] | [soft-skill] | [décryptage]
   - Estimation coût/temps si tu pushes le draft

6. DELIVER (6h30 Geneva, Telegram)
```

## 5.3 — Format du brief matinal

```
📡 FRÉQUENCE — Brief du lundi 2 juin

3 signaux qui valent un coup d'œil :

[1] 🛠️ Anthropic ship "Managed Agents" (Dec 5 2025 GA)
    Source : Anthropic blog · Fit voix 0.82 · Redite 0.15
    Angle : "Anthropic copie Hermes — preuve que l'agent
    auto-hébergé devient un standard, même pour les non-tech."
    Tag : [outil-concret]
    [👍 drafter L+T] · [📁 garder] · [🗑️ ignorer]

[2] 📊 PostHog (interne) : spike +340% utilisateurs sur /outils/bpmn
    Source : PostHog Survivant-IA · Fit voix 0.91 · Redite 0.62
    Angle : "Le BPMN générateur cartonne. Mais 67% lâchent à
    l'étape 3. Pourquoi ?"
    Tag : [décryptage]
    [👍 drafter L+T] · [📁 garder] · [🗑️ ignorer]

[3] 🧠 ArXiv : "Cognitive Offloading and Critical Thinking..."
    Source : arxiv.org · Fit voix 0.74 · Redite 0.18
    Angle : "L'IA t'évacue, ne te remplace pas. Maintenant
    confirmé par une étude empirique."
    Tag : [soft-skill]
    [👍 drafter L+T] · [📁 garder] · [🗑️ ignorer]

Coût brief ce matin : 0.018 CHF
[😴 Skip today, brief frais demain]
```

## 5.4 — Garde-fous anti-burnout / anti-graveyard

| Garde-fou | Mécanisme | Trigger |
|---|---|---|
| **Cap dur** | Max 3 sujets/jour, jamais 5, jamais 10 | Hard rule SKILL.md |
| **Dimanche silence** | Pas de brief le dimanche (anti-always-on) | Cron skip Sunday |
| **Skip-day bouton** | Tu cliques 😴, demain reçoit signaux frais (pas accumulés) | Telegram callback |
| **Ignore rate watch** | Lint hebdo calcule `ignored / total` sur 14j | Si > 75% → Hermes propose tune sources OU pause Pull 2 sem. |
| **Source quality decay** | Score actualisé par source : si 0 sujet retenu en 30j → suggestion retrait | Lint hebdo |
| **Pas d'auto-draft** | Même 👍 ne publie pas — déclenche `draft-from-idea` (validation Push conservée) | Architecture |
| **Vendredi 18h** | Mini-recap "ce que tu as ignoré, ce qui a marché" (30 sec) | Cron hebdo |

## 5.5 — Budget Pull

- Daily : ~0.015 CHF (collect+classify+brief)
- Monthly : **~0.45 CHF/mois**
- + coût drafts si 👍 pushé (budgété dans Push)

**Total pipeline contenu (Push + Pull + lint)** : **6-20 CHF/mois** selon volume push (5-30 idées/mois). Confortablement sous seuil 50 CHF.

## 5.6 — Schedule

- **Cron 6h00** Geneva : collect signaux
- **Cron 6h30** Geneva : deliver brief Telegram
- **Cron dimanche** : skip (pas de brief)
- **Cron vendredi 17h** : `lint-wiki` (cf. 03)
- **Cron vendredi 18h** : mini-recap Pull (ignore_rate, sources qui ont brillé)
- **Cron 21h chaque jour** : `daily-budget-check`
