# CollabWrite Realtime

Service de communication en temps réel pour l'application CollabWrite, gérant les WebSockets et la synchronisation collaborative en temps réel.

## 🚀 Technologies utilisées

- **Node.js** - Runtime JavaScript côté serveur
- **Express.js** - Framework web pour Node.js
- **Socket.IO** - Bibliothèque pour les WebSockets en temps réel
- **TypeScript** - Langage de programmation typé
- **Nodemon** - Outil de développement pour redémarrer automatiquement le serveur
- **ts-node** - Exécution TypeScript directe sans compilation

## 📋 Prérequis

- Node.js (version 18 ou supérieure)
- npm ou yarn

## 🛠️ Installation

1. Naviguez vers le dossier realtime :
```bash
cd collabwrite-realtime
```

2. Installez les dépendances :
```bash
npm install
```

## 🏃‍♂️ Lancement du projet

### Mode développement
```bash
npm run dev
```
Le serveur WebSocket sera accessible sur `http://localhost:3001` (port par défaut)

### Build TypeScript
```bash
npm run build
```
Compile le code TypeScript vers JavaScript dans le dossier `dist/`

### Lancement en production
```bash
npm start
```

### Tests
```bash
npm test
```

## 📁 Structure du projet

```
src/
├── sockets/    # Gestion des événements et logique WebSocket
server.ts       # Point d'entrée du serveur
```

## 🔧 Configuration

- **TypeScript** : `tsconfig.json`
- **Package** : `package.json`
- **Environment** : `.env` (à créer)

## 📝 Scripts disponibles

- `npm run dev` - Lance le serveur en mode développement avec nodemon
- `npm run build` - Compile le TypeScript vers JavaScript
- `npm start` - Lance l'application en production
- `npm test` - Exécute les tests

## 🌐 Connexion WebSocket

### URL de connexion
```
ws://localhost:3001
```

### Événements principaux

#### Côté client (Frontend)
```javascript
// Connexion au serveur
const socket = io('http://localhost:3001');

// Rejoindre un document
socket.emit('join-document', { documentId: 'doc-123', userId: 'user-456' });

// Envoyer des modifications
socket.emit('document-change', { 
  documentId: 'doc-123', 
  changes: { position: 10, text: 'nouveau texte' } 
});

// Écouter les changements d'autres utilisateurs
socket.on('document-updated', (data) => {
  console.log('Document mis à jour:', data);
});

// Écouter les utilisateurs connectés
socket.on('users-online', (users) => {
  console.log('Utilisateurs en ligne:', users);
});
```

#### Côté serveur (Realtime)
```typescript
// Événements gérés par le serveur
socket.on('join-document', handleJoinDocument);
socket.on('document-change', handleDocumentChange);
socket.on('disconnect', handleDisconnect);
```

## 🔐 Variables d'environnement

Créez un fichier `.env` à la racine du dossier realtime :

```env
PORT=3001
FRONTEND_URL=http://localhost:5173
```

## 🔄 Synchronisation en temps réel

### Fonctionnalités principales
- **Édition collaborative** : Synchronisation des modifications de texte en temps réel
- **Curseurs partagés** : Affichage des positions des autres utilisateurs
- **Présence utilisateur** : Indication des utilisateurs connectés au document
- **Gestion des conflits** : Résolution automatique des modifications simultanées
- **Historique des changements** : Suivi des modifications pour le versioning

### Architecture
```
Frontend ←→ Realtime Service ←→ API Service
    ↓              ↓                ↓
WebSocket      Socket.IO         REST API
```

## 🤝 Contribution

1. Forkez le projet
2. Créez une branche pour votre fonctionnalité (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Committez vos changements (`git commit -m 'Ajout d'une nouvelle fonctionnalité'`)
4. Poussez vers la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.
