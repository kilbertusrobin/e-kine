import { useLocation } from 'react-router-dom'

export default function Header() {
  const location = useLocation()
  const isHomepage = location.pathname === '/'

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (isHomepage) {
      e.preventDefault()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <a
              href="/"
              onClick={handleLogoClick}
              className="text-2xl font-semibold text-gray-900 hover:text-gray-700 transition-colors"
            >
              E-Kiné
            </a>
          </div>

          <nav className="hidden md:flex space-x-8">
            <a href="#fonctionnalites" className="text-gray-600 hover:text-gray-900 transition-colors">
              Fonctionnalités
            </a>
            <a href="#a-propos" className="text-gray-600 hover:text-gray-900 transition-colors">
              À propos
            </a>
            <a href="#tarifs" className="text-gray-600 hover:text-gray-900 transition-colors">
              Tarifs
            </a>
            <a href="#contact" className="text-gray-600 hover:text-gray-900 transition-colors">
              Contact
            </a>
          </nav>

          <div className="flex items-center space-x-3">
            <a href="/login" className="text-gray-700 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium">
              Connexion
            </a>
            <a href="/register" className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors font-medium">
              Créer un compte
            </a>
          </div>
        </div>
      </div>
    </header>
  )
}
