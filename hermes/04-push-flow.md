# 04 — Push flow (Telegram + Web UI → drafts)

Le côté user-facing. Skill unique `draft-from-idea` qui route vers sous-routines LinkedIn / LinkedIn+carousel / TikTok.

## 4.1 — Points d'entrée

### Telegram (canal mobile, ~80% des usages)
- Bot `@SurvivantIAHermes_bot` (à créer via `@BotFather`)
- Whitelist `TELEGRAM_OWNER_USER_ID` = Mathieu uniquement
- Accepte : texte, vocal (transcrit Whisper Infomaniak), image+caption, URL

### Web UI Hermes (`hermes.survivant-ia.ch`, ~20%)
- Reverse-proxy Traefik → container Hermes
- Auth Basic + IP allowlist (IP fixe / VPN)
- Mêmes interactions que Telegram + diff/édition visuelle des drafts avant validation

## 4.2 — Flow conversationnel

```
[Mathieu] (vocal, 25 sec) "j'ai lancé le BPMN générateur hier,
   l'angle qui m'intéresse c'est les comptables qui pensent être
   irremplaçables parce qu'ils 'valident' le bilan, alors qu'en
   fait l'IA fait 95% du taf et eux ils sont juste tampon"

[Hermes] (3 sec — Nemotron-Nano, classification rapide)
   📥 Reçu. J'ai compris :
   • Sujet : générateur BPMN + comptables-tampon
   • Angle : la "validation" comme illusion d'indispensabilité
   • Voix possible : sarcasme bienveillant + révélation

   Wiki query (4 atomic notes pertinentes, 0 redite détectée) ✓

   Je peux te livrer :
   [L]   LinkedIn post seul             (0.02 CHF, 2 min)
   [LC]  LinkedIn post + carousel struct (0.04 CHF, 3 min)
   [T]   TikTok script FaceCam          (0.04 CHF, 3 min)
   [A]   L + T                          (0.06 CHF, 4 min)
   [ALL] LC + T                         (0.08 CHF, 5 min)
   [✋]  Annule

[Mathieu] L T   (= LinkedIn + TikTok, pas carousel)

[Hermes] OK, je lance en parallèle. Ping dès qu'un draft est prêt.
```

## 4.3 — Sous-routines de `draft-from-idea`

Chacune appelle `query-wiki` AVANT d'écrire, et `humanizer` AVANT de livrer.

### LinkedIn sub-routine
- Input : intention + wiki bundle + 3 derniers posts publiés (anti-redite)
- Prompt système : `prompts/voice-survivant-ia.md` (inclut `docs/charte-voix.md` + patterns observés)
- Modèle : `mistralai/Mistral-Small-4-119B-2603`
- Contraintes : 1200-1800 chars, 1 hook ≤ 80 chars, structure A+C dominante, 0 emoji
- Voice-check humanizer : em-dash count, rule of three, AI vocab, négation française complète, tu/vous
- **Mode "annonce-outil"** appliqué auto si `source_type: tool-launch` :
  - Hook fait gifle (douleur du métier)
  - Question rhétorique pivot vers tactique
  - Self-disclosure technique courte ("En 4h, j'ai codé… Infomaniak Suisse… RGPD par défaut")
  - Punchline 80/20 ou ratio chiffré
  - CTA non-extractif ("pas d'email, pas de carte, c'est moi qui paye")
  - Closing capsule ou positionnement Survivant-IA
- Output : 1 post unique sur Telegram + sauvé dans `docs/linkedin/drafts/YYYY-MM-DD-slug/post.md`

### LinkedIn carousel sub-routine (option `[LC]`)
- Génère la **structure de 8 slides** en markdown dans `docs/linkedin/drafts/YYYY-MM-DD-slug/carousel.md`
- Mathieu passe ensuite au workflow Remotion existant (`video/src/carousel/`) pour le rendu PDF
- **Pas d'auto-render PDF** (trop fragile, le workflow Mathieu marche)

### TikTok sub-routine
- Délègue à la skill existante `survivant-tiktok` (Hermes l'invoque comme tool, ne réimplémente pas)
- Output : 5 hooks taggés framework + reco + body + CTA + shot-by-shot
- Sauvé dans `docs/marketing/scripts-tiktok/drafts/YYYY-MM-DD-slug.md`

### Newsletter sub-routine
- **DÉSACTIVÉE au MVP** (0 numéro envoyé). Réactivable d'une ligne dans `hermes-models.yaml` quand Mathieu décide d'envoyer le #1.

## 4.4 — Validation loop (V1 manuelle systématique)

### 👍 valider
1. Hermes commit le fichier dans `docs/<channel>/drafts/...` (branch main directement — c'est un draft, pas du code)
2. Frontmatter `status: validated`, `validated_at: <timestamp>`
3. Hermes : "✓ committé. Tu copies/publies quand tu veux. Ping `/published <slug>` une fois publié."
4. `/published <slug>` → Hermes déplace `drafts/` → `published/`, met `status: published`, ajoute aux refs anti-redite

### ✏️ demander révision
- Tu écris instruction libre ("hook trop agressif, plus de bienveillance")
- Hermes régénère en gardant le wiki bundle déjà chargé (économise tokens, pas de re-query)
- Itération illimitée mais loggée

### 🔄 régénérer
- Tu précises angle alternatif. Hermes re-query (peut tirer autres atomic notes) et regénère

### 🗑️ jeter
- Rien committé, draft purgé. Hermes log juste "rejet" (pas le contenu) — utile pour mesurer "draft-quality" dans le temps

## 4.5 — Anti-bloat (révision #1 respectée)

Frontmatter de chaque sous-routine a un champ `usage_stats` MAJ par lint hebdo :

```yaml
usage_stats:
  invocations_30d: 7
  validations_30d: 5
  rejections_30d: 2
  validation_rate: 0.71
```

**Règle SKILL.md racine** :
> Si une sous-routine draft a `invocations_30d < 3` pendant 2 mois consécutifs, je propose à Mathieu de la retirer.

Discipline anti-graveyard : un skill qui ne sert pas se retire sans drama.

## 4.6 — Sécurité Telegram (non-négociable)

- Whitelist `user_id` Mathieu uniquement
- Tout autre user_id → "Hermes Survivant-IA n'accepte pas de message externe. Va sur https://survivant-ia.ch" + message loggé
- Rate limit : max 20 invocations / heure, max 50 / jour (anti-runaway budget)
- Secrets en env Coolify (jamais loggés, jamais en repo)
