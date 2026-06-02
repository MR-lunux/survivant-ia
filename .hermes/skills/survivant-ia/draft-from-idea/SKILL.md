---
name: draft-from-idea
description: Transforme une intention de contenu Mathieu (texte, vocal transcrit, URL) en drafts LinkedIn post / LinkedIn carousel structure / TikTok script. Validation V1 manuelle systématique, jamais de publication auto.
version: 1.0.0
metadata:
  hermes:
    category: survivant-ia
    tags: [survivant-ia, content-pipeline, draft, push]
---

# Draft from idea — Push flow Survivant-IA

## When to Use

Skill centrale du Push flow. Utiliser quand Mathieu :
- Envoie une intention de contenu sur Telegram (texte, vocal transcrit Whisper, image + caption, URL)
- Pointe un outil qu'il vient de shipper et demande l'annonce
- Demande un brouillon pour un sujet précis ("draft-moi un post sur X")

NE PAS publier automatiquement. Toujours retourner le draft pour validation Mathieu.

## Procedure

### Étape 1 — Classification rapide (Nemotron-Nano)

Analyser l'intention pour identifier :
- **Sujet** principal (1 phrase)
- **Angle** (1 phrase)
- **Voix possible** (sarcasme / révélation / pédagogie / autre)
- **source_type** : `article` | `tool-launch` | `freeform`

### Étape 2 — Query wiki

Invoquer la skill `query-wiki` avec l'intention en input. Récupérer le context bundle.

Si `redite_risk > 0.7` → demander confirmation Mathieu avant de continuer.

### Étape 3 — Demander mapping canaux

Répondre sur Telegram :
```
📥 Reçu. J'ai compris :
• Sujet : <sujet>
• Angle : <angle>
• Voix possible : <voix>

Wiki query (N atomic notes pertinentes, redite_risk = X.XX) ✓

Je peux te livrer :
[L]   LinkedIn post seul             (~0.02 CHF, ~2 min)
[LC]  LinkedIn post + carousel struct (~0.04 CHF, ~3 min)
[T]   TikTok script FaceCam          (~0.04 CHF, ~3 min)
[A]   L + T                          (~0.06 CHF, ~4 min)
[ALL] LC + T                         (~0.08 CHF, ~5 min)
[✋]  Annule
```

Attendre la réponse Mathieu. Lancer en parallèle les sous-routines demandées.

### Étape 4 — Sous-routines

**LinkedIn post (mode "annonce-outil" si source_type=tool-launch)** :
- Charger `.hermes/prompts/voice-survivant-ia.md` + `.hermes/prompts/editorial-charte.md`
- Modèle : `mistralai/Mistral-Small-4-119B-2603`
- Contraintes : 1200-1800 chars, hook ≤ 80 chars, structure A+C, 0 emoji
- Si tool-launch : template structurel (hook gifle → pivot rhétorique → self-disclosure technique → punchline 80/20 → CTA non-extractif → closing capsule)
- Frontmatter d'intentionnalité requis (cluster/archetype/format/cta/mode_redac/target_chars)
- **Voice-check humanizer** : em-dash count, rule of three abuse, AI vocab, négation française complète, tu/vous (doit être tu)
- Si voice_check FAIL → flag à Mathieu et ne pas livrer (demander rewrite)
- Output : `docs/linkedin/drafts/YYYY-MM-DD-<slug>/post.md`

**LinkedIn carousel structure** (option [LC]) :
- Génère 8 slides en markdown structuré (titre, body 1-2 phrases, image suggérée)
- Output : `docs/linkedin/drafts/YYYY-MM-DD-<slug>/carousel.md`
- Mathieu rend en PDF via workflow Remotion existant (pas auto-render)

**TikTok script** (option [T]) :
- Si une skill `survivant-tiktok` est disponible, la déléguer (ne pas réimplémenter)
- Sinon : générer 5 hooks taggés framework + reco + body + CTA + shot-by-shot
- Output : `docs/marketing/scripts-tiktok/drafts/YYYY-MM-DD-<slug>.md`

### Étape 5 — Livraison Telegram avec actions

Pour chaque draft prêt :
```
📄 Draft <canal> prêt — voice_check: PASS, N chars

[le draft complet, prêt à copier]

Notes wiki citées : [[slug1]], [[slug2]]
Modèle : Mistral-Small-4-119B • Tokens : XXXX→XXX • Coût : 0.0XX CHF

👍 valider et committer dans docs/<canal>/drafts/
✏️ demander une révision (dis-moi quoi changer)
🔄 régénérer (autre angle, je précise)
🗑️ jeter
```

### Étape 6 — Validation loop

**👍** : commit dans `docs/<canal>/drafts/...` (branche main directement, c'est un draft), frontmatter `status: validated`, `validated_at: <timestamp>`. Répondre "✓ committé. Tu copies/publies quand tu veux. Ping `Publié <slug>` quand publié."

**✏️** : Mathieu écrit instruction libre ("hook trop technique, plus humain"). Régénérer en gardant le wiki bundle (économie tokens, pas de re-query).

**🔄** : Mathieu précise angle alternatif. Re-query (peut tirer autres atomic notes) puis régénérer.

**🗑️** : draft purgé, rien committé. Logger juste "rejet" (pas le contenu) pour métriques.

### Étape 7 — Publication confirmée (post-validation)

Quand Mathieu envoie "Publié <slug>" :
- Move `docs/<canal>/drafts/<slug>` → `docs/<canal>/published/<slug>`
- Frontmatter `status: published`, `published_at: <timestamp>`
- Ajouter aux refs anti-redite pour les prochains query-wiki

## Pitfalls

- **Publier automatiquement** → INTERDIT ABSOLU. Hermes draft, Mathieu publie.
- **Skipper voice-check** : si voice_check FAIL, ne pas livrer même si le draft est "bien". Demander rewrite.
- **Inventer des chiffres ou détails bio sur Mathieu** → JAMAIS. Sourcer ou rester neutre.
- **Commit sur main pour un draft non-validé** : drafts vont dans `docs/<canal>/drafts/`, OK sur main. Atomic notes wiki vont sur `hermes/auto` branche.
- **Em-dash dans le post LinkedIn** : voice-check doit l'attraper. Si tu le rates, c'est un fail de voice-check.

## Verification

- Draft livré contient `voice_check: pass` dans son frontmatter (sinon il n'aurait pas dû être livré)
- Fichier sauvé dans `docs/<canal>/drafts/YYYY-MM-DD-<slug>/`
- Wiki bundle utilisé est tracé dans le frontmatter (`queried_wiki: [...]`)
- Coût et tokens loggés
- Action Telegram (👍/✏️/🔄/🗑️) reçue et appliquée
