# ADR 0005 - Contrats API partagés via package TypeScript dédié

## Statut

Accepté

## Contexte

Le front et le backend doivent converger sur des schémas communs afin d'éviter
la dérive des formats JSON et réduire les erreurs d'intégration.

## Décision

- Introduire `packages/contracts` comme source de vérité des schémas HTTP ;
- définir les schémas avec TypeBox (JSON schema + types TS dérivés) ;
- versionner les endpoints backend sous `/v1` ;
- faire consommer ces contrats par `apps/api` dès le bootstrap.

## Conséquences

- Les réponses API sont validées par Fastify selon des schémas centralisés.
- Le front pourra réutiliser les mêmes types sans duplication.
- Toute évolution d'API devra passer par mise à jour du package contrats.
