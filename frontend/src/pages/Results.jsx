import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'

const RISK_COLORS = {
  Low: '#10B981',
  Moderate: '#F59E0B',
  High: '#EF4444',
  Critical: '#DC2626',
}

const RISK_POSITIONS = { Low: 12, Moderate: 37, High: 63, Critical: 88 }

const NORMAL_RANGES = [
  { key: 'bmi', label: 'BMI', unit: 'kg/m²', normal: [18.5, 24.9], min: 10, max: 50 },
  { key: 'HbA1c_level', label: 'HbA1c', unit: '%', normal: [4.0, 5.6], min: 3, max: 15 },
  { key: 'blood_glucose_level', label: 'Blood Glucose', unit: 'mg/dL', normal: [70, 99], min: 50, max: 400 },
]

function RiskBar({ riskLevel }) {
  const pos = RISK_POSITIONS[riskLevel] || 12
  const color = RISK_COLORS[riskLevel] || '#4CAF50'

  return (
    <div className="relative">
      {/* Track labels */}
      <div className="flex justify-between mb-3">
        {['Low', 'Moderate', 'High', 'Critical'].map(r => (
          <span key={r}
            className="font-mono-dm text-[9px] tracking-[0.15em] uppercase"
            style={{ color: r === riskLevel ? color : 'rgba(240,237,232,0.2)' }}>
            {r}
          </span>
        ))}
      </div>

      {/* Track */}
      <div className="relative h-2 rounded-none overflow-visible"
        style={{ background: 'linear-gradient(to right, #0D9488 0%, #10B981 33%, #F59E0B 66%, #EF4444 100%)' }}>
        {/* Tick marks */}
        {[33, 66].map(p => (
          <div key={p} className="absolute top-0 h-full w-px bg-background/60"
            style={{ left: `${p}%` }} />
        ))}

        {/* Marker */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
          initial={{ left: '0%' }}
          animate={{ left: `${pos}%` }}
          transition={{ delay: 0.5, duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.div className="w-4 h-4 rounded-full border-2 border-background"
            style={{ backgroundColor: color }}
            initial={{ boxShadow: `0 0 16px ${color}99` }}
            animate={{ boxShadow: [`0 0 16px ${color}99`, `0 0 28px ${color}`, `0 0 16px ${color}99`] }}
            transition={{ delay: 1.9, duration: 1.8, ease: 'easeInOut', times: [0, 0.5, 1] }}
          />
        </motion.div>
      </div>

      {/* Position label */}
      <motion.div
        className="absolute -bottom-6 -translate-x-1/2"
        initial={{ left: '0%', opacity: 0 }}
        animate={{ left: `${pos}%`, opacity: 1 }}
        transition={{ delay: 0.5, duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="w-px h-4 mx-auto" style={{ backgroundColor: color }} />
      </motion.div>
    </div>
  )
}

function DivergingBar({ item, patientValue }) {
  const rangeSpan = item.max - item.min
  const normalStart = ((item.normal[0] - item.min) / rangeSpan) * 100
  const normalEnd = ((item.normal[1] - item.min) / rangeSpan) * 100
  const patientPos = Math.min(Math.max(((patientValue - item.min) / rangeSpan) * 100, 0), 100)
  const isNormal = patientValue >= item.normal[0] && patientValue <= item.normal[1]
  const dotColor = isNormal ? '#10B981' : patientValue < item.normal[0] ? '#F59E0B' : '#EF4444'

  return (
    <div className="py-4 border-b border-white/[0.05]">
      <div className="flex justify-between items-baseline mb-3">
        <span className="font-grotesk text-xs text-secondary tracking-wider">{item.label}</span>
        <div className="flex items-baseline gap-2">
          <span className="font-mono-dm text-lg text-text">{patientValue}</span>
          <span className="font-mono-dm text-xs text-textMuted">{item.unit}</span>
          <span className="font-mono-dm text-[10px] ml-2" style={{ color: dotColor }}>
            {isNormal ? '▲ Normal' : patientValue < item.normal[0] ? '▼ Low' : '▲ Elevated'}
          </span>
        </div>
      </div>

      {/* Track */}
      <div className="relative h-1 bg-white/[0.06]">
        {/* Normal range highlight */}
        <div className="absolute h-full bg-white/10"
          style={{ left: `${normalStart}%`, width: `${normalEnd - normalStart}%` }} />
        {/* Normal range labels */}
        <div className="absolute -top-4 font-mono-dm text-[8px] text-textMuted"
          style={{ left: `${normalStart}%` }}>{item.normal[0]}</div>
        <div className="absolute -top-4 font-mono-dm text-[8px] text-textMuted"
          style={{ left: `${normalEnd}%` }}>{item.normal[1]}</div>

        {/* Patient marker */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2 h-2 rounded-full"
          style={{ backgroundColor: dotColor, boxShadow: `0 0 8px ${dotColor}88` }}
          initial={{ left: '0%' }}
          animate={{ left: `${patientPos}%` }}
          transition={{ delay: 0.8, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>

      <div className="flex justify-between mt-3">
        <span className="font-mono-dm text-[9px] text-textMuted">{item.min}</span>
        <span className="font-mono-dm text-[9px] text-textMuted tracking-wider">
          Normal: {item.normal[0]}–{item.normal[1]} {item.unit}
        </span>
        <span className="font-mono-dm text-[9px] text-textMuted">{item.max}</span>
      </div>
    </div>
  )
}

function PatientDataRow({ label, value }) {
  return (
    <div className="flex justify-between items-baseline py-3 border-b border-white/[0.05]">
      <span className="font-grotesk text-xs text-secondary tracking-wider uppercase">{label}</span>
      <span className="font-mono-dm text-sm text-text">{String(value)}</span>
    </div>
  )
}

export default function Results() {
  const location = useLocation()
  const navigate = useNavigate()
  const result = location.state?.result
  const input = location.state?.input

  if (!result) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="font-grotesk text-textMuted mb-6">No assessment data found.</p>
          <button onClick={() => navigate('/predict')}
            className="font-grotesk text-sm text-primary border border-primary px-6 py-3 hover:bg-primary hover:text-white transition-all duration-300">
            Run Assessment
          </button>
        </div>
      </div>
    )
  }

  const { risk_level, confidence, risk_score, interpretation } = result
  const riskColor = RISK_COLORS[risk_level] || '#4CAF50'
  const confidencePct = Math.round(confidence * 100)

  const whatThisMeans = (() => {
    const hba1c = input.HbA1c_level
    const glucose = input.blood_glucose_level
    const hbaNote = hba1c >= 6.5
      ? `Your HbA1c of ${hba1c}% is in the diabetic range (≥6.5%).`
      : hba1c >= 5.7
      ? `Your HbA1c of ${hba1c}% is in the pre-diabetic range (5.7–6.4%).`
      : `Your HbA1c of ${hba1c}% is within the normal range (<5.7%).`
    const glNote = glucose >= 126
      ? `Your fasting glucose of ${glucose} mg/dL exceeds the diabetic threshold (≥126 mg/dL).`
      : glucose >= 100
      ? `Your glucose of ${glucose} mg/dL falls in the pre-diabetic range (100–125 mg/dL).`
      : `Your glucose of ${glucose} mg/dL is within normal limits (<100 mg/dL).`
    return `${hbaNote} ${glNote} ${interpretation}`
  })()

  return (
    <div className="min-h-screen bg-background px-8 lg:px-16 py-12">
      {/* Header */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
        className="flex items-center justify-between mb-16">
        <div>
          <span className="font-mono-dm text-[10px] tracking-[0.25em] text-primary uppercase">02 / Results</span>
          <h1 className="font-grotesk font-600 text-text mt-2 leading-tight"
            style={{ fontSize: 'clamp(1.5rem, 3vw, 2.5rem)' }}>Risk Assessment</h1>
        </div>
        <button onClick={() => navigate('/predict')} id="btn-new-assessment"
          className="group flex items-center gap-2 font-grotesk text-xs text-textMuted hover:text-text tracking-wider uppercase transition-colors duration-200">
          <ArrowLeft size={12} className="transition-transform duration-200 group-hover:-translate-x-0.5" />
          New Assessment
        </button>
      </motion.div>

      {/* RISK LEVEL — Giant typography */}
      <motion.div initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="mb-4 relative">
        <div className="font-grotesk font-700 leading-none tracking-tight"
          style={{ fontSize: 'clamp(5rem, 18vw, 14rem)', color: riskColor, opacity: 0.15 }}>
          {risk_level.toUpperCase()}
        </div>
        <motion.div className="font-grotesk font-700 leading-none tracking-tight absolute top-0 left-0"
          style={{ fontSize: 'clamp(5rem, 18vw, 14rem)', color: riskColor }}
          animate={{ textShadow: ['0 0 0px transparent', `0 0 28px ${riskColor}`, '0 0 0px transparent'] }}
          transition={{ delay: 1.9, duration: 1.8, ease: 'easeInOut', times: [0, 0.5, 1] }}>
          {risk_level.toUpperCase()}
        </motion.div>
      </motion.div>

      {/* Confidence */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }} className="mb-12 mt-4">
        <span className="font-mono-dm text-xs text-textMuted tracking-widest">
          Model confidence — {confidencePct}% · Risk score — {(risk_score * 100).toFixed(1)}%
        </span>
      </motion.div>

      {/* Risk bar */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.7 }} className="mb-20 max-w-3xl">
        <RiskBar riskLevel={risk_level} />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 max-w-5xl">
        {/* Patient values */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.6 }}>
          <div className="flex items-center gap-4 mb-6">
            <span className="font-mono-dm text-[10px] tracking-[0.2em] text-textMuted uppercase">Patient Values</span>
            <div className="flex-1 h-px bg-white/[0.06]" />
          </div>
          <PatientDataRow label="Age" value={`${input.age} yrs`} />
          <PatientDataRow label="Gender" value={input.gender} />
          <PatientDataRow label="BMI" value={`${input.bmi} kg/m²`} />
          <PatientDataRow label="HbA1c" value={`${input.HbA1c_level}%`} />
          <PatientDataRow label="Blood Glucose" value={`${input.blood_glucose_level} mg/dL`} />
          <PatientDataRow label="Hypertension" value={input.hypertension ? 'Yes' : 'No'} />
          <PatientDataRow label="Heart Disease" value={input.heart_disease ? 'Yes' : 'No'} />
          <PatientDataRow label="Smoking" value={input.smoking_history} />
        </motion.div>

        {/* What this means */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, duration: 0.6 }}>
          <div className="flex items-center gap-4 mb-6">
            <span className="font-mono-dm text-[10px] tracking-[0.2em] text-textMuted uppercase">What This Means</span>
            <div className="flex-1 h-px bg-white/[0.06]" />
          </div>
          <div className="border-l-2 pl-6" style={{ borderColor: riskColor }}>
            <p className="font-grotesk text-secondaryLight text-sm leading-relaxed font-300">{whatThisMeans}</p>
          </div>
          <div className="mt-8 p-5 bg-surface">
            <p className="font-mono-dm text-[10px] text-textMuted tracking-widest uppercase mb-2">Disclaimer</p>
            <p className="font-grotesk text-xs text-textMuted/60 leading-relaxed font-300">
              This tool is for informational purposes only. It does not constitute medical advice.
              Consult a qualified healthcare provider for diagnosis and treatment.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Comparison vs normal ranges */}
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.75, duration: 0.6 }} className="mt-16 max-w-3xl">
        <div className="flex items-center gap-4 mb-8">
          <span className="font-mono-dm text-[10px] tracking-[0.2em] text-textMuted uppercase">vs Normal Ranges</span>
          <div className="flex-1 h-px bg-white/[0.06]" />
        </div>
        {NORMAL_RANGES.map(item => (
          <DivergingBar key={item.key} item={item} patientValue={input[item.key]} />
        ))}
      </motion.div>

      {/* CTA to intelligence */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.6 }} className="mt-16">
        <button onClick={() => navigate('/intelligence')} id="btn-view-intelligence"
          className="group flex items-center gap-3 font-grotesk text-xs text-textMuted hover:text-text tracking-widest uppercase transition-colors duration-200">
          View Model Intelligence
          <ArrowRight size={12} className="transition-transform duration-200 group-hover:translate-x-0.5" />
        </button>
      </motion.div>
    </div>
  )
}
