import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePatientHistory } from '../context/PatientHistoryContext'
import { ChevronDown, ChevronUp, Download, Trash2 } from 'lucide-react'

const RISK_COLORS = {
  Low: '#10B981',
  Moderate: '#F59E0B',
  High: '#EF4444',
  Critical: '#DC2626',
}

function formatDate(iso) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function ExportCSV({ history }) {
  function handleExport() {
    if (!history.length) return
    const headers = ['ID', 'Timestamp', 'Age', 'Gender', 'BMI', 'HbA1c', 'Glucose',
      'Hypertension', 'Heart Disease', 'Smoking', 'Risk Level', 'Confidence', 'Risk Score']
    const rows = history.map(e => [
      e.id, e.timestamp, e.input.age, e.input.gender, e.input.bmi,
      e.input.HbA1c_level, e.input.blood_glucose_level, e.input.hypertension,
      e.input.heart_disease, e.input.smoking_history,
      e.result.risk_level, e.result.confidence, e.result.risk_score,
    ])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `drsp-history-${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <button onClick={handleExport} id="btn-export-history"
      className="group flex items-center gap-2 font-grotesk text-xs text-textMuted hover:text-text tracking-wider uppercase transition-colors duration-200">
      <Download size={12} />
      Export CSV
    </button>
  )
}

function HistoryRow({ entry, index }) {
  const [expanded, setExpanded] = useState(false)
  const riskColor = RISK_COLORS[entry.result.risk_level] || '#10B981'

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}>
      {/* Row */}
      <div
        className="flex items-center gap-4 py-4 cursor-pointer hover:bg-white/[0.01] transition-colors duration-200 group"
        style={{ borderLeft: `2px solid ${riskColor}`, paddingLeft: '16px' }}
        onClick={() => setExpanded(e => !e)}
        id={`history-row-${entry.id}`}
      >
        {/* Index */}
        <span className="font-mono-dm text-[10px] text-textMuted w-6 flex-shrink-0">
          {String(index + 1).padStart(2, '0')}
        </span>

        {/* Timestamp */}
        <span className="font-mono-dm text-xs text-textMuted flex-shrink-0 w-40 hidden sm:block">
          {formatDate(entry.timestamp)}
        </span>

        {/* Demographics summary */}
        <span className="font-mono-dm text-xs text-secondaryLight flex-1">
          {entry.input.age}y · {entry.input.gender} · BMI {entry.input.bmi}
        </span>

        {/* Risk level */}
        <span className="font-grotesk text-xs font-500 flex-shrink-0 w-20 text-right"
          style={{ color: riskColor }}>
          {entry.result.risk_level}
        </span>

        {/* Confidence */}
        <span className="font-mono-dm text-xs text-textMuted flex-shrink-0 w-16 text-right hidden md:block">
          {Math.round(entry.result.confidence * 100)}%
        </span>

        {/* Expand icon */}
        <div className="flex-shrink-0 text-textMuted group-hover:text-text transition-colors duration-200">
          {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </div>
      </div>

      {/* Expanded detail */}
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden">
            <div className="py-6 pl-10 pr-4 grid grid-cols-2 lg:grid-cols-4 gap-6 bg-surface">
              {[
                ['HbA1c', `${entry.input.HbA1c_level}%`],
                ['Blood Glucose', `${entry.input.blood_glucose_level} mg/dL`],
                ['Hypertension', entry.input.hypertension ? 'Yes' : 'No'],
                ['Heart Disease', entry.input.heart_disease ? 'Yes' : 'No'],
                ['Smoking', entry.input.smoking_history],
                ['Risk Score', `${(entry.result.risk_score * 100).toFixed(1)}%`],
                ['Confidence', `${(entry.result.confidence * 100).toFixed(1)}%`],
                ['Prediction', entry.result.prediction === 1 ? 'Diabetic' : 'Non-diabetic'],
              ].map(([label, value]) => (
                <div key={label}>
                  <div className="font-grotesk text-[10px] text-secondary tracking-widest uppercase mb-1">{label}</div>
                  <div className="font-mono-dm text-sm text-text">{value}</div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Divider */}
      <div className="h-px bg-white/[0.04]" />
    </motion.div>
  )
}

export default function History() {
  const { history, clearHistory } = usePatientHistory()

  return (
    <div className="min-h-screen bg-background px-8 lg:px-16 py-12">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }} className="flex items-start justify-between mb-16">
        <div>
          <span className="font-mono-dm text-[10px] tracking-[0.25em] text-primary uppercase">04 / History</span>
          <h1 className="font-grotesk font-600 text-text mt-3 leading-tight"
            style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}>Patient Records</h1>
          <p className="font-grotesk text-textMuted text-sm mt-2 font-300">
            {history.length} assessment{history.length !== 1 ? 's' : ''} recorded this session
          </p>
        </div>
        <div className="flex items-center gap-6 mt-2">
          <ExportCSV history={history} />
          {history.length > 0 && (
            <button onClick={clearHistory} id="btn-clear-history"
              className="group flex items-center gap-2 font-grotesk text-xs text-textMuted hover:text-danger tracking-wider uppercase transition-colors duration-200">
              <Trash2 size={12} />
              Clear
            </button>
          )}
        </div>
      </motion.div>

      {history.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="flex flex-col items-center justify-center py-32">
          <div className="w-px h-16 bg-white/[0.06] mb-8" />
          <p className="font-grotesk text-textMuted text-sm">No assessments yet.</p>
          <p className="font-mono-dm text-xs text-textMuted/50 mt-2 tracking-wider">
            Run a prediction to see records here.
          </p>
        </motion.div>
      ) : (
        <div>
          {/* Table header */}
          <div className="flex items-center gap-4 py-3 border-b border-white/[0.08] pl-[18px]">
            <span className="font-mono-dm text-[9px] text-textMuted tracking-widest uppercase w-6">#</span>
            <span className="font-mono-dm text-[9px] text-textMuted tracking-widest uppercase w-40 hidden sm:block">Timestamp</span>
            <span className="font-mono-dm text-[9px] text-textMuted tracking-widest uppercase flex-1">Patient</span>
            <span className="font-mono-dm text-[9px] text-textMuted tracking-widest uppercase w-20 text-right">Risk</span>
            <span className="font-mono-dm text-[9px] text-textMuted tracking-widest uppercase w-16 text-right hidden md:block">Conf.</span>
            <span className="w-3" />
          </div>

          {/* Rows */}
          <div>
            {history.map((entry, i) => (
              <HistoryRow key={entry.id} entry={entry} index={i} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
