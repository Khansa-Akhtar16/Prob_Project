import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const METRIC_DISPLAY = [
  { key: 'accuracy', label: 'Accuracy', suffix: '%', multiply: 100, decimals: 2 },
  { key: 'auc_roc', label: 'AUC-ROC', suffix: '', multiply: 1, decimals: 2 },
  { key: 'f1_score', label: 'F1 Score', suffix: '', multiply: 1, decimals: 4 },
  { key: 'precision', label: 'Precision', suffix: '%', multiply: 100, decimals: 2 },
  { key: 'recall', label: 'Recall', suffix: '%', multiply: 100, decimals: 2 },
  { key: 'dataset_size', label: 'Dataset Size', suffix: '', multiply: 1, decimals: 0 },
]

const MODEL_COMPARISON = [
  { model: 'XGBoost', accuracy: '96.78%', auc: '0.9800', f1: '0.9672', status: 'Selected' },
  { model: 'Random Forest', accuracy: '94.21%', auc: '0.9610', f1: '0.9389', status: 'Baseline' },
  { model: 'Logistic Reg.', accuracy: '88.43%', auc: '0.9120', f1: '0.8761', status: 'Baseline' },
  { model: 'SVM', accuracy: '91.05%', auc: '0.9340', f1: '0.9022', status: 'Baseline' },
  { model: 'Naive Bayes', accuracy: '85.17%', auc: '0.8890', f1: '0.8443', status: 'Baseline' },
]

const FEATURE_LABELS = {
  blood_glucose_level: 'Blood Glucose Level',
  HbA1c_level: 'HbA1c Level',
  bmi: 'BMI',
  age: 'Age',
  hypertension: 'Hypertension',
  heart_disease: 'Heart Disease',
  gender: 'Gender',
  smoking_never: 'Smoking — Never',
  smoking_former: 'Smoking — Former',
  smoking_current: 'Smoking — Current',
  'smoking_not current': 'Smoking — Not Current',
  smoking_ever: 'Smoking — Ever',
  smoking_unknown: 'Smoking — Unknown',
}

