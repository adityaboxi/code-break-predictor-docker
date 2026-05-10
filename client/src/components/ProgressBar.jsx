export default function ProgressBar({ progress = 0, status = 'active' }) {
  const clamped = Math.min(100, Math.max(0, progress))
  const isFailed = status === 'failed'
  const isDone = status === 'completed'

  const barColor = isFailed
    ? 'bg-red-500'
    : isDone
    ? 'bg-teal-400'
    : 'bg-gradient-to-r from-teal-600 to-teal-400'

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between items-center text-xs font-mono">
        <span className={isFailed ? 'text-red-400' : 'text-teal-400'}>
          {isFailed ? 'FAILED' : isDone ? 'COMPLETE' : 'PROCESSING'}
        </span>
        <span className="text-slate-400">{clamped}%</span>
      </div>

      {/* Track */}
      <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out relative ${barColor}`}
          style={{ width: `${clamped}%` }}
        >
          {/* Shimmer on active bar */}
          {!isDone && !isFailed && (
            <div className="absolute inset-0 shimmer rounded-full" />
          )}
        </div>
      </div>
    </div>
  )
}
