## Choix techniques, organisationnels et architecturaux — CollabWrite

Ce document explique les décisions techniques clés du projet, leurs raisons et les impacts attendus.

### 1) Architecture générale
- Monorepo avec trois sous-projets:
  - `collabwrite-api` (API REST Node/Express + Prisma + Postgres)
  - `collabwrite-frontend` (React + Vite + Tailwind + shadcn/ui)
  - `collabwrite-realtime` (Socket.io + WebRTC pour signalisation/audio)

Raisons:
- Séparation claire des responsabilités (API, UI, temps réel).
- Déploiement et scalabilité indépendants (réplication horizontale possible par brique).
- Expérience dev fluide (chaque brique reste simple à lancer et à tester).

Impact:
- Légère complexité d’orchestration (variables d’environnement, ports, CORS), compensée par la clarté et l’évolutivité.

### 2) Backend — Node.js, Express, Prisma, Postgres
- Express: minimal, mature, écosystème riche, facile à raisonner.
- Au départ nous avons choisi Prisma pour sa productivité et son schéma typé, mais nous avons eu une incompatibilités rencontrées avec Docker (synchronisation des migrations) et puique le temps était limité nous avons décidé finalement d'utiliser un script `.sql` classique appliqué au lancement de Docker pour initialiser la base.
- Postgres: SGBD robuste, relations et requêtes avancées, bonne compatibilité cloud.

### 3) Authentification — JWT (access + refresh)
- JWT pour l’API stateless, facile à mettre en place avec un support de refresh tokens.

Impact:
- Simplicité et compatibilité front/mobile; vigilance sur stockage sécurisé des tokens.

### 4) Emails — Nodemailer + SMTP
- Nodemailer: standard de facto, compatible avec SMTP (Gmail, Mailtrap, fournisseurs pro).
- SMTP configurable par `.env` pour s’adapter aux environnements (dev/prod).

Impact:
- En dev: configuration rapide

### 5) Frontend — React + Vite + Tailwind + shadcn/ui
- React: écosystème et recrutement faciles, composants réutilisables.
- Vite: démarrage/build ultra-rapides, DX moderne.
- Tailwind + shadcn/ui: productivité UI, design consistant, theming simple.
- Éditeur: TipTap pour une expérience riche et stable.

Impact:
- Développement plus rapide, maintenance facilitée, UI cohérente.

### 6) Temps réel — Socket.io + WebRTC (service dédié)
- Socket.io: fiabilité multi-transports (websocket/polling), simplicité côté client.
- WebRTC: audio P2P, scalabilité par décentralisation du flux média.
- Service `collabwrite-realtime` dédié pour isoler la charge réseau et les cycles de vie.

Impact:
- Fonctionnalités temps réel indépendantes; préparation à la montée en charge.

### 7) Conteneurisation
- Docker Compose pour lancer Postgres et l’API simplement en dev.
- `.env` par brique pour isoler la configuration (CORS, JWT, SMTP, URLs service realtime).

Impact:
- Onboard rapide; cohérence des environnements.

### 8) Sécurité et bonnes pratiques
- Secrets dans `.env` (jamais commités), CORS restreint, validation d’inputs.
- Mots de passe hachés (bcrypt), durées JWT limitées, refresh séparé.
- SMTP: utiliser des mots de passe d’application (Gmail) ou des clés dédiées.

---

### 10) Choix organisationnels

- Gestion de projet
  - Fonctionnement en itérations courtes de 2–3h : en début d'itération, on définit ensemble les tâches à réaliser.
  - Toute l’équipe travaille sur des branches prédéfinies correspondant à l’itération en cours.
  - À la fin de l’itération, on fait un point d’avancement puis on merge tout ce qui a été développé vers la branche `develop`.
  - On vérifie que la branche `develop` fonctionne correctement, puis on recommence ce cycle pour l’itération suivante.

- Workflow Git
  - Branches: `main` (stable), `dev` (intégration), `feature/*`, `fix/*`, `chore/*`.
  - Stratégie: Pull Request obligatoires vers `dev`
  - Convention de commits: Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`...).

- Revue de code
  - 1 relecteur minimum, checklist (tests/impact sécurité/performances, lisibilité).

- Documentation
  - README à la racine (lancement), READMEs par brique, `CHOIX_TECHNIQUES.md`.

---

### 11) Choix architecturaux complémentaires

- Frontend
  - Découpage par domaines (documents, dossiers, auth, chat/audio), hooks dédiés (`useWebRTC`, `useDocumentStore`).
  - Typage strict TypeScript, services API centralisés, composants UI réutilisables (shadcn/ui).

- Backend API
  - Couches: routes → contrôleurs → services → accès DB → utils.
  - Middlewares dédiés: auth, validation, gestion d’erreurs; schémas d’entrées validés.
  - Limites claires: l’API ne gère pas les sockets/audio (isolés dans `realtime`).

- Service Realtime
  - Socket.io pour signalisation, WebRTC pour médias P2P; rooms par document/salon.
  - Auth via token côté client (upgrade socket), politiques de rooms; logs d’événements clés.

- Données & intégrité
  - Postgres comme source de vérité (documents, versions, permissions, sessions).
  - Verrous logiques au niveau service (ex: permissions d’édition, invitations).

### 12) Intégration CI/CD

- **GitHub Actions** pour l’intégration continue
  - Tests automatiques sur les push vers `main`, `dev`
  - Tests également déclenchés sur les pull requests vers `main` et `dev`
  - Workflow focalisé sur l’API (`collabwrite-api`) pour l’instant

- **Tests couverts**
  - Utils (JWT, bcrypt, TOTP)
  - Middleware d’authentification
  - Services (auth.service avec mocks DB)

Impact:
- Réduction du risque de casser la branche principale
- Amélioration de la confiance dans les merges
- Base solide pour étendre aux autres briques (frontend, realtime)
