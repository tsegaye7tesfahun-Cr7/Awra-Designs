export default function EmptyState({ icon, title, description, action, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {icon && (
        <div className="w-16 h-16 mb-4 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-600">
          {icon}
        </div>
      )}
      <h3 className="text-sm font-medium text-white mb-2">{title}</h3>
      {description && <p className="text-xs text-neutral-500 mb-4 max-w-sm">{description}</p>}
      {action && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 border border-neutral-700 text-xs text-neutral-400 hover:border-neutral-500 hover:text-white transition-colors"
        >
          {action}
        </button>
      )}
    </div>
  )
}
