import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Sidebar from './components/Sidebar'
import Landing from './pages/Landing'
import Predict from './pages/Predict'
import Results from './pages/Results'
import Intelligence from './pages/Intelligence'
import History from './pages/History'
import { PatientHistoryProvider } from './context/PatientHistoryContext'

import { useState, useEffect } from 'react'

const pageVariants = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.28, ease: 'easeOut' } },
  exit: { opacity: 0, x: -40, transition: { duration: 0.28, ease: 'easeIn' } }
}

function PageFlash() {
  const location = useLocation()
  const [show, setShow] = useState(false)

  useEffect(() => {
    // Trigger flash on location change
    setShow(true)
    const t = setTimeout(() => setShow(false), 300)
    return () => clearTimeout(t)
  }, [location.pathname])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ left: '-100%' }}
          animate={{ left: '100%' }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: 'linear' }}
          className="fixed top-1/2 w-full h-[2px] bg-primary z-[9999] pointer-events-none"
          style={{ transform: 'translateY(-50%)' }}
        />
      )}
    </AnimatePresence>
  )
}

function AnimatedRoutes() {
  const location = useLocation()
  const isLanding = location.pathname === '/'

  return (
    <div className="flex min-h-screen bg-background">
      {/* Grain overlay */}
      <div className="grain-overlay" aria-hidden="true" />
      <PageFlash />

      {/* Sidebar — hidden on landing */}
      {!isLanding && <Sidebar />}

      {/* Page content */}
      <main className={`flex-1 ${!isLanding ? 'ml-[64px]' : ''} min-h-screen`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="min-h-screen"
          >
            <Routes location={location}>
              <Route path="/" element={<Landing />} />
              <Route path="/predict" element={<Predict />} />
              <Route path="/results" element={<Results />} />
              <Route path="/intelligence" element={<Intelligence />} />
              <Route path="/history" element={<History />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <PatientHistoryProvider>
      <BrowserRouter>
        <AnimatedRoutes />
      </BrowserRouter>
    </PatientHistoryProvider>
  )
}
