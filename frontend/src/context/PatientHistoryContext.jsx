import { createContext, useContext, useState, useEffect } from 'react'

const PatientHistoryContext = createContext(null)

export function PatientHistoryProvider({ children }) {
  // Initialize state from localStorage or empty array
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('drsp_patient_history')
      return saved ? JSON.parse(saved) : []
    } catch (e) {
      return []
    }
  })

  // Sync state changes back to localStorage
  useEffect(() => {
    localStorage.setItem('drsp_patient_history', JSON.stringify(history))
  }, [history])

  function addEntry(entry) {
    setHistory(prev => {
      const newHistory = [
        {
          id: Date.now(),
          timestamp: new Date().toISOString(),
          ...entry,
        },
        ...prev,
      ]
      // Limit to 100 entries to prevent localStorage quota issues
      return newHistory.slice(0, 100)
    })
  }

  function clearHistory() {
    setHistory([])
    localStorage.removeItem('drsp_patient_history')
  }

  return (
    <PatientHistoryContext.Provider value={{ history, addEntry, clearHistory }}>
      {children}
    </PatientHistoryContext.Provider>
  )
}

export function usePatientHistory() {
  const ctx = useContext(PatientHistoryContext)
  if (!ctx) throw new Error('usePatientHistory must be used within PatientHistoryProvider')
  return ctx
}