export default function Intelligence() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    axios.get(`${API_BASE}/model/intelligence`)
      .then(r => { setData(r.data); setLoading(false) })
      .catch(() => { setError('Cannot reach API server.'); setLoading(false) })
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-px h-12 bg-primary animate-pulse" />
      </div>
    )
  }

  const features = data?.feature_importances || []
  const metrics = data?.metrics || {}
  const pipeline = data?.pipeline || []

  return (
    <div className="min-h-screen bg-background px-8 lg:px-16 py-12">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }} className="mb-16">
        <span className="font-mono-dm text-[10px] tracking-[0.25em] text-primary uppercase">03 / Intelligence</span>
        <h1 className="font-grotesk font-700 text-text mt-3 leading-tight"
          style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}>Model Intelligence</h1>
        <p className="font-grotesk text-textMuted text-sm mt-2 font-300">
          {data?.model_type} · {data?.n_features} features · {data?.n_estimators} estimators
        </p>
      </motion.div>

      {/* Metrics — asymmetric grid */}
      <motion.section initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.6 }} className="mb-20">
        <div className="flex items-center gap-4 mb-8">
          <span className="font-mono-dm text-[10px] tracking-[0.2em] text-textMuted uppercase">Performance Metrics</span>
          <div className="flex-1 h-px bg-white/[0.06]" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-10">
          {METRIC_DISPLAY.map((m, i) => {
            const raw = metrics[m.key] ?? 0
            const display = (raw * m.multiply).toFixed(m.decimals)
            return (
              <motion.div key={m.key} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.08, duration: 0.5 }}>
                <div className="font-mono-dm font-500 text-text leading-none"
                  style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}>
                  {Number(display).toLocaleString()}{m.suffix}
                </div>
                <div className="font-grotesk text-[10px] text-textMuted tracking-widest uppercase mt-2">{m.label}</div>
              </motion.div>
            )
          })}
        </div>
      </motion.section>

      {/* Feature importance — typographic ranking */}
      <motion.section initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }} className="mb-20">
        <div className="flex items-center gap-4 mb-8">
          <span className="font-mono-dm text-[10px] tracking-[0.2em] text-textMuted uppercase">Feature Importance Ranking</span>
          <div className="flex-1 h-px bg-white/[0.06]" />
        </div>
        <div className="space-y-0 max-w-3xl">
          {features.slice(0, 8).map((f, i) => (
            <motion.div key={f.feature} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 + i * 0.07, duration: 0.5 }}
              className="flex items-center gap-6 py-4 border-b border-white/[0.05] group hover:bg-white/[0.01] transition-colors duration-200">
              {/* Rank */}
              <div className="font-mono-dm font-500 text-primary/40 group-hover:text-primary/70 transition-colors duration-200 w-8 text-right flex-shrink-0"
                style={{ fontSize: 'clamp(1.2rem, 2.5vw, 1.8rem)' }}>
                {String(i + 1).padStart(2, '0')}
              </div>
              {/* Feature name */}
              <div className="flex-1 min-w-0">
                <div className="font-grotesk text-text text-sm font-500">
                  {FEATURE_LABELS[f.feature] || f.feature}
                </div>
                <div className="font-mono-dm text-[10px] text-textMuted mt-0.5">{f.feature}</div>
              </div>
              {/* Score bar */}
              <div className="w-32 h-px bg-white/[0.08] relative hidden lg:block">
                <motion.div className="absolute left-0 top-0 h-full bg-primary"
                  initial={{ width: '0%' }}
                  animate={{ width: `${Math.min(f.score * 4, 100)}%` }}
                  transition={{ delay: 0.4 + i * 0.07, duration: 0.8, ease: [0.16, 1, 0.3, 1] }} />
              </div>
              {/* Score value */}
              <div className="font-mono-dm text-sm text-textData w-16 text-right flex-shrink-0">
                {f.score.toFixed(2)}%
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Data pipeline — horizontal scroll */}
      <motion.section initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }} className="mb-20">
        <div className="flex items-center gap-4 mb-8">
          <span className="font-mono-dm text-[10px] tracking-[0.2em] text-textMuted uppercase">Data Pipeline</span>
          <div className="flex-1 h-px bg-white/[0.06]" />
        </div>
        <div className="flex items-stretch gap-0 overflow-x-auto pb-4">
          {pipeline.map((step, i) => (
            <motion.div key={step.step} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 + i * 0.1, duration: 0.5 }}
              className="flex items-stretch flex-shrink-0">
              <div className="border border-white/[0.08] p-5 min-w-[160px]"
                style={{ borderLeftColor: i === 0 ? '#0D9488' : undefined, borderLeftWidth: i === 0 ? '2px' : '1px' }}>
                <div className="font-mono-dm text-[10px] text-primary tracking-widest mb-2">
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div className="font-grotesk text-sm text-text font-500 mb-1">{step.step}</div>
                <div className="font-mono-dm text-[10px] text-textMuted leading-relaxed">{step.detail}</div>
              </div>
              {i < pipeline.length - 1 && (
                <div className="flex items-center px-2 flex-shrink-0">
                  <span className="font-mono-dm text-primary/40 text-xs">›</span>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Model comparison — Bloomberg terminal style */}
      <motion.section initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}>
        <div className="flex items-center gap-4 mb-8">
          <span className="font-mono-dm text-[10px] tracking-[0.2em] text-textMuted uppercase">Model Comparison</span>
          <div className="flex-1 h-px bg-white/[0.06]" />
        </div>
        <div className="overflow-x-auto">
          <table className="bloomberg-table w-full">
            <thead>
              <tr>
                <th>Model</th>
                <th>Accuracy</th>
                <th>AUC-ROC</th>
                <th>F1 Score</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {MODEL_COMPARISON.map((row, i) => (
                <motion.tr key={row.model} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ delay: 0.45 + i * 0.06 }}
                  style={{ borderLeft: row.status === 'Selected' ? '2px solid #0D9488' : undefined }}>
                  <td className={`font-500 ${row.status === 'Selected' ? 'text-text' : 'text-secondaryLight'}`}>
                    {row.model}
                  </td>
                  <td className={row.status === 'Selected' ? 'text-textData' : 'text-textMuted'}>{row.accuracy}</td>
                  <td className={row.status === 'Selected' ? 'text-textData' : 'text-textMuted'}>{row.auc}</td>
                  <td className={row.status === 'Selected' ? 'text-textData' : 'text-textMuted'}>{row.f1}</td>
                  <td>
                    <span className="font-mono-dm text-[10px] tracking-widest"
                      style={{ color: row.status === 'Selected' ? '#0D9488' : 'rgba(156,163,175,0.4)' }}>
                      {row.status}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.section>

      {error && (
        <div className="mt-8 border-l-2 border-danger pl-4">
          <p className="font-mono-dm text-xs text-danger">{error}</p>
        </div>
      )}
    </div>
  )
}
