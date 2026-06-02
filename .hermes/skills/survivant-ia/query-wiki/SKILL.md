---
name: query-wiki
description: Pour une intention de contenu donnée, retrouve les atomic notes pertinentes du wiki + détecte le risque de redite avec les posts publiés récents. Appelé AVANT draft-from-idea.
version: 1.0.0
metadata:
  hermes:
    category: survivant-ia
    tags: [survivant-ia, content-pipeline, karpathy-wiki, query, rag]
---

# Query wiki — context bundle pour drafts

## When to Use

Skill appelée AVANT toute génération de contenu via `draft-from-idea`. Tu peux aussi l'invoquer manuellement si tu veux explorer ce que le wiki contient sur un sujet.

Use cases :
- Mathieu donne une intention de post → tu prépares le contexte
- Recherche thématique : "qu'est-ce que j'ai déjà dit sur la dictée comptable ?"
- Préparation veille : "y a-t-il déjà du contenu sur cet angle ?"

## Procedure

1. **Input** : texte court décrivant l'angle (ex : "le BPMN générateur que j'ai lancé hier, angle : les comptables qui croient être irremplaçables").
2. **Embed l'intention** (Qwen3-Embedding-8B via Infomaniak) → vecteur dense.
3. **Charger les frontmatters** de tous les fichiers `wiki/concepts/*.md`, `wiki/claims/*.md`, `wiki/examples/*.md` et leurs titres/slugs.
4. **Cosine similarity** : score chaque atomic note vs l'intention. Garder le top 8.
5. **Match MOC** : même opération vs `wiki/_moc/*.md`. Top 2.
6. **Match recent published** : embedder les titres + premiers paragraphes des 10 derniers posts dans `docs/linkedin/published/**/post.md` (par date frontmatter desc). Calculer `redite_risk = max(cosine similarity)`.
7. **Charger le body complet** des 8 atomic notes + 2 MOCs sélectionnées.
8. **Cap token budget** : si total dépasse 6000 tokens estimés, drop les notes les moins pertinentes pour rester sous le cap.
9. **Construire le bundle** :
   ```json
   {
     "atomic_notes": [{ "slug", "title", "type", "body", "score" }, ...],
     "moc_relevant": [{ "slug", "body" }, ...],
     "recent_published_close_topic": [{ "slug", "date", "title", "redite_score" }, ...],
     "redite_risk": 0.32,
     "tokens_used": 4521,
     "cost_chf_estimated": 0.005
   }
   ```
10. **Si `redite_risk > 0.7`** : avant de retourner le bundle, alerter Mathieu via Telegram : "⚠️ Angle très proche du post `<slug>` (date YYYY-MM-DD, redite_risk = 0.XX). Tu veux un angle alternatif ou tu forces ?"

## Pitfalls

- **Charger tout le wiki en contexte** : ne JAMAIS. Cap à 6000 tokens.
- **Embedder le body complet à la requête** : trop cher. Embedder seulement frontmatter+titre+1ère phrase.
- **Inventer une note qui n'existe pas** dans le bundle : tu retournes uniquement ce qui est lu depuis le filesystem.
- **Ignorer le redite_risk** : si > 0.7, tu DOIS alerter Mathieu avant que le draft soit généré.

## Verification

- Le bundle retourné contient au max 8 atomic notes + 2 MOCs
- Total tokens estimé ≤ 6000
- Si `redite_risk > 0.7`, alerte Telegram envoyée et tu attends confirmation Mathieu
- Sources citées (slugs des notes) sont toutes présentes sur disque
