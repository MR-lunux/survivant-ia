---
id: TRC-01
kind: quiz
title: Test de Résilience Cognitive
subtitle: 5 questions pour mesurer ta dépendance à l'IA
description: Test rapide pour évaluer si l'IA est devenue ta béquille cognitive — score immédiat, sans inscription.
kicker: KIT · TRC-01
parentArticleSlug: offloading-cognitif-quand-l-ia-pense-a-ta-place
specs:
  - "5 QUESTIONS"
  - "~2 MIN"
  - "TEST INTERACTIF"
  - "RÉSULTAT IMMÉDIAT"
calloutPitch: "Le test qui prolonge l'article : où en es-tu, vraiment, sur l'offloading cognitif ? Score immédiat, sans inscription, résultat privé."
data:
  questions:
    - id: 1
      label: "RÉFLEXE INITIAL"
      prompt: "Face à un problème complexe ou un nouveau projet, quel est ton premier réflexe ?"
      choices:
        - { key: "A", text: "J'esquisse la structure mentalement ou sur papier.", points: 0 }
        - { key: "B", text: "J'ouvre l'IA pour qu'elle me donne un plan.", points: 1 }
    - id: 2
      label: "PROCESSUS DE VALIDATION"
      prompt: "L'IA te génère un rapport de 3 pages. Comment le valides-tu ?"
      choices:
        - { key: "A", text: "Je le lis ligne par ligne avec un esprit critique.", points: 0 }
        - { key: "B", text: "Je le scanne en diagonale, ça a l'air pro, je valide.", points: 1 }
    - id: 3
      label: "RÉSILIENCE TECHNIQUE"
      prompt: "Demain, panne mondiale. Plus aucune IA n'est accessible. Ton état ?"
      choices:
        - { key: "A", text: "Je suis ralenti, mais je connais mon métier.", points: 0 }
        - { key: "B", text: "Je suis incapable de fournir mes livrables.", points: 1 }
    - id: 4
      label: "RÉSOLUTION D'ERREUR"
      prompt: "Une formule ou un bout de code généré par l'IA plante. Que fais-tu ?"
      choices:
        - { key: "A", text: "Je lis l'erreur pour comprendre ce qui cloche.", points: 0 }
        - { key: "B", text: "Je demande à l'IA : « corrige ça, ça ne marche pas ».", points: 1 }
    - id: 5
      label: "CAPITALISATION"
      prompt: "Tu dois refaire une tâche similaire à celle d'il y a 3 mois. Comment fais-tu ?"
      choices:
        - { key: "A", text: "Je me base sur mes notes et mon expérience.", points: 0 }
        - { key: "B", text: "Je redemande un prompt à zéro, je n'ai rien retenu.", points: 1 }
  tiers:
    - range: [0, 1]
      slug: lucide
      color: accent
      label: "SURVIVANT LUCIDE"
      status: "Optimal"
      body: "Tu utilises l'IA comme un multiplicateur de force, pas comme une béquille. Ton cerveau reste le pilote de l'opération. Continue à entretenir cette notion de l'effort."
    - range: [2, 3]
      slug: dependance
      color: mutation
      label: "DÉPENDANCE EN COURS"
      status: "Vigilance"
      body: "L'offloading cognitif commence à s'installer. Tu gagnes en vitesse, mais tu perds en profondeur. Il est temps de réinjecter de la conscience dans tes processus pour éviter l'atrophie."
    - range: [4, 5]
      slug: atrophie
      color: danger
      label: "ATROPHIE CRITIQUE"
      status: "Alerte Rouge"
      body: "Tu es passé en mode passager. Ton esprit critique est en veille prolongée. Si l'IA s'arrête, ton expertise s'effondre. Tu dois entamer une rééducation cognitive d'urgence."
  newsletter:
    lucide:
      kicker: "RESTER UN CRAN DEVANT"
      h3: "Tu pilotes déjà. Reste à la pointe."
      body: "Chaque semaine, des outils et signaux pour garder une longueur d'avance sur les autres dans ton équipe. Cinq minutes de lecture, sans hype, sans funnel."
    dependance:
      kicker: "REPRENDRE LE CONTRÔLE"
      h3: "Le test t'inquiète ? Reste un cran devant."
      body: "Chaque semaine, un article concret pour muscler ton esprit critique et apprendre à piloter l'IA sans y laisser ton cerveau. Cinq minutes de lecture, sans hype, sans funnel."
    atrophie:
      kicker: "RÉÉDUCATION COGNITIVE"
      h3: "Le test est sévère. La rééducation commence ici."
      body: "Chaque semaine, un article concret pour rééduquer ton esprit critique et reprendre le pilote face à l'IA. Pas de théorie, pas de jargon, juste la sortie."
---

Tu utilises l'IA tous les jours. Pour rédiger, pour résumer, pour décider. Mais à quel point ton cerveau est-il devenu dépendant ? Le test suivant te donne, en cinq questions, une mesure simple de ta résilience cognitive face à l'IA.

Aucune réponse n'est jugée. Aucune donnée n'est stockée. Le résultat s'affiche à l'écran et n'est partagé qu'avec toi.

::kit-quiz-slot
::

## Comment lire ton score

Le TRC-01 mesure ta dépendance cognitive sur cinq dimensions : réflexe initial, validation critique, résilience technique, résolution d'erreur, capitalisation. Un score élevé n'est pas un échec. C'est un signal.

Chacun des trois paliers décrit une posture, pas une fatalité. Le palier *DÉPENDANCE EN COURS* est le plus fréquent : il signifie que tu commences à transférer ton effort cognitif à l'IA, mais tu peux encore reprendre le pilote facilement. Le palier *ATROPHIE CRITIQUE* est plus rare et appelle une rééducation : couper l'IA quelques heures par jour, reprendre des notes manuelles, refaire des choses « sans l'aide ».

Les seuils sont indicatifs et calibrés pour un usage personnel. Le test n'est ni clinique ni standardisé. Il sert de signal, pas de verdict.

## Sources

Ce test est inspiré des travaux de recherche sur l'**offloading cognitif** (Risko & Gilbert, 2016, *Trends in Cognitive Sciences*) et plus récemment sur l'**over-reliance** des utilisateurs face aux modèles génératifs (Bhatti et al., 2024). Les questions ont été adaptées au contexte du salarié en poste, sans formation tech.

Pour aller plus loin, lis l'article-parent qui explique le mécanisme cognitif derrière ce test, et abonne-toi à La Fréquence pour recevoir chaque semaine un article concret sur le pilotage de l'IA dans ton métier.
