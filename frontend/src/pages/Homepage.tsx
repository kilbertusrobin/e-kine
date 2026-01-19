import Header from '../components/Header'
import Hero from '../components/Hero'
import Features from '../components/Features'
import About from '../components/About'
import Contact from '../components/Contact'
import CTA from '../components/CTA'
import Footer from '../components/Footer'
import PageTransition from '../components/PageTransition'

export default function Homepage() {
  return (
    <PageTransition>
      <div className="min-h-screen bg-white">
        <Header />
        <Hero />
        <Features />
        <About />
        <CTA />
        <Contact />
        <Footer />
      </div>
    </PageTransition>
  )
}
