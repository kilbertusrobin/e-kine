#!/bin/bash

echo "🏥 Kiné Booking - Setup Script"
echo "================================"
echo ""

# Check if docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé. Installe Docker d'abord."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose n'est pas installé. Installe Docker Compose d'abord."
    exit 1
fi

echo "✅ Docker et Docker Compose détectés"
echo ""

# Ask user what they want to do
echo "Que veux-tu faire ?"
echo "1) Développement local (sans Docker)"
echo "2) Lancer avec Docker"
echo ""
read -p "Choix (1 ou 2): " choice

case $choice in
    1)
        echo ""
        echo "📦 Installation des dépendances..."
        
        cd backend
        echo "Backend..."
        npm install
        cd ..
        
        cd frontend
        echo "Frontend..."
        npm install
        cd ..
        
        echo ""
        echo "✅ Installation terminée!"
        echo ""
        echo "Pour lancer le projet :"
        echo "Terminal 1: cd backend && npm run start:dev"
        echo "Terminal 2: cd frontend && npm run dev"
        echo ""
        echo "Frontend: http://localhost:5173"
        echo "Backend: http://localhost:3001"
        ;;
    
    2)
        echo ""
        echo "🐳 Lancement avec Docker..."
        echo ""
        docker-compose up --build
        ;;
    
    *)
        echo "❌ Choix invalide"
        exit 1
        ;;
esac
