export function LiveBadge({ label = 'LIVE' }: { label?: string }) {
  return (
    <span
      className="glass-pill micro-label"
      style={{
        padding: '0.25rem 0.625rem',
        color: '#C9A96A',
      }}
    >
      <span
        className="animate-pulse-dot size-1.5 rounded-full"
        style={{ background: '#C9A96A' }}
        aria-hidden="true"
      />
      {label}
    </span>
  )
}
