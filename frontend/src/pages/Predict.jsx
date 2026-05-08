import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { usePatientHistory } from '../context/PatientHistoryContext'
import axios from 'axios'
import TypewriterLoading from '../components/TypewriterLoading'
import { useCallback, useEffect } from 'react'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'



const SMOKING_OPTIONS = [
  { value: 'never', label: 'Never' },
  { value: 'former', label: 'Former' },
  { value: 'current', label: 'Current' },
  { value: 'ever', label: 'Ever' },
  { value: 'not current', label: 'Not Current' },
  { value: 'unknown', label: 'Unknown' },
]

function getBmiStatus(bmi) {
  const v = parseFloat(bmi)
  if (!v) return null
  if (v < 18.5) return { color: '#F59E0B', label: 'Underweight' }
  if (v < 25) return { color: '#10B981', label: 'Normal' }
  if (v < 30) return { color: '#F59E0B', label: 'Overweight' }
  return { color: '#EF4444', label: 'Obese' }
}

function getGlucoseStatus(gl) {
  const v = parseFloat(gl)
  if (!v) return null
  if (v < 100) return { color: '#10B981', label: 'Normal' }
  if (v < 126) return { color: '#F59E0B', label: 'Pre-diabetic' }
  return { color: '#EF4444', label: 'Diabetic range' }
}

function getHbA1cStatus(h) {
  const v = parseFloat(h)
  if (!v) return null
  if (v < 5.7) return { color: '#10B981', label: 'Normal' }
  if (v < 6.5) return { color: '#F59E0B', label: 'Pre-diabetic' }
  return { color: '#EF4444', label: 'Diabetic range' }
}

function FieldIndicator({ status }) {
  if (!status) return null
  return (
    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-1.5">
      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: status.color }} />
      <span className="font-mono-dm text-[10px] tracking-widest" style={{ color: status.color }}>{status.label}</span>
    </motion.div>
  )
}

function SectionLabel({ children }) {
  return (
    <div className="flex items-center gap-4 mb-8">
      <span className="font-mono-dm text-[10px] tracking-[0.25em] text-textMuted uppercase">{children}</span>
      <div className="flex-1 h-px bg-white/[0.06]" />
    </div>
  )
}

function FormField({ label, children, hint }) {
  return (
    <div className="field-line pb-4 border-b border-white/[0.08]">
      <label className="font-grotesk text-[10px] tracking-[0.2em] text-textMuted uppercase block mb-3">{label}</label>
      {children}
      {hint && <p className="font-mono-dm text-[10px] text-textMuted mt-2">{hint}</p>}
    </div>
  )
}

