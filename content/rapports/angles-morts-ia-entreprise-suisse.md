---
title: "Les angles morts de l'IA en entreprise suisse"
description: "nLPD, secret d'affaires, Cloud Act. Ce que les éditeurs ne te disent pas quand ils vendent 'leur IA sécurisée'. Sept angles morts à vérifier avant de connecter une donnée client à un modèle."
date: 2026-06-07
category: souverainete-ia
kicker: "LECTURE LONGUE · 12 MIN"
status: draft
maintainer: human
---

## Le mot "sécurisé" ne veut rien dire

Quand un éditeur te dit que son IA est "sécurisée", il ne te dit pas de quelle sécurité il parle. Le mot recouvre trois choses qui ne se recoupent jamais complètement, et c'est exactement là que les angles morts s'installent.

Première sécurité : la protection des données personnelles. C'est le terrain de la nLPD en Suisse, du RGPD en Europe. La question, c'est : as-tu le droit de traiter ces données via cet outil ? Réponse contractuelle et procédurale : DPA signé, base légale, information des personnes, registre des traitements.

Deuxième sécurité : la protection du secret d'affaires. Ce n'est pas le même terrain. Ici on ne parle plus de la personne dont on traite la donnée, on parle du savoir-faire de l'entreprise, de sa stratégie, de ses positions ouvertes, de ses dossiers clients en cours. La nLPD ne couvre pas ça. La LCD (art. 6) et le Code pénal (art. 162) le couvrent, plus les NDA contractuels. Mécanique juridique entièrement différente.

Troisième sécurité : la résidence des données. Où vivent-elles physiquement, et surtout, qui peut juridiquement les exiger ? C'est là qu'apparaît le Cloud Act, et c'est là que la plupart des discussions "IA et conformité" s'effondrent quand on creuse.

Un cabinet immobilier suisse passe à ChatGPT Enterprise pour traiter ses dossiers locataires "parce que c'est sécurisé". Conforme nLPD ? Oui, sous réserve du DPA et du mécanisme de transfert. Secret d'affaires protégé contre une injonction étrangère ? Non : OpenAI est une entreprise américaine, le Cloud Act s'applique, et l'option résidence UE en Enterprise ne change pas la nationalité de la maison-mère. Le cabinet a coché la case conformité, et il a laissé son secret d'affaires complètement exposé.

C'est le scénario type. C'est rarement de la mauvaise foi de l'éditeur, c'est presque toujours un raccourci de vocabulaire qui agrège trois sécurités distinctes en un seul mot. Tant que tu n'as pas désagrégé "sécurisé" en ces trois questions, tu ne sais pas ce que tu signes.

Le pli à prendre, c'est de ne plus jamais poser la question "est-ce que cet outil est sécurisé". C'est une question piège, parce qu'elle accepte une réponse en un mot. À la place, trois questions séparées. "Cet outil est-il conforme nLPD pour le type de donnée que je veux y faire passer ?" "Cet outil expose-t-il mon secret d'affaires à une juridiction tierce ?" "Où vivent physiquement mes données, et qui peut juridiquement les exiger ?" Tu reçois rarement trois "oui" de suite. Tu reçois souvent un "oui" sur la première et deux "ça dépend" sur les deux autres. C'est ce moment-là qui compte : tu sais exactement ce que tu signes, ce que tu acceptes comme risque, et ce que tu vas devoir documenter ailleurs.

## Conformité ne veut pas dire secret d'affaires

C'est l'angle mort qui coûte le plus cher, parce qu'il a l'air d'avoir été traité quand il ne l'a pas été.

