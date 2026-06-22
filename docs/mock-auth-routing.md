# GESTOCK - Simulation des comptes et routage post-login

Ce document décrit les comptes de test utilisés pour valider progressivement les
écrans GESTOCK image par image.

## Identifiants de démonstration

Tous les comptes utilisent le mot de passe :

```text
gestock-demo
```

| Email | Rôle | Cas testé | Destination attendue |
| --- | --- | --- | --- |
| `admin@gestock.local` | Administrateur | Organisation unique avec organisation par défaut | Dashboard direct |
| `stock@gestock.local` | Responsable Stock | Organisation unique Côte d'Ivoire | Dashboard direct |
| `magasin@gestock.local` | Magasinier | Organisation unique Bénin | Dashboard direct |
| `achats@gestock.local` | Acheteur | Plusieurs organisations sans défaut | Sélection organisation |
| `direction@gestock.local` | Direction | Groupe multi-filiales avec MFA obligatoire | MFA puis sélection/dashboard selon paramétrage |
| `audit@gestock.local` | Auditeur | Première connexion obligatoire | Première connexion puis MFA |

## Règle de routage

Après login, la simulation applique l'ordre suivant :

1. Si le compte est en première connexion : `first-login`.
2. Sinon, si le compte exige MFA : `mfa`.
3. Sinon, si une organisation par défaut existe : `dashboard`.
4. Sinon, si le compte n'a qu'une organisation active : `dashboard`.
5. Sinon : `organization-selection`.

La décision est stockée dans :

```text
sessionStorage["gestock.mockSession"]
```

Ce stockage temporaire permettra de brancher les prochains écrans sans créer
encore de backend d'authentification réel.

## Logique métier à respecter

- Une organisation indépendante amène directement l'utilisateur au dashboard.
- Un groupe ou une multinationale avec plusieurs filiales doit afficher la
  sélection d'organisation, sauf si une organisation par défaut a été configurée.
- Une fois l'organisation par défaut configurée, l'utilisateur n'a plus à choisir
  à chaque connexion.
- Les rôles sensibles peuvent imposer MFA avant l'accès.
- Les premières connexions doivent passer par l'initialisation du profil.
