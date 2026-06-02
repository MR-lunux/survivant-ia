# 03 — Pipeline Karpathy (ingest / query / lint)

Cœur fonctionnel du second cerveau. 3 opérations, 3 skills, point final.

## 3.1 — `ingest-article` (skill SKILL.md)

### Trigger
- Cron : scan `content/rapports/*.md` toutes les 6h, détecte les nouveaux articles `status: published` ET `maintainer: human`
- Manuel : `/ingest <slug>` sur Telegram ou Web UI

### Pipeline interne

```
1. LOAD article + frontmatter
2. REASONING (Qwen3.5-122B) :
   "Identifie au max 5 idées atomiques transportables hors contexte
    (1 concept, 1 claim/prise de position, ou 1 example mémorisable).
    Pour chaque : titre court, frontmatter, body 1-écran max.
    Refuse fermement de dépasser 5. Choisis les plus utiles pour
    produire du contenu dérivé, pas les plus complètes."
3. WRITE wiki/concepts|claims|examples/*.md (≤5 fichiers)
4. UPDATE wiki/_provenance.md (article X → notes Y, Z, W)
5. UPDATE wiki/_moc/<question>.md si la note s'inscrit dans une MOC existante
   ou propose à Mathieu via Telegram "nouvelle MOC suggérée : <question> ?"
6. COMMIT + push (branch hermes/auto, jamais main directement)
7. PING Telegram récap : "Article X ingéré → 4 notes : [...].
   Wiki maintenant à N notes. Coût : 0.0X CHF."
```