La nLPD protège les personnes physiques. Quand tu signes un DPA avec un éditeur, que tu obtiens une garantie contractuelle de non-entraînement, et que tu mets en place un mécanisme de transfert (Swiss-US DPF si le fournisseur est certifié, ou CCT plus analyse d'impact), tu es conforme. Tu peux le documenter, le justifier devant la PFPDT, l'inscrire dans ton registre des traitements. Ça tient.

Sauf que la nLPD ne te dit rien sur ton secret d'affaires. Elle ne protège pas le contenu de tes dossiers en tant que dossiers, elle protège les données personnelles qu'ils contiennent. Ton mandat de gérance, ta note d'investissement, ton dossier client en cours, ce sont des actifs stratégiques pour ton entreprise. Leur exposition n'est pas un problème de protection des données : c'est un problème de souveraineté.

Le levier juridique qui les protège, c'est la LCD (art. 6) et le CP (art. 162). Les NDA contractuels avec le fournisseur s'ajoutent. Tout ce dispositif tient face à un concurrent qui voudrait te subtiliser tes dossiers. Il ne tient pas face à une injonction d'un juge étranger qui ordonne au fournisseur de communiquer ces mêmes dossiers à une autorité publique.

Le Cloud Act, c'est ça. Une loi américaine de 2018 qui permet à un juge américain d'exiger d'une entreprise sous juridiction US la communication de données qu'elle détient, même si ces données sont stockées hors des États-Unis. La maison-mère US suffit. Microsoft Irlande, AWS Francfort, OpenAI Dublin : juridiquement sous Cloud Act, peu importe où vivent les serveurs.

Reprends le cabinet immobilier en ChatGPT Enterprise avec résidence UE et option de non-entraînement contractuelle. Conformité nLPD impeccable. Survient une injonction Cloud Act ciblant un dossier locataire qui touche, par hasard, une partie liée à une enquête américaine. OpenAI a l'obligation juridique de produire le contenu. Le DPA ne bloque pas, le no-train ne bloque pas, la résidence UE ne bloque pas. Ces protections ont été conçues pour d'autres risques.

C'est l'écart structurel entre conformité et souveraineté. La conformité est procédurale : as-tu rempli les cases ? La souveraineté est juridictionnelle : qui peut, en dernier ressort, lire tes données ? Un outil peut cocher toutes les cases procédurales et laisser la question juridictionnelle béante. Et inversement, un outil parfaitement souverain (un Llama en self-host sur du matériel suisse) peut être totalement non-conforme nLPD si tu n'as pas mis en face le DPA et le mécanisme d'information des personnes.

Les autorités suisses ne considèrent pas le Cloud Act comme contraire en soi à l'ordre public suisse. C'est un risque à documenter et à mitiger, pas un veto absolu. Mais c'est un risque qui doit être nommé. La phrase à graver, c'est : "conforme nLPD, exposé Cloud Act". Une fiduciaire en API OpenAI peut très bien vivre avec ce profil pour des tâches non-sensibles. Le problème n'est pas l'outil, c'est l'illusion qu'il protégerait ce qu'il ne protège pas.

## L'arbre de décision

Avant de choisir un outil, il faut savoir si on a le droit. J'ai posé cinq questions à un client le mois dernier, dans cet ordre. La moitié des cas s'est arrêtée à la deuxième.

**Question 1 : y a-t-il des données personnelles dans ce que tu vas envoyer au modèle ?** Noms de locataires, coordonnées de clients, identifiants, dossiers RH, dossiers médicaux, parties prenantes financières. Si la réponse est non, tu sors du champ nLPD. Tu peux passer directement à la question du secret d'affaires. Si la réponse est oui, tu continues. En pratique, dès qu'on touche du dossier client réel, la réponse est oui. Les exceptions sont rares.

**Question 2 : peut-on anonymiser durablement ces données avant traitement ?** Le piège, c'est la confusion entre anonymisation et pseudonymisation. Remplacer "Pierre Dupont" par "Client-1742" dans le prompt, c'est pseudonymiser. La donnée reste personnelle au sens de la loi, parce que le lien existe encore. Tu as la table de correspondance quelque part, le recoupement est possible par adresse, par montant, par date, par n'importe quel champ contextuel. L'anonymisation, c'est rompre durablement le lien, avec un effort de réidentification disproportionné. Dans l'immobilier, dans la finance, dans la santé, l'anonymisation vraie est presque impossible : un dossier locataire avec un montant de loyer, un quartier et une date d'entrée se recoupe avec un cadastre public. La plupart des clients que j'ai accompagnés ont buté ici. Ils croyaient anonymiser, ils pseudonymisaient.

**Question 3 : les données sont-elles sensibles, ou le traitement entre-t-il dans le périmètre d'externalisation FINMA ?** Données de santé, secret bancaire (art. 47 LB), secret de l'avocat (art. 321 CP), périmètre FINMA Circ. 2018/3 pour les établissements financiers. Si oui, le niveau d'exigence change. Résidence suisse et DPA deviennent obligatoires, le fournisseur souverain s'impose, la notification FINMA doit être évaluée, le plan de sortie doit exister sur papier. Si non, tu passes à la question 4 avec le régime nLPD standard.

**Question 4 : le fournisseur garantit-il par contrat l'absence d'entraînement sur tes données, un DPA signé, et des mesures de sécurité adéquates ?** Si la réponse est non, l'outil est proscrit pour ce type de donnée. Cas typique : ChatGPT personnel, Claude Pro grand public, Gemini Advanced personnel. Sur ces plans, l'entraînement est généralement actif par défaut, le DPA n'existe pas, et tu ne peux pas légalement y faire passer une donnée client. C'est sans appel. Si la réponse est oui, tu passes à la question 5.

**Question 5 : où les données sont-elles traitées physiquement ?** Suisse ou UE : feu vert, sous réserve du DPA et des garanties techniques. États-Unis ou pays tiers : conditionnel. Il te faut un mécanisme de transfert (Swiss-US DPF si le fournisseur est certifié et que son statut est à jour, ou CCT plus analyse d'impact), et une analyse du risque Cloud Act. Idéalement, CMK ou HYOK, plus calcul confidentiel. Si tu ne peux pas mettre en face ces couches, tu redescends d'un cran dans ton choix d'outil.

Cette séquence n'est pas un checklist froid à dérouler. C'est une grille de tri qui te dit où tu en es. Si tu butes à la question 2, ton vrai problème est la classification de tes données. Si tu butes à la question 5, ton vrai problème est le choix de fournisseur. Le pire est de ne pas savoir où tu butes.

## La matrice des verdicts

La matrice complète vit dans [le grand filtre](/outils/le-grand-filtre), avec les conditions a, b, c détaillées et les couleurs par cellule. Ici je résume les trois blocs qui comptent pour décider.

**Bloc 1 : les outils exposés.** ChatGPT perso Free, ChatGPT Plus individuel, Claude Pro grand public, Gemini Advanced personnel. Résidence US, pas de DPA, entraînement actif par défaut sur la plupart. Non-conforme nLPD pour toute donnée personnelle réelle, et secret d'affaires exposé sur deux fronts : entraînement et Cloud Act. C'est le terrain du shadow IT, où les employés collent du dossier client dans une interface qu'ils ont ouverte sur leur compte perso. Aucune ligne défensive. Ce n'est pas un débat de degré, c'est un débat d'usage : ces outils ne doivent jamais voir une donnée client réelle.

**Bloc 2 : les outils conformes mais Cloud Act.** ChatGPT Team et Enterprise, API OpenAI avec ZDR, certains plans Claude commerciaux configurés US. Résidence US (UE en option pour Enterprise), DPA disponible, garantie de non-entraînement contractuelle. Conforme nLPD sous condition que le mécanisme de transfert tienne (DPF si le fournisseur est certifié, sinon CCT plus TIA). Mais exposés au Cloud Act parce que la maison-mère est américaine. Verdict secret d'affaires : risqué. C'est la zone où la confusion fait le plus de dégâts : le client a signé son DPA, il a son option Enterprise, et il croit avoir résolu sa souveraineté. Il a résolu sa conformité, pas sa souveraineté.

**Bloc 3 : les outils conformes et protégés.** Azure OpenAI région CH North avec HYOK et TEE et exemption journal. AWS Bedrock région Zurich avec le même empilement. Infomaniak AI sur API. Self-host bien fait sur matériel ou hébergeur suisse. Ici, résidence CH, DPA, no-train, et surtout la chaîne de protection technique qui rend le secret d'affaires opposable même à une demande étrangère. Sur Azure et Bedrock région CH, le verdict "Bon" n'est pas automatique : il suppose qu'on a empilé les trois couches. Sans HYOK, sans TEE, sans exemption de journalisation, on retombe à "Moyen". Sur Infomaniak et sur self-host bien fait, le profil est le plus haut accessible aujourd'hui pour une PME suisse.

Pour la matrice complète, les conditions précises et la légende couleur cellule par cellule, ouvre [le grand filtre](/outils/le-grand-filtre). La matrice répond à "ai-je le droit et est-ce que mon secret tient". Le tableau de réalité opérationnelle, dans le même outil, répond à "qu'est-ce que ça va coûter à mettre en place".

## Les sept angles morts

Sept points où je vois passer les erreurs, classés par fréquence dans les missions que j'accompagne. Chacun mérite une vérification avant signature.

### 1. Conformité n'est pas secret d'affaires

Traité en section 2, à garder en tête comme la racine de tout le reste. La nLPD protège la personne, pas le savoir-faire. Tu peux être impeccablement conforme et laisser ton secret béant. La phrase à demander à ton éditeur ou à ton conseil interne, c'est : "qu'est-ce qui empêche, juridiquement, qu'un juge étranger ordonne la production de ce contenu ?" Si la réponse n'inclut pas la juridiction du fournisseur et son architecture de clés, la protection est incomplète.

### 2. Anonymisation n'est pas pseudonymisation

Tu remplaces le nom par un ID, tu laisses le montant, l'adresse, la date. Tu as pseudonymisé. La donnée reste personnelle au sens nLPD, parce que la réidentification est possible par recoupement avec un registre public, un cadastre, une base actionnariat. Un dossier locataire pseudonymisé reste un dossier personnel ; un dossier patient pseudonymisé reste un dossier de santé. Le coût de la confusion, c'est de croire qu'on est sorti du champ légal alors qu'on est toujours dedans, avec un faux sentiment de sécurité qui assouplit ensuite les autres garde-fous.

### 3. Les plans grand public entraînent par défaut

ChatGPT Plus, Claude Pro et Max, Gemini Advanced personnel. Sur la plupart de ces plans, l'entraînement sur les conversations est actif par défaut, parfois désactivable dans les paramètres, parfois pas du tout. Un employé qui utilise son compte perso pour traiter un dossier professionnel envoie potentiellement ce dossier dans le futur corpus d'entraînement du modèle. Aucune politique d'usage interne ne tient si tu ne contrôles pas les comptes utilisés. C'est le mécanisme central du shadow IT IA en entreprise : ce ne sont pas les outils achetés qui posent le problème, ce sont les outils utilisés sans achat.

### 4. Les agents de codage héritent du backend

Claude Code, Cursor, Antigravity, Copilot, Codex. Ce ne sont pas des outils, ce sont des clients qui consomment un backend d'inférence. La conformité d'un agent dépend entièrement du backend vers lequel il est routé. Claude Code en API Anthropic US, c'est un profil "API OpenAI". Claude Code routé vers Bedrock région européenne, c'est un profil "Bedrock CH". Claude Code sur un plan Pro/Max grand public, c'est potentiellement de l'entraînement actif par défaut sur ton code. La question n'est jamais "cet agent est-il conforme", c'est "cet agent, configuré comme ça, vers quel backend, sur quel plan, est-il conforme".

### 5. Le self-host n'est pas automatiquement souverain

Tu déploies Llama sur un VPS étranger. Tu te sens souverain parce que c'est "ton" déploiement. Mais ton VPS est chez Hetzner Allemagne, ou chez un opérateur américain en Europe, et la couche infrastructure peut réintroduire un risque juridictionnel que tu croyais avoir éliminé. Le self-host vrai suppose un serveur physiquement en Suisse, matériel propre ou hébergeur suisse type Infomaniak, et une sécurité interne à la hauteur (accès, sauvegardes, durcissement). Sans ces deux conditions, tu as déplacé le risque sans le supprimer, et tu hérites en plus des coûts cachés de l'infra IA, en particulier les GPU.

### 6. Le niveau "Bon" sur Azure et Bedrock CH est illusoire sans empilement

C'est un piège typique des architectes qui prennent Azure OpenAI région CH North et qui pensent avoir résolu la souveraineté. La région suisse seule donne le verdict "Moyen", pas "Bon". Pour atteindre "Bon", il faut empiler trois couches : clé externalisée en HYOK (hors d'atteinte de l'hébergeur, via Azure Key Vault Managed HSM ou un service tiers), calcul confidentiel sur l'inférence (TEE ou Nitro Enclaves), exemption de journalisation des invites. Sans ce trio, le verdict redescend. Et la lourdeur de configuration est réelle. Beaucoup de POC s'arrêtent au déploiement de base et présentent le verdict de surface comme le verdict réel.

### 7. La résidence UE ne protège pas du Cloud Act

C'est le dernier piège, et pas le moindre. Un serveur Microsoft à Dublin, un serveur AWS à Francfort, un serveur OpenAI dans l'option UE Enterprise, tout cela reste sous juridiction du Cloud Act tant que la maison-mère est américaine. La résidence géographique n'est pas la juridiction. La régulation européenne a tenté de répondre à ce point avec le RGPD, l'arrêt Schrems II, le DPF post-2024, mais la mécanique d'exposition reste : une injonction Cloud Act tient même contre un serveur européen, parce qu'elle vise l'entreprise, pas le matériel. La seule réponse structurelle, c'est un fournisseur dont la maison-mère n'est pas américaine.

## Le cas des agents de codage

Si tu es indé, cadre tech, dev salarié, ou que tu pilotes une équipe qui utilise un agent de codage, ce paragraphe est pour toi. Les agents méritent leur section parce que leur surface d'exposition est différente de celle d'un chatbot, et que les pièges propres au domaine sont sous-documentés.

Premier point : l'agent vaut ce que vaut son backend. Claude Code en plan API Anthropic ou via Bedrock, c'est un profil commercial : pas d'entraînement, DPA disponible, configuration possible vers une région souveraine. Claude Code en plan Pro ou Max grand public, c'est un autre monde : l'entraînement est généralement actif par défaut, exactement comme sur ChatGPT Plus. L'interface est identique, le profil de risque ne l'est pas. La même remarque vaut pour Antigravity (Google) : par défaut le code part sur les serveurs Google US, via Google Cloud entreprise tu peux le router vers une région suisse, en Ollama local tu rejoins le profil self-host.

Deuxième point : le périmètre. Un agent de codage touche du code, pas des données de production. Le tenir là. Code source, données de test, données synthétiques, jamais de dossier client réel, jamais de base de données prod en lecture directe par l'agent. Et les secrets : clés API, mots de passe, identifiants de bases métier ne doivent finir ni dans un prompt, ni dans un cache local, ni dans une session ouverte sur ton poste. Si ton workflow t'oblige à coller un secret dans un prompt pour que l'agent travaille, ton workflow est cassé, pas l'agent.

Troisième point : la surface locale. Ces agents lisent le dépôt, exécutent des commandes terminal, pilotent parfois un navigateur. Certains conservent les transcripts en clair localement. Cela élargit la surface d'exposition au-delà du simple chatbot : exfiltration possible si la machine est compromise, injection de prompt par un fichier malveillant dans le repo, ouverture de connexion réseau sans contrôle d'accès. Il faut traiter l'agent comme un utilisateur de plus, avec un contrôle d'accès strict, une revue des actions, et idéalement un compte technique dédié.

Pour les équipes qui poussent l'IA dans le code en production réelle, le bon réflexe est de routes vers un backend commercial (API, Bedrock, Vertex, Foundry, ou un équivalent en région suisse), pas vers un plan grand public, même si le plan grand public coûte moins cher en apparence. Le différentiel de prix paie pour ce que tu n'as pas à expliquer à ton conseil juridique en cas d'incident.

## Et alors, qu'est-ce qu'on fait

La partie utile, maintenant que les angles morts sont posés. Voici la checklist déploiement, structurée par bloc.

**Pour toute option faisant intervenir un tiers.** Un DPA signé au sens de l'art. 9 nLPD, qui décrit les traitements, les sous-traitants ultérieurs, les mesures de sécurité, les modalités de fin de contrat. Un mécanisme de transfert pour tout flux hors CH ou UE : adéquation Swiss-US DPF si le fournisseur est certifié (à vérifier sur la liste officielle, certification annuelle, statut volatile), ou CCT plus analyse d'impact. Une confirmation contractuelle du non-entraînement, et du zero-data-retention si le fournisseur le propose. Une AIPD si le risque est élevé, en particulier sur des données sensibles ou des traitements à grande échelle. Une mise à jour du registre des traitements et de la politique de confidentialité, et une information des personnes concernées. Et les mesures techniques de base : chiffrement en transit et au repos, contrôle d'accès, journalisation.

**Spécifique aux branches Azure et Bedrock région suisse.** Pour atteindre le niveau "Bon" et non pas "Moyen", trois couches techniques. Clé externalisée en HYOK, gardée hors d'atteinte de l'hébergeur, via Azure Key Vault Managed HSM ou AWS KMS external key store. Calcul confidentiel pour protéger l'inférence elle-même : TEE sur Azure, Nitro Enclaves sur AWS. Exemption de journalisation des invites, sinon les prompts traversent les pipelines de logs du fournisseur et redeviennent un point d'exposition.

**Périmètre FINMA et gouvernance.** Si tu es établissement financier ou que ton périmètre touche le secret bancaire, la notification d'externalisation FINMA est à évaluer en amont, pas en aval. La Circ. 2018/3 demande une clause d'audit et un plan de réversibilité documenté. Au-delà de la FINMA, toute entreprise qui pousse l'IA en interne a besoin d'une politique d'usage formalisée, qui dit quel outil pour quel type de donnée. Un mandat de gérance, un dossier patient, une note d'investissement, un dossier RH, un fragment de code applicatif : chacun ne va pas dans le même outil, et la politique interne doit dire lequel.

Cette checklist n'est pas un horizon lointain. Sur les missions que j'accompagne, la mise en place complète prend entre quatre et huit semaines pour une PME, selon la complexité de l'environnement IT existant et le périmètre de données concerné. Ce n'est pas long, mais ça suppose qu'on commence vraiment. Le pire scénario que je vois, c'est l'attente : "on verra quand on aura plus de visibilité sur la régulation". Pendant l'attente, les employés utilisent ChatGPT perso avec des données clients, et le risque s'accumule en silence.

Une dernière chose, et c'est peut-être le levier le plus efficace que je connaisse : la classification des données avant le choix d'outil. Tu listes les types de données que ton entreprise traite (mandat de gérance, dossier client, note interne, code applicatif, document marketing, donnée RH, donnée patient, fragment de stratégie commerciale) et tu attribues à chaque type un niveau de sensibilité, plus un outil ou une famille d'outils autorisée. Document interne d'une page, signé. Ensuite, tu peux laisser tes équipes utiliser l'IA en interne sans peur, parce qu'ils ont une grille de décision claire. Sans cette classification, chaque employé reconstruit sa propre grille à la volée, et certaines de ces grilles sont fausses.

## Glossaire et limites

Les termes que tu dois pouvoir lire sans hésiter pour suivre le dossier IA dans ton entreprise, version compacte. Le glossaire exhaustif vit dans [le grand filtre](/outils/le-grand-filtre).

**nLPD** : Nouvelle Loi fédérale suisse sur la protection des données, en vigueur depuis le 1er septembre 2023.

**RGPD** : Règlement général européen sur la protection des données.

**DPA** : Data Processing Agreement, contrat de sous-traitance qui encadre le traitement de données personnelles par un tiers, art. 9 nLPD.

**CCT** : Clauses contractuelles types, mécanisme de garantie reconnu pour les transferts transfrontières.

**Swiss-US DPF** : Data Privacy Framework, voie d'adéquation pour les transferts vers les entreprises US certifiées, en vigueur depuis le 15 septembre 2024, certification annuelle à vérifier.

**TIA** : Transfer Impact Assessment, analyse d'impact du transfert requise hors voie d'adéquation.

**CMK** : Customer-Managed Keys, tu fournis et contrôles tes clés de chiffrement au lieu de celles du fournisseur.

**HYOK** : Hold Your Own Key, la clé reste hors d'atteinte de l'hébergeur, chez toi ou un tiers suisse.

**TEE** : Trusted Execution Environment, enveloppe de calcul confidentiel qui protège la donnée pendant son traitement en mémoire.

**Cloud Act** : loi américaine de 2018 qui permet à un juge américain d'exiger d'une entreprise sous juridiction US la communication de données, y compris stockées hors des États-Unis.

**AIPD** : Analyse d'impact relative à la protection des données, requise en cas de risque élevé.

**FINMA Circ. 2018/3** : cadre suisse de l'externalisation applicable aux établissements financiers.

Limites de ce document. Ce texte est une aide à la lecture du dossier IA et données en entreprise suisse. Ce n'est pas un avis juridique. La qualification précise de tes données et la conformité d'un déploiement donné doivent être validées par un conseil juridique spécialisé, en particulier sur les volets FINMA, secret médical et secret professionnel de l'avocat. Le marché bouge : les caractéristiques des fournisseurs (résidence, options de chiffrement, statut DPF, conditions contractuelles) évoluent et doivent être vérifiées au moment de la contractualisation. Dernière révision : 7 juin 2026.

Pour vérifier ton setup en un coup d'œil et croiser ton outil avec ta classification de données, ouvre [le grand filtre](/outils/le-grand-filtre). Pour recevoir les mises à jour quand le marché bouge, abonne-toi à [La Fréquence](/frequence).
