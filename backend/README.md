# E-Kine Backend

API REST pour la plateforme de prise de rendez-vous E-Kine, permettant aux patients de prendre rendez-vous avec des kinésithérapeutes.

## Stack Technique

- **Framework** : NestJS (Node.js + TypeScript)
- **Base de données** : PostgreSQL + TypeORM
- **Authentification** : Google OAuth 2.0 + JWT
- **Documentation API** : Swagger (OpenAPI)
- **Emails** : Nodemailer (Mailpit en développement)
- **Tests** : Jest

## Fonctionnalités

| Module | Description |
|--------|-------------|
| **Auth** | Authentification Google OAuth, gestion des tokens JWT |
| **Users** | Gestion des utilisateurs (patients et praticiens) |
| **Profiles** | Profils utilisateurs (nom, adresse, téléphone...) |
| **Appointments** | Prise de rendez-vous avec validation des créneaux |
| **Care Types** | Types de soins proposés par les praticiens |
| **Prescriptions** | Gestion des ordonnances (upload PDF) |
| **Mail** | Notifications email (confirmation, annulation, rappels) |
| **Scheduler** | Tâches planifiées (rappels J-1 à 18h) |

## Prérequis

- Node.js >= 18
- Docker & Docker Compose
- Compte Google Cloud (pour OAuth)

## Installation

```bash
# Cloner le repository
git clone <repository-url>
cd backend

# Installer les dépendances
npm install

# Copier le fichier d'environnement
cp .env.example .env
```

## Configuration

Créer un fichier `.env` à la racine du projet :

```env
# Base de données
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=ekine
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=1h

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

# Frontend
FRONTEND_URL=http://localhost:5173

# Emails (Mailpit en dev)
MAIL_HOST=localhost
MAIL_PORT=1025
MAIL_FROM=noreply@e-kine.fr
```

## Lancement

### Avec Docker (recommandé)

```bash
# Démarrer tous les services (PostgreSQL, pgAdmin, Mailpit)
docker-compose up -d

# Démarrer l'API en mode développement
npm run start:dev
```

### Services Docker

| Service | URL | Description |
|---------|-----|-------------|
| PostgreSQL | `localhost:5432` | Base de données |
| pgAdmin | `http://localhost:5050` | Interface admin BDD |
| Mailpit | `http://localhost:8025` | Interface emails (dev) |

### Sans Docker

```bash
# Démarrer en mode développement
npm run start:dev

# Démarrer en mode production
npm run build
npm run start:prod
```

## Documentation API

Une fois l'application lancée, la documentation Swagger est disponible :

**http://localhost:3000/api**

Elle permet de :
- Visualiser tous les endpoints
- Tester les requêtes directement
- Voir les schémas de données

## Structure du Projet

```
src/
├── config/                    # Configuration (TypeORM, whitelist)
├── routes/
│   ├── appointments/          # Module rendez-vous
│   │   ├── dtos/              # Data Transfer Objects
│   │   ├── entities/          # Entités TypeORM
│   │   ├── enums/             # Énumérations
│   │   ├── appointments.controller.ts
│   │   ├── appointments.service.ts
│   │   └── appointments.module.ts
│   ├── auth/                  # Authentification
│   │   ├── decorators/        # @CurrentUser, @Roles
│   │   ├── guards/            # JwtAuthGuard, RolesGuard
│   │   ├── strategies/        # Google, JWT strategies
│   │   └── ...
│   ├── care-types/            # Types de soins
│   ├── mail/                  # Service d'emails
│   ├── prescriptions/         # Ordonnances
│   ├── profiles/              # Profils utilisateurs
│   ├── scheduler/             # Tâches planifiées
│   ├── sessions/              # Sessions utilisateur
│   └── users/                 # Utilisateurs
├── types/                     # Types TypeScript
├── app.module.ts              # Module racine
└── main.ts                    # Point d'entrée
```

## Endpoints Principaux

### Authentification (`/auth`)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/auth/google` | Connexion via Google |
| POST | `/auth/refresh` | Rafraîchir le token |
| POST | `/auth/logout` | Déconnexion |
| GET | `/auth/me` | Utilisateur connecté |

