import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import {
  Activity,
  Brain,
  ClipboardList,
  BarChart2,
  History,
  ChevronRight,
} from 'lucide-react'

const NAV_ITEMS = [
  { to: '/',            icon: Activity,     label: 'Overview',       short: 'OV' },
  { to: '/predict',     icon: ClipboardList,label: 'Assessment',     short: 'AS' },
  { to: '/results',     icon: BarChart2,    label: 'Results',        short: 'RS' },
  { to: '/intelligence',icon: Brain,        label: 'Intelligence',   short: 'IN' },
  { to: '/history',     icon: History,      label: 'History',        short: 'HX' },
]

export default function Sidebar() {
  const [expanded, setExpanded] = useState(false)
  const location = useLocation()

  return (
    <motion.aside
      initial={false}
      animate={{ width: expanded ? 220 : 64 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      className="fixed left-0 top-0 h-screen bg-surface border-r border-white/[0.04] z-50 flex flex-col overflow-hidden"
      style={{ boxShadow: '4px 0 24px rgba(0,0,0,0.4)' }}
    >
      {/* Logo mark */}
      <div className="h-16 flex items-center px-4 border-b border-white/[0.04]">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
            <img src="/favicon.svg" alt="Outlier Detective" className="w-full h-full object-contain" />
          </div>
          <AnimatePresence>
            {expanded && (
              <motion.span
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2 }}
                className="font-grotesk text-sm font-500 text-text whitespace-nowrap tracking-wide"
              >
                Outlier Detective
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-4 flex flex-col gap-1">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => {
          const isActive = location.pathname === to
          return (
            <NavLink
              key={to}
              to={to}
              className={`group relative flex items-center gap-3 px-4 h-11 transition-all duration-200
                ${isActive
                  ? 'sidebar-item-active text-text'
                  : 'text-textMuted hover:text-text'
                }`}
            >
              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute left-0 top-0 h-full w-[2px] bg-primary"
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                />
              )}

              <Icon
                size={16}
                className={`flex-shrink-0 transition-colors duration-200
                  ${isActive ? 'text-primary' : 'text-textMuted group-hover:text-text'}`}
              />

              <AnimatePresence>
                {expanded && (
                  <motion.span
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.2 }}
                    className="font-grotesk text-sm whitespace-nowrap"
                  >
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          )
        })}
      </nav>

      {/* Expand hint */}
      <div className="h-12 flex items-center justify-center border-t border-white/[0.04]">
        <div className="w-8 h-8 flex items-center justify-center">
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronRight size={12} className="text-textMuted" />
          </motion.div>
        </div>
      </div>
    </motion.aside>
  )
}
