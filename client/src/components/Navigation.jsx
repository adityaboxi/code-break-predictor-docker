import { Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav className="relative z-50 border-b border-white/[0.05] bg-navy-950/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center group-hover:bg-teal-500/20 transition-colors">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 4h12M2 8h8M2 12h10" stroke="#2dd4bf" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="13" cy="12" r="2" fill="#ef4444" />
            </svg>
          </div>
          <div>
            <span className="font-display font-bold text-sm text-white tracking-tight">
              Code<span className="text-teal-400">Break</span>
            </span>
            <div className="text-[10px] font-mono text-slate-500 -mt-0.5 leading-none">
              PREDICTOR
            </div>
          </div>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <span className="hidden sm:flex items-center gap-1.5 text-xs font-mono text-slate-500 border border-white/[0.06] rounded-full px-3 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
            npm risk engine
          </span>
          <a
            href="https://github.com/adityaboxi/code-break-predictor"
            target="_blank"
            rel="noreferrer"
            className="btn-ghost text-xs py-2 px-3"
          >
            GitHub
          </a>
        </div>

      </div>
    </nav>
  )
}
