export default function Skeleton({ className = '', height = 'h-4' }) {
  return (
    <div className={`animate-pulse bg-neutral-900 rounded ${height} ${className}`} />
  )
}

export function CardSkeleton() {
  return (
    <div className="border border-neutral-900 bg-[#0a0a0a] p-4 space-y-3">
      <Skeleton className="h-32" />
      <Skeleton className="w-3/4 h-4" />
      <Skeleton className="w-1/2 h-4" />
    </div>
  )
}

export function TableSkeleton({ rows = 5 }) {
  return (
    <div className="space-y-1">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-3 border border-neutral-900">
          <Skeleton className="w-8 h-8 rounded-full" />
          <Skeleton className="flex-1 h-4" />
          <Skeleton className="w-20 h-4" />
          <Skeleton className="w-16 h-4" />
        </div>
      ))}
    </div>
  )
}
