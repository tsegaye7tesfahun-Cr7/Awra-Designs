import { useLocation } from 'react-router-dom'

export default function Breadcrumbs() {
  const location = useLocation()
  
  // Don't show breadcrumbs on login page
  if (location.pathname === '/login') return null

  const pathSegments = location.pathname.split('/').filter(Boolean)
  
  const breadcrumbs = [
    { label: 'Dashboard', path: '/' },
    ...pathSegments.map((segment, index) => {
      const path = '/' + pathSegments.slice(0, index + 1).join('/')
      const label = segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
      return { label, path }
    }),
  ]

  return (
    <nav className="flex items-center gap-2 text-xs text-neutral-500 mb-4">
      {breadcrumbs.map((crumb, index) => (
        <div key={crumb.path} className="flex items-center gap-2">
          {index > 0 && <span className="text-neutral-700">/</span>}
          {index === breadcrumbs.length - 1 ? (
            <span className="text-white">{crumb.label}</span>
          ) : (
            <a href={crumb.path} className="hover:text-white transition-colors">
              {crumb.label}
            </a>
          )}
        </div>
      ))}
    </nav>
  )
}
