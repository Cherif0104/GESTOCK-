# ADR 0001 - Orchestration multi-agents

## Statut

Accepté

## Contexte

GESTOCK vise une plateforme SaaS Enterprise couvrant stocks, achats,
approvisionnements, entrepôts, reporting, sécurité, intégrations et mobile.
Le périmètre est large et nécessite une séparation claire des responsabilités
pour avancer sans conflits entre architecture, backend et expérience produit.

## Décision

Le projet adopte une organisation multi-agents :

- **Claude Opus 4.7 Thinking** porte les décisions d'architecture Enterprise,
  DDD, multi-tenant, sécurité, RBAC et audit trail.
- **GPT 5.3 Codex Hackfast** porte l'implémentation backend, API, base de
  données, tests, CI et intégrations techniques.
- **GPT 5.5 Hackfast** porte la logique métier, les workflows, le front-end,
  l'UX, la documentation fonctionnelle et les écrans opérationnels.
- L'agent coordinateur intègre les livrables, vérifie le build, committe et
  pousse vers GitHub afin de déclencher Vercel.

## Conséquences

- Les décisions transverses doivent être documentées dans `docs/adr/`.
- Les changements visibles sur Vercel doivent préserver le build front existant.
- Le backend doit être ajouté progressivement sans casser le déploiement Vite.
- Les contrats API devront devenir la source de vérité entre backend et front.

## Prochaine décision attendue

ADR 0002 devra définir le modèle multi-tenant cible :

- base partagée avec `tenant_id` ;
- isolation par API et règles SQL ;
- stratégie d'identification tenant ;
- modèle de rôles et permissions ;
- journalisation des actions sensibles.
