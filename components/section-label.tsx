export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="micro-label" style={{ color: 'var(--primary)' }}>
      {children}
    </p>
  )
}
