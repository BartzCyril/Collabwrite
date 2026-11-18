# CollabWrite

> Éditeur de documents collaboratif en temps réel, façon wiki d'équipe : co-édition, chat par document, appel audio et invitations par e-mail.

![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?logo=socketdotio&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white)

**👉 Voir le site : [collabwrite.bartzcyril.fr](https://collabwrite.bartzcyril.fr)** (temps réel, chat et e-mails désactivés sur la démo)

## Sujet

Projet de formation réalisé en équipe : concevoir une application de type wiki permettant de créer des documents, de les ranger dans des dossiers et de travailler dessus à plusieurs en même temps.

## Fonctionnalités

**Comptes et sécurité**
- Inscription, connexion avec JWT (access token + refresh token stocké en base), déconnexion avec révocation de session
- Double authentification (TOTP, QR code compatible Google Authenticator)
- Modification du profil et du mot de passe
- Espace administrateur : gestion des rôles et blocage de comptes

**Documents**
- Documents texte (éditeur riche TipTap), images et PDF : création, lecture, édition, suppression
- Dossiers et sous-dossiers, déplacement de fichiers
- Sauvegarde automatique pendant l'édition

**Collaboration**
- Co-édition en temps réel avec curseurs des autres participants
- Chat lié à chaque document, indicateur « en train d'écrire »
- Appel audio pair-à-pair (WebRTC) avec signalisation via Socket.io
- Invitation de collaborateurs par e-mail (Nodemailer / SMTP)

## Architecture

Le projet est découpé en trois services indépendants :

| Service | Rôle | Stack |
| --- | --- | --- |
| `collabwrite-api/` | API REST, authentification, e-mails | Node.js, Express, TypeScript, PostgreSQL (`pg`), Jest |
| `collabwrite-frontend/` | Interface utilisateur | React, Vite, TypeScript, Tailwind CSS, shadcn/ui, Zustand, TipTap |
| `collabwrite-realtime/` | Temps réel : édition, chat, signalisation audio | Node.js, Socket.io, WebRTC (`simple-peer`) |

Les choix techniques sont détaillés dans [CHOIX_TECHNIQUES.md](CHOIX_TECHNIQUES.md) et la liste des fonctionnalités dans [FEATURES.md](FEATURES.md).

## Compétences acquises

- **Architecture en services** : séparation API / interface / temps réel, configuration par service via `.env`, gestion du CORS entre services
- **Sécurité applicative** : hachage des mots de passe (bcrypt), JWT access/refresh, révocation de sessions, 2FA TOTP, contrôle d'accès par rôle, validation des entrées (`express-validator`)
- **Temps réel** : salles Socket.io par document, diffusion des modifications avec numéro de version et resynchronisation à l'arrivée d'un participant
- **WebRTC** : échange d'offres, réponses et candidats ICE pour établir un appel audio pair-à-pair
- **Base de données** : modélisation PostgreSQL, script d'initialisation SQL exécuté au démarrage du conteneur
- **Conteneurisation** : Docker Compose (PostgreSQL + API) avec healthchecks
- **Tests et CI** : tests unitaires Jest (utilitaires JWT/bcrypt/TOTP, middleware d'authentification, service d'authentification) exécutés par GitHub Actions à chaque push

## Lancer le projet en local

Prérequis : Node.js 18 ou plus récent, npm, Docker.

### 1. Variables d'environnement

Copier chaque fichier `env.example` en `.env` :

```bash
cp collabwrite-api/env.example collabwrite-api/.env
cp collabwrite-frontend/env.example collabwrite-frontend/.env
cp collabwrite-realtime/env.example collabwrite-realtime/.env
```

Dans `collabwrite-api/.env`, renseigner au minimum :
- les variables `POSTGRES_*` (ou `DATABASE_URL`)
- `JWT_SECRET` et `JWT_REFRESH_SECRET` (valeurs longues et aléatoires)
- `FRONTEND_URL` (par défaut `http://localhost:5173`)
- le compte administrateur créé au démarrage : `DEFAULT_ADMIN_EMAIL`, `DEFAULT_ADMIN_PASSWORD`, `DEFAULT_ADMIN_NAME`
- le bloc SMTP pour les invitations : `NODE_MAILER_HOST`, `NODE_MAILER_PORT`, `NODE_MAILER_SECURE`, `NODE_MAILER_USER`, `NODE_MAILER_PASSWORD`, `GMAIL_USER`

Pour Gmail, un mot de passe d'application est nécessaire : voir [tuto_cle_securite_gmail.pdf](tuto_cle_securite_gmail.pdf). L'endpoint protégé `GET /api/invite/verify-config` permet de tester la configuration SMTP.

Dans `collabwrite-frontend/.env` :

```env
VITE_API_URL=http://localhost:4000/api
VITE_REALTIME_URL=http://localhost:3001
```

### 2. Base de données et API (Docker)

```bash
cd collabwrite-api
docker compose up -d
```

PostgreSQL et l'API démarrent ; l'API écoute sur `http://localhost:4000`.

Sans Docker pour l'API (PostgreSQL déjà disponible) : `npm install && npm run dev` dans `collabwrite-api/`.

### 3. Frontend

```bash
cd collabwrite-frontend
npm install
npm run dev     # http://localhost:5173
```

### 4. Service temps réel

À lancer une fois l'API et le frontend démarrés :

```bash
cd collabwrite-realtime
npm install
npm run dev
```

### Tests

```bash
cd collabwrite-api
npm test
```
