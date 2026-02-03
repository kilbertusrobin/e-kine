# E-Kine

Plateforme de prise de rendez-vous en ligne pour kinésithérapeutes. Les patients peuvent facilement réserver des créneaux avec leurs praticiens, gérer leurs ordonnances et recevoir des rappels automatiques.

## Stack Technique

| Composant | Technologies |
|-----------|--------------|
| **Frontend** | React + TypeScript + Vite + TailwindCSS |
| **Backend** | NestJS + TypeScript + TypeORM |
| **Base de données** | PostgreSQL 16 |
| **Authentification** | Google OAuth 2.0 + JWT |
| **Emails** | Nodemailer (Mailpit en développement) |
| **Conteneurisation** | Docker + Docker Compose |

## Prérequis

- [Docker](https://docs.docker.com/get-docker/) et [Docker Compose](https://docs.docker.com/compose/install/)
- [Git](https://git-scm.com/)

## Installation

```bash
# Cloner le repository
git clone https://github.com/kilbertusrobin/e-kine.git

# Se placer dans le dossier
cd e-kine

# Lancer l'application
docker compose up -d --build
```

## Accès aux services

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:5173 | Interface utilisateur |
| **API** | http://localhost:3001/api/ | Documentation Swagger |
| **pgAdmin** | http://localhost:5050 | Administration de la BDD |
| **Mailpit** | http://localhost:8025 | Interface emails (dev) |

### Identifiants pgAdmin

- **Email** : admin@kine.com
- **Mot de passe** : admin

## Fonctionnalités

### Patients
- Connexion via Google
- Prise de rendez-vous avec choix du praticien et du type de soin
- Visualisation et annulation des rendez-vous
- Upload d'ordonnances (PDF)
- Réception d'emails de confirmation et rappels

### Praticiens
- Tableau de bord des rendez-vous
- Gestion des types de soins proposés
- Configuration du profil professionnel
- Notifications email pour les nouveaux rendez-vous

## Structure du Projet

```
e-kine/
├── backend/          # API NestJS
├── frontend/         # Application React
├── bruno/            # Collection de requêtes API (Bruno)
├── pgadmin/          # Configuration pgAdmin
├── docker-compose.yml
└── README.md
```

## Règles Métier

- **Créneaux** : 30 minutes
- **Horaires** : 9h-13h et 14h-17h
- **Jours ouvrés** : Lundi au Vendredi
- **Rappels** : Email automatique J-1 à 18h

## Diagrammes d'Architecture

Des diagrammes PlantUML sont disponibles à la racine du projet pour documenter l'architecture :

| Fichier | Description |
|---------|-------------|
| `C4_1_Contexte.txt` | Diagramme C4 - Niveau Contexte |
| `C4_2_Conteneurs.txt` | Diagramme C4 - Niveau Conteneurs |
| `C4_3_Composants.txt` | Diagramme C4 - Niveau Composants |
| `DDD_1_BoundedContexts.txt` | Diagramme DDD - Bounded Contexts |
| `DDD_2_ModeleDomaine.txt` | Diagramme DDD - Modèle de Domaine |

Pour visualiser ces diagrammes, copier-coller leur contenu sur : https://www.planttext.com/

## Documentation

| Document | Description |
|----------|-------------|
| [Manuel Utilisateur](./docs/MANUEL_UTILISATEUR.md) | Guide d'utilisation pour patients et praticiens |
| [Design Patterns](./docs/DESIGN_PATTERNS.md) | Patterns de conception utilisés (Singleton, Decorator, Strategy) |
| [Documentation Backend](./backend/README.md) | API, endpoints, configuration technique |
| [Documentation Frontend](./frontend/README.md) | Composants, architecture frontend |

## Commandes Utiles

```bash
# Arrêter les conteneurs
docker compose down

# Voir les logs
docker compose logs -f

# Reconstruire un service spécifique
docker compose up -d --build backend

# Accéder à la base de données
docker exec -it kine-postgres psql -U postgres -d ekine
```

## Équipe

Projet réalisé dans le cadre de la formation Ynov.
