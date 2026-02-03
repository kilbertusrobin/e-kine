export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">E-Kiné</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Votre plateforme de gestion et de suivi en kinésithérapie
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4">Plateforme</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-gray-600 hover:text-gray-900">Fonctionnalités</a></li>
              <li><a href="#" className="text-gray-600 hover:text-gray-900">Tarifs</a></li>
              <li><a href="#" className="text-gray-600 hover:text-gray-900">À propos</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-gray-600 hover:text-gray-900">Centre d'aide</a></li>
              <li><a href="#" className="text-gray-600 hover:text-gray-900">Contact</a></li>
              <li><a href="#" className="text-gray-600 hover:text-gray-900">FAQ</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4">Légal</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-gray-600 hover:text-gray-900">Mentions légales</a></li>
              <li><a href="#" className="text-gray-600 hover:text-gray-900">Confidentialité</a></li>
              <li><a href="#" className="text-gray-600 hover:text-gray-900">CGU</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-8 pt-8 text-center">
          <p className="text-gray-600 text-sm">
            © {new Date().getFullYear()} E-Kiné. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  )
}
