# CollabWrite API

API backend de l'application CollabWrite, une application de rédaction collaborative en temps réel construite avec Node.js, Express et TypeScript.

## 🚀 Technologies utilisées

- **Node.js** - Runtime JavaScript côté serveur
- **Express.js** - Framework web pour Node.js
- **TypeScript** - Langage de programmation typé
- **Nodemon** - Outil de développement pour redémarrer automatiquement le serveur
- **ts-node** - Exécution TypeScript directe sans compilation

## 📋 Prérequis

- Node.js (version 18 ou supérieure)
- npm ou yarn

## 🛠️ Installation
Vérifier que vous avez Docker Desktop installé sur votre ordinateur.

Ensuite, pour tous installé, faites la commande suivante :
```
docker compose up -d
```

Une fois fait, allez sur l'URL suivant pour voir si l'api est bien en cours d'exécution :
```
http://localhost:3000
```

## 📁 Structure du projet

```
src/
├── __tests__/      # fichiers de test pour vérifier le bon fonctionnement de l'application lors des push et pull requests
├── controllers/    # Contrôleurs pour gérer les requêtes
├── models/         # Modèles de données
├── routes/         # Définition des routes API
├── middleware/     # Middlewares personnalisés
├── utils/          # Fonctions utilitaires
├── types/          # Définitions TypeScript
├── config/         # Configuration de l'application
├── app.ts          # Configuration Express
└── server.ts       # Point d'entrée du serveur
```

## 🔧 Configuration

- **TypeScript** : `tsconfig.json`
- **Package** : `package.json`
- **Docker** : `docker-compose.yml`
- **Environment** : `.env` (à créer)

## 📝 Scripts disponibles

- `npm run dev` - Lance le serveur en mode développement avec nodemon
- `npm run build` - Compile le TypeScript vers JavaScript
- `npm start` - Lance l'application en production
- `npm test` - Exécute les tests

## 🌐 Endpoints API

### Base URL
```
http://localhost:3000/api
```

### Routes principales
- `GET /api/health` - Vérification de l'état du serveur
- `POST /api/documents` - Créer un nouveau document
- `GET /api/documents/:id` - Récupérer un document
- `PUT /api/documents/:id` - Mettre à jour un document
- `DELETE /api/documents/:id` - Supprimer un document

## 🔐 Variables d'environnement

Créez un fichier `.env` à la racine du dossier API en reprenant le fichier `env.example` :

## 🤝 Contribution

1. Forkez le projet
2. Créez une branche pour votre fonctionnalité (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Committez vos changements (`git commit -m 'Ajout d'une nouvelle fonctionnalité'`)
4. Poussez vers la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.
