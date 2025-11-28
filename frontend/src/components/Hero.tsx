export default function Hero() {
  return (
    <section className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <h2 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Votre suivi kiné, simplifié
          </h2>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Une plateforme complète pour la gestion de vos rendez-vous,
            le suivi de vos progrès et la communication avec votre kinésithérapeute.
          </p>
          <div className="flex space-x-4">
            <a href="/register" className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors text-lg font-medium">
              Créer un compte
            </a>
            <a href="#fonctionnalites" className="bg-gray-100 text-gray-900 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors text-lg font-medium">
              En savoir plus
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
