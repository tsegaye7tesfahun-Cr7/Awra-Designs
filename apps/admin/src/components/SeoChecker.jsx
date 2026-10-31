import { useState, useEffect } from 'react'

export default function SeoChecker({ title, description, slug }) {
  const [score, setScore] = useState(0)
  const [issues, setIssues] = useState([])
  const [warnings, setWarnings] = useState([])

  useEffect(() => {
    const newIssues = []
    const newWarnings = []
    let currentScore = 100

    // Title checks
    if (!title || title.trim().length === 0) {
      newIssues.push('Title is missing')
      currentScore -= 20
    } else {
      if (title.length < 30) {
        newWarnings.push('Title is too short (recommended: 30-60 characters)')
        currentScore -= 5
      }
      if (title.length > 60) {
        newWarnings.push('Title is too long (recommended: 30-60 characters)')
        currentScore -= 5
      }
    }

    // Description checks
    if (!description || description.trim().length === 0) {
      newIssues.push('Description is missing')
      currentScore -= 20
    } else {
      if (description.length < 120) {
        newWarnings.push('Description is too short (recommended: 120-160 characters)')
        currentScore -= 5
      }
      if (description.length > 160) {
        newWarnings.push('Description is too long (recommended: 120-160 characters)')
        currentScore -= 5
      }
    }

    // Slug checks
    if (!slug || slug.trim().length === 0) {
      newIssues.push('Slug is missing')
      currentScore -= 15
    } else {
      if (!/^[a-z0-9-]+$/.test(slug)) {
        newWarnings.push('Slug should only contain lowercase letters, numbers, and hyphens')
        currentScore -= 5
      }
      if (slug.endsWith('-') || slug.startsWith('-')) {
        newWarnings.push('Slug should not start or end with a hyphen')
        currentScore -= 5
      }
    }

    setScore(Math.max(0, currentScore))
    setIssues(newIssues)
    setWarnings(newWarnings)
  }, [title, description, slug])

  const getScoreColor = () => {
    if (score >= 80) return 'text-green-400'
    if (score >= 60) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getScoreLabel = () => {
    if (score >= 80) return 'Good'
    if (score >= 60) return 'Needs Improvement'
    return 'Poor'
  }

  return (
    <div className="border border-neutral-800 bg-[#0a0a0a] p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-neutral-400">SEO Score</span>
        <div className="flex items-center gap-2">
          <span className={`text-lg font-bold ${getScoreColor()}`}>{score}</span>
          <span className={`text-xs ${getScoreColor()}`}>{getScoreLabel()}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-neutral-900 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${
            score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
          }`}
          style={{ width: `${score}%` }}
        />
      </div>

      {/* Issues */}
      {issues.length > 0 && (
        <div className="space-y-1">
          <p className="text-[10px] font-medium text-red-400 uppercase tracking-wider">Issues</p>
          {issues.map((issue, i) => (
            <p key={i} className="text-xs text-red-300 flex items-start gap-2">
              <span className="mt-0.5">•</span>
              {issue}
            </p>
          ))}
        </div>
      )}

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="space-y-1">
          <p className="text-[10px] font-medium text-yellow-400 uppercase tracking-wider">Warnings</p>
          {warnings.map((warning, i) => (
            <p key={i} className="text-xs text-yellow-300 flex items-start gap-2">
              <span className="mt-0.5">•</span>
              {warning}
            </p>
          ))}
        </div>
      )}

      {issues.length === 0 && warnings.length === 0 && (
        <p className="text-xs text-green-400">✓ All SEO checks passed</p>
      )}
    </div>
  )
}
