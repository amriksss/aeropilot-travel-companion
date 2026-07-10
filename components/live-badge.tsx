export function LiveBadge({ label = 'LIVE' }: { label?: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-0.5 micro-label"
      style={{
        border: '1px solid rgba(138, 138, 133, 0.15)',
        color: '#8A8A85',
      }}
    >
      <span
        className="animate-pulse-dot size-1.5 rounded-full"
        style={{ background: '#E0201C' }}
        aria-hidden="true"
      />
      {label}
    </span>
  )
}
