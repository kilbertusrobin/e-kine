import { useState } from 'react'
import Header from '../components/Header'
import PageTransition from '../components/PageTransition'

export default function LoginPage() {
  const [isPractitioner, setIsPractitioner] = useState(false)

  return (
    <PageTransition>
    <div className="min-h-screen bg-page-login">
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-0 bg-white rounded-2xl shadow-xl overflow-hidden min-h-[600px]">

          {/* Partie gauche - Formulaire */}
          <div className="p-8 md:p-12 flex flex-col justify-center">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-3">
                Bon retour
              </h1>
              <p className="text-gray-600 mb-8">
                Connectez-vous pour accéder à votre espace
              </p>

          {/* Toggle Patient / Praticien */}
          <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
            <button
              onClick={() => setIsPractitioner(false)}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                !isPractitioner
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Patient
            </button>
            <button
              onClick={() => setIsPractitioner(true)}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                isPractitioner
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Praticien
            </button>
          </div>

          {/* Connexion Patient - OAuth */}
          {!isPractitioner ? (
            <div className="space-y-3">
              <button className="w-full flex items-center justify-center space-x-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="font-medium text-gray-700">Continuer avec Google</span>
              </button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Vous êtes patient ?</span>
                </div>
              </div>

              <a
                href="/register"
                className="block w-full text-center px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
              >
                Créer un compte patient
              </a>
            </div>
          ) : (
            /* Connexion Praticien - Classique */
            <form className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email professionnel
                </label>
                <input
                  type="email"
                  id="email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none"
                  placeholder="votre@email.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Mot de passe
                </label>
                <input
                  type="password"
                  id="password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none"
                  placeholder="••••••••"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-600" />
                  <span className="ml-2 text-sm text-gray-600">Se souvenir de moi</span>
                </label>
                <a href="/forgot-password" className="text-sm text-primary-600 hover:text-blue-700">
                  Mot de passe oublié ?
                </a>
              </div>

              <button
                type="submit"
                className="w-full px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
              >
                Se connecter
              </button>

              <p className="text-center text-sm text-gray-600 mt-6">
                Nouveau praticien ? Contactez votre administrateur pour obtenir vos identifiants.
              </p>
            </form>
          )}
            </div>
          </div>

          {/* Partie droite - Visuel */}
          <div className="hidden md:flex bg-gradient-to-br from-primary-500 to-primary-700 p-12 flex-col justify-center text-white relative overflow-hidden">
            {/* Pattern de fond */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
              <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/3 translate-y-1/3"></div>
            </div>

            <div className="relative z-10">
              <svg className="w-16 h-16 mb-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>

              <h2 className="text-3xl font-bold mb-4">
                Votre suivi santé en toute sécurité
              </h2>
              <p className="text-primary-100 text-lg mb-8">
                Accédez à vos rendez-vous, suivez vos progrès et communiquez facilement avec votre kinésithérapeute.
              </p>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <svg className="w-6 h-6 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <p className="font-medium">Données sécurisées</p>
                    <p className="text-primary-100 text-sm">Vos informations médicales protégées</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <svg className="w-6 h-6 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <p className="font-medium">Suivi en temps réel</p>
                    <p className="text-primary-100 text-sm">Visualisez votre évolution</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <svg className="w-6 h-6 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <p className="font-medium">Communication facilitée</p>
                    <p className="text-primary-100 text-sm">Échangez avec votre praticien</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-sm text-gray-600 mt-6">
          En vous connectant, vous acceptez nos{' '}
          <a href="/terms" className="text-primary-600 hover:text-blue-700">
            conditions d'utilisation
          </a>{' '}
          et notre{' '}
          <a href="/privacy" className="text-primary-600 hover:text-blue-700">
            politique de confidentialité
          </a>
        </p>
      </div>
    </div>
    </PageTransition>
  )
}
