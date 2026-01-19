export default function CTA() {
  return (
    <section className="bg-primary-600 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">
          Prêt à commencer votre suivi ?
        </h2>
        <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
          Connectez-vous pour accéder à toutes les fonctionnalités
        </p>
        <div className="flex justify-center">
          <a href="/login" className="bg-white text-primary-600 px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors text-lg font-medium shadow-lg hover:shadow-xl">
            Se connecter
          </a>
        </div>
      </div>
    </section>
  )
}
