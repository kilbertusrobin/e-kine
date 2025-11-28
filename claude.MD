# E-Kiné - Contexte du projet

## Vue d'ensemble
Plateforme web de type Doctissimo pour un cabinet de kinésithérapie.

## Stack technique
- **Frontend**: Vite + React + TypeScript + Tailwind CSS (port 5173 en dev)
- **Backend**: NestJS (port 3001) - développé par quelqu'un d'autre
- **Base de données**: PostgreSQL
- **Conteneurisation**: Docker + Docker Compose

## Fonctionnalités principales
1. Demande de rendez-vous
2. Suivi patient
3. Statistiques d'amélioration
4. Notes sur les patients
5. Gestion du calendrier (pour les kinés)
6. Dossiers patients

## Responsabilités
- **Focus développement**: Frontend uniquement
- **Backend**: développé par une autre personne de l'équipe

## Directives de design
### À faire
- Design médical moderne et professionnel
- Interface clean et épurée
- Couleurs neutres et apaisantes (blancs, gris, bleus professionnels)
- Typographie claire et lisible
- Call-to-action clairs et directs
- Design rassurant et de confiance
- Split-screen pour les pages auth (formulaire + visuel)
- Transitions fluides entre les pages
- Dégradés subtils pour différencier les pages

### À éviter
- Emojis
- Couleurs farfelues ou trop vives
- Dégradés criards
- Tout ce qui fait "AI-generated" ou amateur
- Surcharge visuelle

## Design System
### Palette de couleurs (Tailwind)
- **Primary** (Bleu médical): `primary-600` (#2563EB)
- **Accent** (Indigo): `accent-600` (#4F46E5)
- **Secondary** (Cyan): `secondary-600` (#0891B2)
- **Neutral** (Gris): `neutral-50` à `neutral-900`

Voir `frontend/DESIGN_SYSTEM.md` pour la documentation complète

### Pages Login/Register
- **Login**: Background `bg-page-login`, panneau droit `from-primary-500 to-primary-700`
- **Register**: Background `bg-page-register`, panneau gauche `from-accent-600 via-primary-600 to-secondary-600`
- Layout split-screen 50/50 sur desktop
- Mobile: formulaire uniquement, panneau visuel caché

### Transitions
- Login: slide depuis la droite (translate-x-full)
- Register: slide depuis la gauche (-translate-x-full)
- Durée: 700ms ease-out

## Références de style
- Doctolib (référence française pour les RDV médicaux)
- Maiia
- Sites médicaux professionnels modernes

## État actuel
- Homepage professionnelle créée avec composants modulaires
- Configuration Docker dev/prod avec hot reload
- Structure de composants mise en place
- Pages Login et Register avec design split-screen
- Transitions fluides entre les pages
- Header sticky

## Architecture Frontend
```
frontend/src/
├── components/
│   ├── Header.tsx          - Navigation sticky avec CTA
│   ├── Hero.tsx            - Section principale
│   ├── Features.tsx        - Grille de fonctionnalités
│   ├── CTA.tsx             - Call-to-action
│   ├── Footer.tsx          - Footer avec liens
│   └── PageTransition.tsx  - Animations entre pages
├── pages/
│   ├── Homepage.tsx        - Page d'accueil
│   ├── LoginPage.tsx       - Connexion (OAuth patients / classique praticiens)
│   └── RegisterPage.tsx    - Inscription (OAuth patients / formulaire praticiens)
└── App.tsx                 - Router principal

## Docker Setup
### Fichiers
- `Dockerfile.development` - Dev avec Vite hot reload
- `Dockerfile.production` - Prod avec nginx
- `.env.development` - Config dev
- `.env.production` - Config prod
- `docker-compose.override.yml` - Volumes pour hot reload

### Commandes rapides
- `switch-env.bat dev` - Passer en mode dev
- `switch-env.bat prod` - Passer en mode prod
- `docker-compose up -d --build` - Lancer/rebuild

### Ports
- Dev: http://localhost:5173 (Vite)
- Prod: http://localhost (nginx)
- Backend: http://localhost:3001
```

## Équipe
Projet développé par une équipe de 3 personnes
