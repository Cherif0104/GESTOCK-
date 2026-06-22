# ADR 0008 - Compatibilité monorepo backend sans casser le front Vite

## Statut

Accepté

## Contexte

Le front Vite déjà en production doit continuer à builder avec `npm run build`
à la racine, pendant l'introduction progressive d'un backend.

## Décision

- Conserver strictement le script racine `build` actuel pour le front ;
- ajouter `apps/api` et `packages/contracts` en workspaces npm ;
- isoler scripts backend sous commandes dédiées (`api:dev`, `api:build`,
  `contracts:build`) ;
- ne pas déplacer ni restructurer `src/` côté front.

## Conséquences

- Le pipeline front existant reste inchangé.
- L'équipe peut itérer sur le backend sans risque immédiat pour Vite.
- Les workflows CI pourront séparer build front et build backend.
