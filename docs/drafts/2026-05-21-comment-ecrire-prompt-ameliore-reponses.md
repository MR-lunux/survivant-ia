---
title: "Comment écrire un prompt qui améliore tes réponses"
description: "Ce n'est pas l'IA qui est nulle, c'est ta manière de lui parler. Six boutons à activer pour que le savant qui sait tout sache enfin marcher."
date: 2026-05-21
category: comprendre-ia
kicker: "LECTURE LONGUE · 9 MIN"
---

Au début, j'ai trouvé les réponses de ChatGPT décevantes. Comme tout le monde. Du texte apparaissait, c'était impressionnant la première fois, mais le résultat sortait « nul ». Puis j'ai entendu la même phrase chez mes collègues, mes amis, sur LinkedIn : « cette IA est surcotée ».

Je me suis posé la question dans l'autre sens. Et si le LLM ne sortait pas du nul, mais que c'était nous qui ne savions pas lui parler ?

## J'ai lu, j'ai testé, j'ai vu un pattern

J'ai lu. Beaucoup. Le guide d'Anthropic pour Claude, celui de Google pour Gemini, des vidéos de chercheurs comme Andrej Karpathy. Chaque source disait la même chose, autrement formulée : le LLM ne comprend pas comme un humain comprend. Il complète des patterns statistiques. Plus le pattern qu'on lui pose est précis, plus la réponse qui suit est précise.

J'ai testé. Le même prompt brut, mal cadré, donne une réponse vague et générique. Le même prompt restructuré avec un rôle clair, une tâche précise, un format défini, donne une réponse plusieurs crans au-dessus. Pas plus intelligente. L'IA n'est pas plus intelligente d'un prompt à l'autre, le modèle ne change pas entre deux requêtes. Plus exacte, parce que je lui dis exactement où viser.

Et j'ai vu un pattern dans tous ces guides. Ils convergent sur les mêmes six boutons à activer quand tu rédiges un prompt. Ce ne sont pas six règles ésotériques, ce sont les six leviers qui transforment une demande vague en une demande exécutable. La grille existe depuis qu'on construit des LLMs grand public. Elle marche pour ChatGPT, pour Claude, pour Gemini, pour Mistral. Elle marche pour les modèles d'aujourd'hui et probablement pour ceux des trois prochaines années.

## Un savant qui sait tout mais qui a du mal à marcher

Une image m'aide depuis : le LLM, c'est un savant qui sait à peu près tout, mais qui a du mal à marcher seul. Si tu lui demandes « parle-moi », il part dans n'importe quelle direction, parce qu'il sait sur n'importe quel sujet. Si tu lui dis « va dans cette pièce, prends le livre rouge sur le bureau, ouvre-le à la page 12, et lis-moi le paragraphe en haut », il y arrive en trois secondes.

Ce n'est pas un défaut d'intelligence. C'est un défaut de cadrage. Le savant qui marche mal n'attend qu'une chose : que tu lui poses le sol.

## Pourquoi le cadrage change tout : ce qu'il se passe vraiment

Pour comprendre pourquoi ces six boutons changent autant la sortie, il faut savoir ce que le modèle fait quand tu envoies une demande. La version courte : il génère le texte de réponse mot après mot, en choisissant à chaque étape le mot suivant le plus probable étant donné tout ce qui a été écrit avant.

