# ADR 0002 - Multi-tenant par schéma partagé et RLS PostgreSQL

## Statut

Accepté

## Contexte

GESTOCK doit supporter un grand nombre de tenants sans multiplier les bases de
données, tout en évitant les fuites de données inter-tenant.

## Décision

Le backend adopte un modèle **shared schema PostgreSQL** :

- tables communes dans le schéma `app` ;
- toutes les tables métier incluent `tenant_id` ;
- Row Level Security (RLS) activé sur les tables tenantisées ;
- politique d'accès basée sur `app.current_tenant_id()` ;
- la couche API fixe `SET LOCAL app.tenant_id = :tid` par requête transactionnelle.

## Conséquences

- Le coût opérationnel reste maîtrisé (une seule instance PostgreSQL par environnement).
- Les requêtes SQL doivent être systématiquement tenant-aware.
- Les tests d'intégration devront vérifier la non-régression d'isolation RLS.
- Les exports inter-tenant nécessiteront des rôles techniques explicites.
