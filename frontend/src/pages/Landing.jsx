import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Activity, ShieldCheck, Database, ArrowRight } from 'lucide-react'
import CountUp from '../components/CountUp'
import ParticleBackground from '../components/ParticleBackground'

const STATS = [
  { value: 95103, label: 'Patients Analyzed', decimals: 0, suffix: '' },
  { value: 96.78, label: 'Model Accuracy', decimals: 2, suffix: '%' },
  { value: 0.98, label: 'AUC-ROC Score', decimals: 2, suffix: '' },
  { value: 13, label: 'Biomarker Features', decimals: 0, suffix: '' },
]

const INSTRUMENT_LINES = [
  { label: 'MODEL', value: 'XGBoost v2.0' },
  { label: 'ALGO', value: 'Gradient Boosted Trees' },
  { label: 'SMOTE', value: 'Class Balanced' },
  { label: 'SCALE', value: 'StandardScaler' },
  { label: 'STATUS', value: 'OPERATIONAL', accent: true },
]

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="relative min-h-screen bg-background flex flex-col overflow-hidden">
      <ParticleBackground />

      {/* ── Split layout ── */}
      <div className="flex flex-col lg:flex-row min-h-screen relative z-10">

        {/* LEFT — Typographic statement */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="lg:w-[55%] flex flex-col justify-between px-12 py-16 lg:px-20 lg:py-20 border-r border-border"
        >
          {/* Header mark */}
          <div className="flex items-center gap-3">
            <Activity size={14} className="text-primary" />
            <span className="font-mono-dm text-xs tracking-[0.2em] text-textMuted uppercase">
              DRSP — v1.0
            </span>
          </div>

          {/* Main statement */}
          <div className="py-16 lg:py-0">
            <motion.h1
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="font-grotesk font-700 text-text leading-[0.92] tracking-tight"
              style={{ fontSize: 'clamp(3.5rem, 7vw, 7rem)' }}
            >
              Your Blood<br />
              <span className="text-primary">Doesn't</span><br />
              Lie.
            </motion.h1>

            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.6, duration: 0.8, ease: [0.16, 1, 0.3, 1], transformOrigin: 'left' }}
              className="h-px bg-border my-10"
            />

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="font-grotesk text-textMuted text-base leading-relaxed max-w-md font-300"
            >
              A clinical-grade XGBoost prediction system trained on{' '}
              <span className="text-text font-400">95,103 patient records</span>.
              Enter your biomarkers. Receive your risk profile.
            </motion.p>

            <motion.button
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              onClick={() => navigate('/predict')}
              id="cta-begin-assessment"
              className="group mt-12 flex items-center gap-3 border border-border px-8 py-4 font-grotesk text-sm tracking-widest uppercase text-text hover:bg-primaryHover hover:border-primaryHover hover:shadow-[0_0_20px_rgba(20,184,166,0.2)] transition-all duration-300 ease-out"
            >
              Begin Assessment
              <ArrowRight
                size={14}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </motion.button>
          </div>

          {/* Footer label */}
          <div>
            <p className="font-mono-dm text-xs text-textMuted tracking-widest uppercase">
              Diabetes Risk & Severity Prediction System
            </p>
          </div>
        </motion.div>

        {/* RIGHT — Instrument panel */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="lg:w-[45%] flex flex-col justify-between px-12 py-16 lg:px-16 lg:py-20 bg-surface"
        >
          {/* Instrument label */}
          <div className="flex items-center justify-between">
            <span className="font-mono-dm text-xs tracking-[0.2em] text-textMuted uppercase">
              System Telemetry
            </span>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-dot" />
              <span className="font-mono-dm text-xs text-primary tracking-widest">LIVE</span>
            </div>
          </div>

          {/* Stats readouts */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-12 py-12">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.12, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                <div
                  className="font-mono-dm font-500 text-text leading-none tracking-tight"
                  style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}
                >
                  <CountUp
                    end={stat.value}
                    decimals={stat.decimals}
                    suffix={stat.suffix}
                    duration={1600}
                  />
                </div>
                <div className="font-grotesk text-xs text-textMuted tracking-wider uppercase mt-2">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Thin divider */}
          <div className="divider mb-8" />

          {/* System status lines — Bloomberg style */}
          <div className="space-y-3">
            {INSTRUMENT_LINES.map((line, i) => (
              <motion.div
                key={line.label}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.08, duration: 0.4 }}
                className="flex items-center justify-between"
              >
                <span className="font-mono-dm text-xs text-textMuted tracking-[0.15em]">
                  {line.label}
                </span>
                <span className={`font-mono-dm text-xs tracking-wider ${line.accent ? 'text-primary' : 'text-secondaryLight'}`}>
                  {line.value}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Animated horizontal rule — decorative */}
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ delay: 1.2, duration: 1, ease: [0.16, 1, 0.3, 1], transformOrigin: 'left' }}
            className="mt-8 h-px bg-primary/30"
          />

          {/* Pipeline flow */}
          <div className="mt-8 flex items-center gap-2 overflow-x-auto pb-2">
            {['Raw Data', 'Clean', 'SMOTE', 'Scale', 'XGBoost', 'Predict'].map((step, i) => (
              <motion.div
                key={step}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.0 + i * 0.1 }}
                className="flex items-center gap-2 flex-shrink-0"
              >
                <span className="font-mono-dm text-[10px] text-textMuted tracking-widest whitespace-nowrap">
                  {step}
                </span>
                {i < 5 && (
                  <span className="text-primary/40 font-mono-dm text-xs">›</span>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