export default function Predict() {
  const navigate = useNavigate()
  const { addEntry } = usePatientHistory()
  const [form, setForm] = useState({
    age: '', gender: 'male', bmi: '', hypertension: 0,
    heart_disease: 0, smoking_history: 'never', HbA1c_level: '', blood_glucose_level: '',
  })
  const [loading, setLoading] = useState(false)
  const [apiResult, setApiResult] = useState(null)
  const [error, setError] = useState(null)
  const [animationDone, setAnimationDone] = useState(false)

  function set(key, value) { setForm(f => ({ ...f, [key]: value })) }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    
    // Edge case: Empty fields resulting in NaN
    if (form.age === '' || form.bmi === '' || form.HbA1c_level === '' || form.blood_glucose_level === '') {
      setError('Please fill in all numerical fields.')
      return
    }

    setLoading(true)
    setApiResult(null)
    setAnimationDone(false)

    try {
      const payload = {
        age: parseFloat(form.age),
        gender: form.gender,
        bmi: parseFloat(form.bmi),
        hypertension: form.hypertension,
        heart_disease: form.heart_disease,
        smoking_history: form.smoking_history,
        HbA1c_level: parseFloat(form.HbA1c_level),
        blood_glucose_level: parseFloat(form.blood_glucose_level),
      }

      const { data } = await axios.post(`${API_BASE}/predict`, payload)
      addEntry({ input: payload, result: data })
      setApiResult({ data, payload })
    } catch (err) {
      setLoading(false)
      
      const detail = err.response?.data?.detail
      let errorMsg = 'Failed to connect to prediction server.'
      if (typeof detail === 'string') {
        errorMsg = detail
      } else if (Array.isArray(detail)) {
        errorMsg = detail.map(d => `${d.loc[1] || 'Field'}: ${d.msg}`).join(' | ')
      }
      setError(errorMsg)
    }
  }

  // Effect to navigate once both animation finishes AND API resolves
  const handleAnimationComplete = useCallback(() => {
    setAnimationDone(true)
  }, [])

  useEffect(() => {
    if (animationDone && apiResult) {
      // Small delay to let the final state settle
      const timeout = setTimeout(() => {
        setLoading(false)
        navigate('/results', { state: { result: apiResult.data, input: apiResult.payload } })
      }, 500)
      return () => clearTimeout(timeout)
    }
  }, [animationDone, apiResult, navigate])

  return (
    <div className="min-h-screen bg-background px-8 lg:px-16 py-12">
      <AnimatePresence>
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="loading-overlay">
            <div className="w-px h-16 bg-primary mb-12" />
            <TypewriterLoading onAnimationComplete={handleAnimationComplete} />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }} className="mb-16">
        <span className="font-mono-dm text-[10px] tracking-[0.25em] text-primary uppercase">01 / Assessment</span>
        <h1 className="font-grotesk font-600 text-text mt-3 leading-tight"
          style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}>Patient Intake</h1>
        <p className="font-grotesk text-textMuted text-sm mt-2 font-300">Complete all fields for an accurate risk assessment.</p>
      </motion.div>

      <form onSubmit={handleSubmit}>
        <div className="max-w-3xl">
          {/* DEMOGRAPHICS */}
          <motion.section initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }} className="mb-16">
            <SectionLabel>Patient Demographics</SectionLabel>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <FormField label="Age" hint="Years (0–120)">
                <div className="flex items-end gap-4">
                  <input id="input-age" type="number" value={form.age} onChange={e => set('age', e.target.value)}
                    min={0} max={120} required placeholder="45"
                    className="bg-transparent border-none outline-none font-mono-dm text-text w-full placeholder:text-textMuted/30"
                    style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }} />
                  <span className="font-mono-dm text-xs text-textMuted pb-2">YRS</span>
                </div>
              </FormField>
              <FormField label="Gender">
                <div className="flex gap-2 mt-1">
                  {['male', 'female', 'other'].map(g => (
                    <button key={g} type="button" id={`gender-${g}`} onClick={() => set('gender', g)}
                      className={`pill-option px-4 py-2 font-grotesk text-xs tracking-wider uppercase ${form.gender === g ? 'selected' : ''}`}>
                      {g}
                    </button>
                  ))}
                </div>
              </FormField>
            </div>
          </motion.section>

          {/* CLINICAL */}
          <motion.section initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }} className="mb-16">
            <SectionLabel>Clinical Markers</SectionLabel>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <FormField label="BMI — Body Mass Index" hint="kg/m²  (10.0–100.0)">
                <div className="flex items-end justify-between gap-4">
                  <input id="input-bmi" type="number" value={form.bmi} onChange={e => set('bmi', e.target.value)}
                    min={10} max={100} step={0.1} required placeholder="28.3"
                    className="bg-transparent border-none outline-none font-mono-dm text-offwhite w-32 placeholder:text-offwhite-dim/30"
                    style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)' }} />
                  <FieldIndicator status={getBmiStatus(form.bmi)} />
                </div>
              </FormField>
              <FormField label="HbA1c Level" hint="% (3.0–15.0)">
                <div className="flex items-end justify-between gap-4">
                  <input id="input-hba1c" type="number" value={form.HbA1c_level} onChange={e => set('HbA1c_level', e.target.value)}
                    min={3} max={15} step={0.1} required placeholder="5.5"
                    className="bg-transparent border-none outline-none font-mono-dm text-text w-32 placeholder:text-textMuted/30"
                    style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)' }} />
                  <FieldIndicator status={getHbA1cStatus(form.HbA1c_level)} />
                </div>
              </FormField>
              <FormField label="Blood Glucose Level" hint="mg/dL (50–400)">
                <div className="flex items-end justify-between gap-4">
                  <input id="input-glucose" type="number" value={form.blood_glucose_level}
                    onChange={e => set('blood_glucose_level', e.target.value)}
                    min={50} max={400} required placeholder="125"
                    className="bg-transparent border-none outline-none font-mono-dm text-text w-32 placeholder:text-textMuted/30"
                    style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)' }} />
                  <FieldIndicator status={getGlucoseStatus(form.blood_glucose_level)} />
                </div>
              </FormField>
              <div className="grid grid-cols-2 gap-6">
                <FormField label="Hypertension">
                  <div className="flex gap-2 mt-1">
                    {[{ v: 0, l: 'No' }, { v: 1, l: 'Yes' }].map(({ v, l }) => (
                      <button key={v} type="button" id={`hypertension-${l.toLowerCase()}`}
                        onClick={() => set('hypertension', v)}
                        className={`pill-option px-4 py-2 font-grotesk text-xs tracking-wider uppercase ${form.hypertension === v ? 'selected' : ''}`}>
                        {l}
                      </button>
                    ))}
                  </div>
                </FormField>
                <FormField label="Heart Disease">
                  <div className="flex gap-2 mt-1">
                    {[{ v: 0, l: 'No' }, { v: 1, l: 'Yes' }].map(({ v, l }) => (
                      <button key={v} type="button" id={`heart-disease-${l.toLowerCase()}`}
                        onClick={() => set('heart_disease', v)}
                        className={`pill-option px-4 py-2 font-grotesk text-xs tracking-wider uppercase ${form.heart_disease === v ? 'selected' : ''}`}>
                        {l}
                      </button>
                    ))}
                  </div>
                </FormField>
              </div>
            </div>
          </motion.section>

          {/* LIFESTYLE */}
          <motion.section initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }} className="mb-16">
            <SectionLabel>Lifestyle Factors</SectionLabel>
            <FormField label="Smoking History">
              <div className="flex flex-wrap gap-2 mt-1">
                {SMOKING_OPTIONS.map(opt => (
                  <button key={opt.value} type="button" id={`smoking-${opt.value.replace(' ', '-')}`}
                    onClick={() => set('smoking_history', opt.value)}
                    className={`pill-option px-5 py-2.5 font-grotesk text-xs tracking-wider ${form.smoking_history === opt.value ? 'selected' : ''}`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </FormField>
          </motion.section>

          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8 border-l-2 border-danger pl-4 py-2">
              <p className="font-mono-dm text-xs text-danger">{error}</p>
            </motion.div>
          )}

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
            <button id="btn-submit-prediction" type="submit"
              className="group flex items-center gap-3 bg-primary px-10 py-5 font-grotesk text-sm tracking-widest uppercase text-white hover:bg-primaryHover hover:shadow-[0_0_20px_rgba(20,184,166,0.3)] transition-all duration-300">
              Analyze Risk Profile
              <span className="font-mono-dm text-xs opacity-60 group-hover:opacity-100 transition-opacity">→</span>
            </button>
          </motion.div>
        </div>
      </form>
    </div>
  )
}
