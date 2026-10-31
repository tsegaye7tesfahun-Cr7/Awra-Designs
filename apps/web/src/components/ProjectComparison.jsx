import { useState } from 'react'

export default function ProjectComparison({ projects = [] }) {
  const [selected, setSelected] = useState([])

  const toggleSelect = (id) => {
    setSelected(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id].slice(0, 3)
    )
  }

  if (projects.length === 0) return null

  const selectedProjects = projects.filter(p => selected.includes(p.id))

  return (
    <div className="w-full">
      {/* Select projects to compare */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-white mb-3">Select up to 3 projects to compare</h3>
        <div className="flex flex-wrap gap-2">
          {projects.map(project => (
            <button
              key={project.id}
              onClick={() => toggleSelect(project.id)}
              className={`px-3 py-1.5 text-xs border transition-colors ${
                selected.includes(project.id)
                  ? 'border-white bg-white text-[#0a0a0a]'
                  : 'border-neutral-800 text-neutral-400 hover:border-neutral-600'
              }`}
            >
              {project.title}
            </button>
          ))}
        </div>
      </div>

      {/* Comparison table */}
      {selectedProjects.length >= 2 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-800">
                <th className="text-left py-3 px-4 text-neutral-500 font-medium">Feature</th>
                {selectedProjects.map(p => (
                  <th key={p.id} className="text-left py-3 px-4 text-white font-medium min-w-[150px]">
                    {p.title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-neutral-900">
                <td className="py-3 px-4 text-neutral-500">Category</td>
                {selectedProjects.map(p => (
                  <td key={p.id} className="py-3 px-4 text-white">{p.category}</td>
                ))}
              </tr>
              <tr className="border-b border-neutral-900">
                <td className="py-3 px-4 text-neutral-500">Type</td>
                {selectedProjects.map(p => (
                  <td key={p.id} className="py-3 px-4 text-white">{p.type || '-'}</td>
                ))}
              </tr>
              <tr className="border-b border-neutral-900">
                <td className="py-3 px-4 text-neutral-500">Client</td>
                {selectedProjects.map(p => (
                  <td key={p.id} className="py-3 px-4 text-white">{p.client || '-'}</td>
                ))}
              </tr>
              <tr className="border-b border-neutral-900">
                <td className="py-3 px-4 text-neutral-500">Year</td>
                {selectedProjects.map(p => (
                  <td key={p.id} className="py-3 px-4 text-white">{p.year || '-'}</td>
                ))}
              </tr>
              <tr className="border-b border-neutral-900">
                <td className="py-3 px-4 text-neutral-500">Featured</td>
                {selectedProjects.map(p => (
                  <td key={p.id} className="py-3 px-4 text-white">{p.isFeatured ? 'Yes' : 'No'}</td>
                ))}
              </tr>
              <tr className="border-b border-neutral-900">
                <td className="py-3 px-4 text-neutral-500">Gallery Size</td>
                {selectedProjects.map(p => (
                  <td key={p.id} className="py-3 px-4 text-white">{p.galleryImages?.length || 0} images</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {selected.length < 2 && (
        <p className="text-xs text-neutral-600 text-center py-4">
          Select at least 2 projects to compare
        </p>
      )}
    </div>
  )
}
