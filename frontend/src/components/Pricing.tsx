export default function Pricing() {
  return (
    <section id="tarifs" className="bg-gray-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Tarifs simples et transparents
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Aucun frais caché, annulez à tout moment
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Plan Patient */}
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-8">
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Patient</h3>
              <div className="flex items-baseline">
                <span className="text-5xl font-bold text-gray-900">Gratuit</span>
              </div>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-start">
                <svg className="w-6 h-6 text-primary-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-600">Prise de rendez-vous en ligne</span>
              </li>
              <li className="flex items-start">
                <svg className="w-6 h-6 text-primary-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-600">Accès à votre dossier médical</span>
              </li>
              <li className="flex items-start">
                <svg className="w-6 h-6 text-primary-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-600">Suivi de vos progrès</span>
              </li>
              <li className="flex items-start">
                <svg className="w-6 h-6 text-primary-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-600">Messagerie sécurisée</span>
              </li>
              <li className="flex items-start">
                <svg className="w-6 h-6 text-primary-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-600">Rappels automatiques</span>
              </li>
            </ul>

            <a
              href="/register"
              className="block w-full text-center px-6 py-3 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Créer un compte
            </a>
          </div>

          {/* Plan Praticien */}
          <div className="bg-primary-600 text-white rounded-2xl border-2 border-primary-600 p-8 relative">
            <div className="absolute top-0 right-8 transform -translate-y-1/2">
              <span className="bg-accent-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                Populaire
              </span>
            </div>

            <div className="mb-8">
              <h3 className="text-2xl font-bold mb-2">Praticien</h3>
              <div className="flex items-baseline">
                <span className="text-5xl font-bold">Sur mesure</span>
              </div>
              <p className="text-primary-100 mt-2">Contactez-nous pour un devis personnalisé</p>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-start">
                <svg className="w-6 h-6 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Tout du plan Patient</span>
              </li>
              <li className="flex items-start">
                <svg className="w-6 h-6 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Gestion d'agenda intégrée</span>
              </li>
              <li className="flex items-start">
                <svg className="w-6 h-6 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Dossiers patients complets</span>
              </li>
              <li className="flex items-start">
                <svg className="w-6 h-6 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Statistiques et analyses</span>
              </li>
              <li className="flex items-start">
                <svg className="w-6 h-6 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Support prioritaire</span>
              </li>
            </ul>

            <a
              href="#contact"
              className="block w-full text-center px-6 py-3 bg-white text-primary-600 rounded-lg hover:bg-gray-100 transition-colors font-medium"
            >
              Nous contacter
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
