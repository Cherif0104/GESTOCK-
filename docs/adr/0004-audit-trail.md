# ADR 0004 - Audit trail transactionnel des actions sensibles

## Statut

Accepté

## Contexte

GESTOCK cible des organisations nécessitant traçabilité, conformité et
reconstitution d'historique sur les opérations critiques.

## Décision

- Créer une table `app.audit_logs` tenantisée (`tenant_id`) ;
- enregistrer les événements métier sensibles (`action`, `resource_*`, `actor`) ;
- exiger à terme une écriture transactionnelle dans la même transaction que
  l'opération métier (same commit boundary) ;
- démarrer par un adaptateur backend placeholder, déjà branché aux endpoints.

## Conséquences

- La structure des logs d'audit est stabilisée tôt.
- Les endpoints existants peuvent commencer à produire des traces auditables.
- Le stockage transactionnel réel sera ajouté avec le repository PostgreSQL.
