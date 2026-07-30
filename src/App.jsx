import { useEffect } from 'react'
import { BrowserRouter, HashRouter, Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import AboutPage from './pages/AboutPage'
import ProjectsPage from './pages/ProjectsPage'
import StrengthsPage from './pages/StrengthsPage'
import ContactPage from './pages/ContactPage'
import ResumePage from './pages/ResumePage'
import CertificatePage from './pages/CertificatePage'

export default function App() {
  const Router = window.location.protocol === 'file:' ? HashRouter : BrowserRouter

  return (
    <Router>
      <AnimatedApp />
    </Router>
  )
}

function AnimatedApp() {
  const location = useLocation()

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [location.pathname])

  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => { entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('animate-in') }) },
      { threshold: 0.1, rootMargin: '0px 0px -20px 0px' }
    )
    const targets = document.querySelectorAll('[data-animate]')
    targets.forEach(el => {
      el.classList.remove('animate-in')
      obs.observe(el)
    })
    return () => obs.disconnect()
  }, [location.pathname])

  return (
    <>
      <Navbar />
      <main key={location.pathname} className="page-enter">
        <Routes location={location}>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/strengths" element={<StrengthsPage />} />
          <Route path="/certificates/:slug" element={<CertificatePage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/resume" element={<ResumePage />} />
        </Routes>
      </main>
    </>
  )
}
