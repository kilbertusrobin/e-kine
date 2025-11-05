# 🏥 Kiné Booking

Plateforme de réservation pour kinésithérapeutes - permettant aux patients de réserver des rendez-vous et aux kinés de gérer leurs consultations.

## 📚 Stack Technique

- **Frontend**: Vite + React + TypeScript + Tailwind CSS
- **Backend**: NestJS
- **Database**: PostgreSQL
- **Admin DB**: pgAdmin
- **Container**: Docker + Docker Compose

## 🚀 Démarrage rapide

### Prérequis

- Node.js 20+
- Docker & Docker Compose (ou Rancher Desktop)
- npm

### Développement local (sans Docker)

#### Backend

```bash
cd backend
npm install
npm run start:dev
```

Le backend sera disponible sur `http://localhost:3001`

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

Le frontend sera disponible sur `http://localhost:5173`

### Avec Docker 🐳

Lancer toute la stack (PostgreSQL + pgAdmin + Backend + Frontend) :

```bash
docker-compose up --build
```

**Services disponibles** :
- Frontend: `http://localhost`
- Backend: `http://localhost:3001`
- pgAdmin: `http://localhost:5050`
  - Email: `admin@kine.com`
  - Password: `admin`

#### Configuration de pgAdmin (première utilisation)

Après avoir lancé Docker, connecte pgAdmin à PostgreSQL :

1. Ouvre `http://localhost:5050` et connecte-toi
2. Clic droit sur **"Servers"** → **"Register"** → **"Server"**
3. **Onglet General** :
   - Name: `Kine Booking` (ou ce que tu veux)
4. **Onglet Connection** :
   - Host: `postgres`
   - Port: `5432`
   - Maintenance database: `kine_booking`
   - Username: `kine_user`
   - Password: `kine_password`
   - ✅ Coche "Save password"
5. Clique sur **"Save"**

La base de données `kine_booking` est déjà créée et prête à l'emploi !

#### Commandes Docker utiles

```bash
# Arrêter les services
docker-compose down

# Tout supprimer (y compris les volumes/données)
docker-compose down -v

# Voir les logs
docker-compose logs -f

# Redémarrer un service spécifique
docker-compose restart backend
```

## 📁 Structure du projet

```
kine-booking/
├── backend/              # API NestJS
│   ├── src/
│   │   ├── app.controller.ts
│   │   ├── app.module.ts
│   │   ├── app.service.ts
│   │   └── main.ts
│   ├── Dockerfile
│   └── package.json
├── frontend/             # Application Vite + React
│   ├── src/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
└── docker-compose.yml
```

## 🔧 Configuration

### Variables d'environnement

**Backend** (`.env`) :
```env
PORT=3001
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=kine_user
DATABASE_PASSWORD=kine_password
DATABASE_NAME=kine_booking
FRONTEND_URL=http://localhost:5173
```

**Frontend** (`.env`) :
```env
VITE_API_URL=http://localhost:3001
```

## 🐛 Troubleshooting

### Erreur Tailwind CSS (PostCSS)

Si tu as une erreur avec Tailwind lors du `npm run dev` :

```bash
cd frontend
npm uninstall tailwindcss @tailwindcss/postcss
npm install -D tailwindcss@3.4.1 postcss autoprefixer
```

Puis vérifie que `postcss.config.js` contient :
```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

### Docker ne démarre pas

- **Vérifie que Docker Desktop (ou Rancher Desktop) est lancé**
- Sur Windows avec Rancher : assure-toi d'être en mode **dockerd** (pas containerd)
- Vérifie que les ports 80, 3001, 5432, 5050 ne sont pas déjà utilisés

## 📝 TODO

- [ ] Authentification (OAuth avec Auth0)
- [ ] Gestion des utilisateurs (kinés et patients)
- [ ] Système de réservation de rendez-vous
- [ ] Calendrier pour les kinés
- [ ] Dossiers patients
- [ ] Notifications
- [ ] Paiements en ligne

## 👥 Équipe

Projet développé par une équipe de 3 personnes.

## 📄 License

MIT
