## Fonctionnalités — CollabWrite

Légende: ✅ disponible

### Authentification
- ✅ Inscription avec email/mot de passe
- ✅ Connexion avec JWT (access + refresh)
- ✅ Déconnexion (révocation de session/refresh)
- ✅ Profil: mise à jour email/nom
- ✅ Changement de mot de passe
- ✅ 2FA (TOTP) activation/désactivation

### Documents
- ✅ Création de document texte, image et PDF
- ✅ Lecture/affichage d’un document texte, image et PDF
- ✅ Mise à jour/édition d’un document texte, image et PDF
- ✅ Suppression de document texte, image et PDF
- ✅ Enregistrement automatique tous les x secondes
- ✅ Co‑édition temps réel texte (OT/CRDT) avec modification simultané pour le travail collaboratif + Cursor visible

### Dossiers
- ✅ Création de dossier et sous dossiers
- ✅ Liste/affichage des dossiers
- ✅ Renommage d’un dossier
- ✅ Suppression d’un dossier
- ✅ Déplacement de fichiers entre dossiers

### Sauvegarde et persistance
- ✅ Base Postgres (Docker)
- ✅ Init DB via script SQL au démarrage
- ✅ Sessions (refresh tokens) en base
- ✅ Sauvegarde automatique pour édition document

### Invitations et e‑mail
- ✅ Invitation par e‑mail à collaborer sur un document
- ✅ Configuration SMTP (Gmail/Mailtrap/SMTP classique)
- ✅ Endpoint de vérification SMTP

### Chat et messages
- ✅ Chat contextuel lié au document (API/routes/messages)
- ✅ Chat en temps réel via socket

### Audio / WebRTC
- ✅ Appel audio P2P (WebRTC) basique
- ✅ Contrôles audio (mute, connexion, statut)
- ✅ Signalisation via Socket.io (service realtime)

### Administration
- ✅ Compte admin par défaut (variables .env)
- ✅ Page tableau de bord admin
- ✅ Gestion des rôles/permissions et blocage des compte utilisateurs

### CI/CD et Qualité
- ✅ Tests unitaires (Jest) sur l’API (utils, auth middleware, service auth)
- ✅ GitHub Actions: tests sur main/develop/feat/tests


