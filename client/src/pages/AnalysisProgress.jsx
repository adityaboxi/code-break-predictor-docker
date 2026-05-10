import { useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import useAnalysisStore from '../store/useAnalysisStore'
import { getAnalysisStatus } from '../api/analysisApi'
import ProgressBar from '../components/ProgressBar'

const POLL_INTERVAL = 3000 // 3 seconds — matches original architecture

const STATUS_MESSAGES = {
  waiting:   'Job queued, waiting for worker…',
  active:    'Worker is processing your repository…',
  completed: 'Analysis complete! Loading results…',
  failed:    'Analysis failed. Please check the URL and try again.',
}

export default function AnalysisProgress() {
  const { jobId } = useParams()
  const navigate = useNavigate()
  const intervalRef = useRef(null)

  const { status, progress, statusMessage, setStatus, setProgress, setStatusMessage, repoUrl } =
    useAnalysisStore()

  useEffect(() => {
    if (!jobId) {
      navigate('/')
      return
    }

    const poll = async () => {
      try {
        const data = await getAnalysisStatus(jobId)

        setStatus(data.status)
        setProgress(data.progress ?? 0)
        setStatusMessage(data.message || STATUS_MESSAGES[data.status] || '')

        if (data.status === 'completed') {
          clearInterval(intervalRef.current)
          setTimeout(() => navigate(`/results/${jobId}`), 800)
        } else if (data.status === 'failed') {
          clearInterval(intervalRef.current)
        }
      } catch (err) {
        console.error('Status poll error:', err)
      }
    }

    poll()
    intervalRef.current = setInterval(poll, POLL_INTERVAL)

    return () => clearInterval(intervalRef.current)
  }, [jobId]) // eslint-disable-line react-hooks/exhaustive-deps

  const isFailed  = status === 'failed'
  const isComplete = status === 'completed'

  const steps = [
    { label: 'Fetch repo tree',          done: progress >= 20 },
    { label: 'Find package.json files',  done: progress >= 40 },
    { label: 'Query npm registry',       done: progress >= 65 },
    { label: 'Run risk engine',          done: progress >= 85 },
    { label: 'Save results',             done: progress >= 100 },
  ]

  return (
    <div className="min-h-[calc(100vh-65px)] flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-lg space-y-8 animate-in">

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="section-label">Analysis in Progress</div>
          <h2 className="font-display text-2xl font-bold text-white">
            {isFailed ? 'Analysis Failed' : isComplete ? 'Done! Redirecting…' : 'Scanning Repository'}
          </h2>
          {repoUrl && (
            <p className="text-xs font-mono text-slate-500 truncate">{repoUrl}</p>
          )}
        </div>

        {/* Progress card */}
        <div className="glass-card p-6 space-y-6">
          <ProgressBar progress={progress} status={status} />

          {/* Status message */}
          <p className="text-sm text-slate-400 text-center min-h-[20px]">
            {statusMessage || STATUS_MESSAGES[status] || 'Initialising…'}
          </p>

          {/* Step tracker */}
          <div className="space-y-2">
            {steps.map((step, i) => (
              <div key={i} className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                    step.done
                      ? 'bg-teal-500/20 border-teal-500/50'
                      : 'bg-white/[0.03] border-white/[0.08]'
                  }`}
                >
                  {step.done ? (
                    <svg className="w-3 h-3 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                  )}
                </div>
                <span className={`text-xs font-mono transition-colors duration-300 ${step.done ? 'text-teal-400' : 'text-slate-500'}`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>

          {/* Polling dots */}
          {!isFailed && !isComplete && (
            <div className="flex items-center justify-center gap-1.5 text-[11px] font-mono text-slate-600">
              <span className="w-1 h-1 rounded-full bg-teal-600 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1 h-1 rounded-full bg-teal-600 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1 h-1 rounded-full bg-teal-600 animate-bounce" style={{ animationDelay: '300ms' }} />
              <span className="ml-1">polling every 3s</span>
            </div>
          )}

          {/* Failed state */}
          {isFailed && (
            <button onClick={() => navigate('/')} className="btn-ghost w-full text-sm text-center">
              ← Try Again
            </button>
          )}
        </div>

      </div>
    </div>
  )
}