« Le plus probable » est l'expression à retenir. Le modèle ne raisonne pas, il prédit. À chaque mot généré, il regarde l'ensemble de ce que tu lui as donné (ton prompt, plus les mots qu'il a déjà écrits dans sa réponse) et il calcule la suite la plus statistiquement plausible.

Conséquence directe : si ton prompt est vague, plein de réponses possibles sont « probables ». Le modèle en choisit une, mais sans favoriser celle qui te servirait, parce qu'il ne sait pas ce qui te servirait. Tu te retrouves avec une réponse moyenne, statistiquement médiane, qui pourrait coller à dix demandes différentes. C'est ça qui sonne « nul ».

Si ton prompt est précis, et surtout si tu poses un rôle, un format, des contraintes, le champ de probabilités se rétrécit. Le modèle n'a plus dix sorties plausibles, il en a deux ou trois, toutes alignées avec ce que tu attends. Il en choisit une, elle est calibrée.

C'est ça qu'il faut comprendre pour ne plus voir l'IA comme une boîte qui donne du « nul ». La boîte n'est pas nulle. Elle est généraliste par construction. C'est à toi de la rendre spécifique à ton cas.

Une nuance : tu ne lui parles pas en code. Tu lui parles en français, en langage naturel, comme à un humain. Les guides Anthropic et Google sont clairs sur ce point. Tu n'as pas à apprendre un langage de programmation pour piloter un LLM. Mais le langage naturel doit être structuré, parce que la structure réduit l'ambiguïté, et l'ambiguïté est l'ennemie du résultat.

## La grille des six boutons

Voici les six boutons que tous les guides sérieux reconnaissent comme la base utile. Trois sont obligatoires, trois sont optionnels mais souvent décisifs.

### 1. Le rôle

Tu dis à l'IA qui elle est avant qu'elle ne te parle. « Tu es un expert RH suisse senior, habitué aux entretiens annuels en PME. » « Tu es un analyste data B2B, focalisé sur les enseignements actionnables. » « Tu es un rédacteur de mails commerciaux à l'aise en correspondance pro. »

Le rôle est l'ancre du pattern. Sans rôle, le LLM répond depuis sa moyenne statistique, qui est une voix grand public neutre. Avec rôle, il bascule dans le vocabulaire, le ton et les références du métier que tu lui as donné. La différence sur la sortie est immédiate.

### 2. La tâche

Tu décris l'action précise, pas l'intention vague. « Rédige une synthèse » n'est pas une tâche, c'est une intention. « Rédige une synthèse en 5 bullets, un par décision prise, avec le responsable identifié pour chaque action » est une tâche.

La règle : si tu peux remplacer ta tâche par cinq autres formulations différentes, elle est trop vague. Resserre jusqu'à ce qu'une seule sortie raisonnable existe.

### 3. Le format de sortie

Tu décris à quoi doit ressembler la réponse : longueur, structure, ton, langue. « Mail court, 120 mots maximum, ton cordial mais ferme, signature Cordialement plus le prénom. » « 5 bullets de 1 phrase chacun. » « Tableau à 3 colonnes : action, responsable, deadline. »

Le format est le bouton le plus sous-estimé. Beaucoup de pros pensent que c'est de la sur-spécification. C'est l'inverse : c'est ce qui transforme une réponse vague en une réponse qu'on peut copier-coller direct dans son mail, son slide, son ticket. Tu gagnes 5 minutes à chaque sortie.

### 4. Le contexte (optionnel)

Tu donnes au modèle la matière première : ce que tu sais, ce qui s'est passé, ce qu'il doit avoir en tête avant de répondre. « Le client est une PME industrielle, contrat signé il y a 6 mois, première relance restée sans réponse. » « Nous avons trois équipes de 4 personnes, dont deux à distance. »

Le contexte est optionnel mais c'est lui qui fait passer de « une réponse qui marche pour n'importe qui » à « une réponse qui marche pour mon cas ». Sans contexte, le modèle invente ou généralise. Avec contexte, il ancre.

### 5. Les contraintes (optionnel)

Tu dis ce que tu ne veux PAS. « N'utilise pas de superlatifs marketing. Ne mentionne pas le prix. Ne propose pas d'appel téléphonique. » « Pas de jargon stat sauf si essentiel. »

Les contraintes négatives sont souvent plus puissantes que les instructions positives. Elles ferment les portes que tu connais. Un pro qui écrit un mail commercial sait quelles tournures sonnent « commerciales » et ne veut pas les voir : les lister, c'est sauver une itération de réécriture.

### 6. Les exemples (optionnel)

Tu montres une ou deux démonstrations de ce que tu attends. « Ton souhaité : Bonjour, je reviens vers vous concernant... ; à éviter : J'espère que vous allez bien ! »

Les exemples sont ce que les chercheurs appellent du *few-shot* prompting. Tu poses littéralement le pattern devant le modèle, qui n'a plus qu'à le compléter. C'est le bouton le plus efficace quand tu as un goût précis mais que tu n'arrives pas à le décrire en règles. Tu montres, le modèle imite.

## Tu peux retenir les six boutons. Ou laisser un outil te les appliquer.

Tu peux retenir les six boutons et les appliquer à la main à chaque prompt. C'est ce que j'ai fait pendant des mois. C'est ce qui marche le mieux à long terme : ton cerveau intègre le pattern et tu deviens autonome. Au bout de trois ou quatre semaines de pratique régulière, tu n'as plus besoin de la grille devant toi, elle est en toi.

Ou, plus rapide, tu peux laisser un outil les appliquer à ta place sur ton prompt brut. J'ai construit [un outil qui fait exactement ça](/outils/ameliorer-son-prompt) : tu colles ton prompt vague, il sort restructuré selon la grille en quelques secondes. Tu copies, tu colles dans ChatGPT, Claude, Gemini, Mistral, peu importe. Tu obtiens une vraie réponse.

L'outil n'est pas un raccourci pour ne pas réfléchir. C'est une béquille le temps que les six boutons deviennent un réflexe. Les deux approches sont complémentaires : tu testes avec l'outil pour voir ce que ça change, tu apprends en regardant ce qu'il restructure, et tu intègres petit à petit.

L'IA n'est pas nulle. Elle n'est pas non plus magique. C'est un savant généraliste qui n'attend qu'une chose pour te servir vraiment : que tu lui poses le sol avec les six boutons. Le faire toi-même, le faire faire par un outil, peu importe : ce qui compte, c'est que tu arrêtes de tester un prompt vague et de conclure que la machine déconne.

## Pour aller plus loin

- Anthropic, *Prompt engineering best practices* : la référence canonique sur la grille role/context/instructions/examples/output, écrite par les équipes qui ont construit Claude. Disponible sur platform.claude.com.
- Google, *Prompt design strategies* : l'équivalent pour Gemini, structuré différemment mais convergent sur les mêmes leviers. Disponible sur ai.google.dev.
- Andrej Karpathy, *Intro to LLMs* (YouTube, 2024) : la vulgarisation la plus claire du mécanisme next-token et de l'attention, par un des chercheurs qui ont construit GPT chez OpenAI.
- Vaswani et al., *Attention is all you need* (2017) : le paper fondateur de l'architecture transformer. Saut technique réservé aux curieux, le reste se comprend sans.