### Hard rules dans le prompt
- Une note = **une seule idée** (Meunier atomicité)
- Titre = phrase complète qui exprime l'idée (ex : `"L'IA n'évacue pas l'expertise, elle l'externalise"`)
- Section "Source brute" obligatoire avec **citation verbatim** depuis l'article (anti-hallucination)
- Si pas de citation verbatim possible → ne pas écrire la note
- Wikilinks vers concepts/claims/examples EXISTANTS uniquement (pas d'invention de référence)

### Coût estimé
~0.02 CHF par article ingéré (input ~10K tokens, output ~3K).

## 3.2 — `query-wiki` (skill SKILL.md)

Appelé par les sous-routines de génération (LinkedIn / carousel / TikTok) **avant** d'écrire.

### Pipeline interne

```
1. INPUT : "intention de contenu" — texte court de l'angle voulu
   (ex : "le BPMN générateur que j'ai lancé hier, angle : les comptables
   qui croient être irremplaçables")

2. EMBEDDING de l'intention (Qwen3-Embedding-8B), comparaison avec :
   - Tous frontmatters/titres du wiki (concepts, claims, examples)
   - Toutes les MOC
   - Les frontmatters des articles piliers (pas le body, trop gros)

3. RANK top 8 plus pertinents, DEDUP, regroupement par type

4. RÉCUPÈRE contenu complet de ces 8 fichiers

5. RÉCUPÈRE aussi 3 derniers posts LinkedIn publiés sur thèmes proches
   (pour DÉTECTER REDITES — anti-radotage)

6. RETURN structured context bundle :
   {
     atomic_notes: [...],
     moc_relevant: [...],
     recent_published_close_topic: [...],
     redite_risk: 0.32   // proximité à un post récent
   }
```

### Hard rules
- Si `redite_risk > 0.7` → Hermes alerte ("attention, post très proche le YYYY-MM-DD — angle alternatif ?") AVANT de générer
- Bundle plafonné à 6K tokens — au-delà, coupe les notes les moins pertinentes (pas de balance-tout-le-wiki)

### Coût estimé
~0.005 CHF par query (embedding cheap + lecture ciblée).

## 3.3 — `lint-wiki` (skill cron hebdo)

**Trigger** : vendredi 17h Geneva (ritual "fin de semaine, je referme le second cerveau").

### Pipeline interne

```
PART A — Maintenance technique
1. SCAN wiki/ : détecte fichiers orphelins (0 wikilink entrant ET sortant)
2. DÉTECTE notes redondantes (similarité embeddings > 0.92 entre 2 notes)
3. DÉTECTE notes "vides" (body < 200 chars)
4. DÉTECTE liens cassés (wikilink vers note inexistante)
5. DÉTECTE drift MOC (une MOC > 15 notes → suggère split)

PART B — Hallucination audit (CRITIQUE — cross-model)
6. PICK 3 atomic notes au hasard (uniform sampling)
7. POUR CHACUNE :
   - Charge la note + sa Source Brute citée
   - Charge l'article pilier de provenance
   - Demande à Mistral-Small-4 (PAS Qwen qui a ingéré) :
     "Cette note prétend dire X. La citation source dit Y. L'article
      complet contient-il la matière pour soutenir le claim X ?
      Réponds STRICTEMENT par PASS / FAIL / DOUBT + 1 phrase justif."
   - Si FAIL ou DOUBT → quarantine la note (frontmatter `quarantined: true`,
     exclue du query-wiki) et ping Mathieu

PART C — Exit criteria check
8. CALCULE :
   - maintenance_time_estimate (basé sur volume changes)
   - contamination_rate (fail/total cette semaine)
   - monthly_cost_so_far
9. SI un seuil dépassé → ping Mathieu Telegram alerte rouge
   "Exit criteria triggered: <metric> = <value>.
    Reco fallback vers RAG simple."

PART D — Rapport hebdo
10. PING Telegram récap :
    "Wiki health: 47 notes, 3 quarantined, 2 redondances mergées,
     0 lien cassé. Hallucination audit: 2 PASS, 1 DOUBT (cf. note X).
     Budget mensuel: 4.2 / 30 CHF. Exit criteria: ✓ tous OK."
```

### Pourquoi cross-model audit
Recherche Proudfrog LLM Wiki criticism : un LLM est mauvais juge de ses propres erreurs. **Cross-model = défense plus fiable.** Mistral-Small-4 (dense 119B) est aussi le top "qualité brute" du catalogue Infomaniak.

### Coût estimé
~0.05-0.10 CHF par run hebdo (3 audits + scan).

## 3.4 — `SKILL.md` racine (schema Karpathy)

Fichier chargé en premier à chaque interaction Hermes. ~150 lignes max.

### Structure cible

```markdown
# Survivant-IA Second Brain — Schema

## Qui je suis (Hermes)
Je suis l'agent qui aide Mathieu (alias "le Survivant de l'IA")
à entretenir Survivant-IA. Je sers la voix éditoriale, pas l'inverse.

## Qui est Mathieu
[résumé voix V2 Editorial Dark + persona + memories pertinentes]

## Architecture
- /content/rapports/ : raw sources IMMUABLES. Je ne touche jamais.
- /content/outils/   : raw sources IMMUABLES (outils publiés).
- /wiki/             : artefact dérivé. ÉPHÉMÈRE. Si doute → re-ingest.
- /docs/.../drafts/  : mes brouillons. Mathieu valide. Jamais publication auto.
- /docs/charte-voix.md : prompt système maître pour toute production.

## Les 3 opérations
- ingest : nouvel article → ≤5 atomic notes
- query  : avant draft, je consulte wiki + recent published
- lint   : vendredi 17h, je nettoie + audit hallucinations

## Hard rules (ordre = priorité)
1. Je ne publie JAMAIS sur LinkedIn/TikTok/newsletter. Je draft, Mathieu publie.
2. Je ne touche JAMAIS un fichier `maintainer: human`.
3. Je n'invente JAMAIS un chiffre, date, lieu, ou détail bio sur Mathieu.
4. Citation verbatim obligatoire dans toute atomic note.
5. Voice-check (humanizer) obligatoire avant livraison de draft.
6. Si redite_risk > 0.7 sur un sujet, j'alerte avant de générer.
7. Si exit criteria atteint, j'alerte et je m'arrête.

## Exit criteria (je m'arrête et j'alerte si)
- maintenance estimée > 1h/semaine
- contamination_rate > 2 false claims / semaine (audit lint)
- monthly_cost > 50 CHF

## Voice
Référence : .hermes/prompts/voice-survivant-ia.md (qui inclut charte-voix.md)
- Tu, jamais vous
- Négation française complète ("je ne suis pas", jamais "je suis pas")
- Casse minuscule sur concepts coined ("simple valideur")
- Em-dash interdit, pas d'emoji
- Cluster 2 ACTION prioritaire (jamais cluster peur)
- Mot banni : "méthode" (sauf si Mathieu lance le produit formation)

## Hard non-goals
- Pas de newsletter draft (Mathieu n'a envoyé aucun numéro, scope MVP)
- Pas d'auto-publish (-50-70% reach LinkedIn 2026 algo)
- Pas d'API X / Twitter
```
