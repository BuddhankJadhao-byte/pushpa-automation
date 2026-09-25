export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Loading" className="space-y-3">
      <div className="h-10 w-56 animate-pulse rounded-xl bg-raised" />
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="h-20 animate-pulse rounded-2xl bg-surface" style={{ animationDelay: `${i * 120}ms` }} />
      ))}
    </div>
  )
}
