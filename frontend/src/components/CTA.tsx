export default function CTA() {
  return (
    <section className="bg-primary-600 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">
          Prêt à commencer votre suivi ?
        </h2>
        <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
          Créez votre compte gratuitement et accédez à toutes les fonctionnalités
        </p>
        <div className="flex justify-center space-x-4">
          <a href="/register" className="bg-white text-primary-600 px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors text-lg font-medium">
            Créer un compte
          </a>
          <a href="/login" className="bg-primary-700 text-white px-8 py-3 rounded-lg hover:bg-primary-800 transition-colors text-lg font-medium border border-primary-500">
            Se connecter
          </a>
        </div>
      </div>
    </section>
  )
}
