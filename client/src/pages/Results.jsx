import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import useAnalysisStore from '../store/useAnalysisStore'
import { getAnalysisResults } from '../api/analysisApi'
import PackageCard from '../components/PackageCard'

export default function Results() {
  const { jobId } = useParams()
  const navigate = useNavigate()
  const { results, setResults, repoUrl } = useAnalysisStore()

  const [loading, setLoading]   = useState(!results)
  const [error, setError]       = useState('')
  const [filter, setFilter]     = useState('all')   // 'all' | 'high' | 'medium' | 'low'
  const [search, setSearch]     = useState('')
  const [sortBy, setSortBy]     = useState('risk')  // 'risk' | 'name'

  useEffect(() => {
    if (!results) fetchResults()
  }, [jobId]) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchResults = async () => {
    try {
      setLoading(true)
      const data = await getAnalysisResults(jobId)
      setResults(data)
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load results.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-65px)] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-teal-500/30 border-t-teal-400 rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-400 font-mono">Loading results…</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-65px)] flex items-center justify-center px-6">
        <div className="glass-card p-8 text-center space-y-4 max-w-md w-full">
          <div className="text-3xl">⚠️</div>
          <p className="text-red-400 text-sm">{error}</p>
          <button onClick={() => navigate('/')} className="btn-ghost text-sm">
            ← Start New Analysis
          </button>
        </div>
      </div>
    )
  }

  if (!results) return null

  const { packages = [], futureDate } = results
  const displayRepo = repoUrl || results.repoUrl || ''

  // Stats
  const high   = packages.filter((p) => (p.riskLevel || '').toLowerCase() === 'high')
  const medium = packages.filter((p) => (p.riskLevel || '').toLowerCase() === 'medium')
  const low    = packages.filter((p) => (p.riskLevel || '').toLowerCase() === 'low')
  const avgRisk =
    packages.length > 0
      ? Math.round(packages.reduce((s, p) => s + (p.riskScore || 0), 0) / packages.length)
      : 0

  // Filter + search + sort
  const visible = packages
    .filter((p) => filter === 'all' || (p.riskLevel || '').toLowerCase() === filter)
    .filter((p) => !search || p.name?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) =>
      sortBy === 'risk'
        ? (b.riskScore ?? 0) - (a.riskScore ?? 0)
        : a.name?.localeCompare(b.name)
    )

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-8 animate-in">

      {/* Header */}
      <div className="space-y-2">
        <div className="section-label">Analysis Results</div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">
          Dependency Risk Report
        </h1>
        {displayRepo && (
          <p className="text-xs font-mono text-slate-500 truncate">{displayRepo}</p>
        )}
        {futureDate && (
          <p className="text-xs text-slate-500">
            Predicted for:{' '}
            <span className="text-teal-400 font-mono">
              {new Date(futureDate).toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric',
              })}
            </span>
          </p>
        )}
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Packages', value: packages.length, color: 'text-white' },
          { label: 'High Risk',      value: high.length,     color: 'text-red-400' },
          { label: 'Medium Risk',    value: medium.length,   color: 'text-amber-400' },
          { label: 'Avg Risk Score', value: `${avgRisk}%`,   color: 'text-teal-400' },
        ].map((stat) => (
          <div key={stat.label} className="glass-card p-4 space-y-1">
            <div className={`text-2xl font-display font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wide">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          className="input-field flex-1"
          placeholder="Search package name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="flex gap-1.5 flex-shrink-0">
          {['all', 'high', 'medium', 'low'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-lg text-xs font-mono font-medium transition-all duration-150 border
                ${filter === f
                  ? f === 'all'    ? 'bg-white/10 border-white/20 text-white'
                  : f === 'high'   ? 'risk-high'
                  : f === 'medium' ? 'risk-medium'
                  :                  'risk-low'
                  : 'bg-transparent border-white/[0.06] text-slate-500 hover:border-white/10 hover:text-slate-300'
                }`}
            >
              {f.toUpperCase()}
              {f !== 'all' && (
                <span className="ml-1 opacity-60">
                  ({f === 'high' ? high.length : f === 'medium' ? medium.length : low.length})
                </span>
              )}
            </button>
          ))}
        </div>

        <select
          className="input-field flex-shrink-0 sm:w-36 cursor-pointer"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="risk">Sort: Risk ↓</option>
          <option value="name">Sort: Name A–Z</option>
        </select>
      </div>

      {/* Package list */}
      {visible.length === 0 ? (
        <div className="glass-card p-8 text-center text-slate-500 text-sm">
          No packages match your filter.
        </div>
      ) : (
        <div className="space-y-2">
          {visible.map((pkg, i) => (
            <PackageCard key={pkg.name} pkg={pkg} index={i} />
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-white/[0.05]">
        <button onClick={() => navigate('/')} className="btn-ghost text-sm">
          ← New Analysis
        </button>
        <span className="text-xs font-mono text-slate-600">
          {visible.length} / {packages.length} packages shown
        </span>
      </div>

    </div>
  )
}
