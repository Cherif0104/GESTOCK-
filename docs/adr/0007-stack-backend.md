# ADR 0007 - Stack backend Node.js TypeScript + Fastify

## Statut

Accepté

## Contexte

Le backend doit être performant, typé, simple à faire évoluer en architecture
hexagonale, et cohérent avec l'écosystème JavaScript existant du projet.

## Décision

- Runtime: Node.js ;
- langage: TypeScript strict ;
- framework HTTP: Fastify ;
- architecture: hexagonale légère avec dossiers :
  `config`, `http/plugins`, `http/routes/v1`, `shared/context`,
  `infrastructure/db` ;
- API versionnée via préfixe `/v1`.

## Conséquences

- Démarrage rapide d'une API robuste sans surcharge framework.
- Bonne base pour introduire injection d'adaptateurs DB/auth/logs.
- Évolutivité vers modules métier (stocks, achats, approvisionnements).