### Rendez-vous (`/appointments`)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/appointments` | Liste des RDV |
| POST | `/appointments` | Créer un RDV |
| GET | `/appointments/:id` | Détail d'un RDV |
| DELETE | `/appointments/:id` | Annuler un RDV |
| GET | `/appointments/practitioner/:id/slots` | Créneaux disponibles |

### Types de soins (`/care-types`)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/care-types` | Liste des types de soins |
| GET | `/care-types/me` | Mes types de soins |
| PUT | `/care-types/me` | Modifier mes types de soins |

### Profils (`/profiles`)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/profiles/me` | Mon profil |
| PUT | `/profiles/me` | Modifier mon profil |

## Règles Métier - Rendez-vous

- **Créneaux** : 30 minutes
- **Horaires** : 9h-13h et 14h-17h
- **Jours** : Lundi au Vendredi (pas de weekend)
- **Statuts** : `confirmed`, `cancelled`, `completed`
- **Emails** : Confirmation au patient et praticien, rappel J-1 à 18h

## Tests

```bash
# Tests unitaires
npm run test

# Tests avec couverture
npm run test:cov

# Tests en mode watch
npm run test:watch
```

### Couverture actuelle : ~42%

| Service | Couverture |
|---------|------------|
| mail.service.ts | 100% |
| care-types.service.ts | 100% |
| profiles.service.ts | 100% |
| auth.service.ts | 95% |
| appointments.service.ts | 74% |

## Rôles Utilisateurs

| Rôle | Description |
|------|-------------|
| `PATIENT` | Peut prendre des RDV, gérer ses ordonnances |
| `PRACTITIONER` | Peut voir ses RDV, définir ses types de soins |

Le rôle est déterminé automatiquement à l'inscription selon une whitelist d'emails praticiens.

## Emails

En développement, les emails sont capturés par **Mailpit** :
- Interface web : http://localhost:8025
- SMTP : localhost:1025

Types d'emails envoyés :
- Confirmation de RDV (patient)
- Nouveau RDV (praticien)
- Annulation de RDV
- Rappel J-1

## Base de Données

### Schéma principal

```
users (1) ──── (1) profiles
  │
  │ (N)
  ▼
appointments (N) ──── (1) care_types
  │
  │ (N)
  ▼
prescriptions

users (N) ──── (N) care_types (praticiens uniquement)
```

### Migrations

```bash
# Générer une migration
npm run migration:generate -- src/migrations/NomMigration

# Exécuter les migrations
npm run migration:run

# Annuler la dernière migration
npm run migration:revert
```

## Scripts Disponibles

| Script | Description |
|--------|-------------|
| `npm run start:dev` | Démarre en mode développement (watch) |
| `npm run start:prod` | Démarre en mode production |
| `npm run build` | Compile le projet |
| `npm run test` | Lance les tests unitaires |
| `npm run test:cov` | Lance les tests avec couverture |
| `npm run lint` | Vérifie le code avec ESLint |
| `npm run format` | Formate le code avec Prettier |

## Variables d'Environnement

| Variable | Description | Défaut |
|----------|-------------|--------|
| `DATABASE_HOST` | Hôte PostgreSQL | localhost |
| `DATABASE_PORT` | Port PostgreSQL | 5432 |
| `DATABASE_NAME` | Nom de la BDD | ekine |
| `DATABASE_USER` | Utilisateur BDD | postgres |
| `DATABASE_PASSWORD` | Mot de passe BDD | - |
| `JWT_SECRET` | Clé secrète JWT | - |
| `JWT_EXPIRES_IN` | Durée de validité JWT | 1h |
| `GOOGLE_CLIENT_ID` | Client ID Google OAuth | - |
| `GOOGLE_CLIENT_SECRET` | Secret Google OAuth | - |
| `GOOGLE_CALLBACK_URL` | URL callback Google | - |
| `FRONTEND_URL` | URL du frontend | http://localhost:5173 |
| `MAIL_HOST` | Hôte SMTP | localhost |
| `MAIL_PORT` | Port SMTP | 1025 |
| `MAIL_FROM` | Email expéditeur | noreply@e-kine.fr |
