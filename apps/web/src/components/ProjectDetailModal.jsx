import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import SocialShare from './SocialShare'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export default function ProjectDetailModal({ isOpen, onClose, projectId, lang = 'en' }) {
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isOpen || !projectId) {
      setProject(null)
      return
    }

    const fetchProject = async () => {
      setLoading(true)
      try {
        const res = await fetch(`${API_URL}/projects/${projectId}`)
        const data = await res.json()
        if (data.success && data.data) {
          setProject(data.data)
        }
      } catch (err) {
        console.error('Failed to fetch project:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchProject()
  }, [isOpen, projectId])

  useEffect(() => {
    if (!isOpen) return
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="relative bg-[#0a0a0a] border border-neutral-800 w-full max-w-4xl max-h-[90vh] overflow-hidden"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 text-neutral-500 hover:text-white transition-colors"
                aria-label="Close"
              >
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Scrollable content */}
              <div className="overflow-y-auto max-h-[90vh]">
                {loading ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="w-8 h-8 border border-neutral-700 border-t-white rounded-full animate-spin" />
                  </div>
                ) : project ? (
                  <div>
                    {/* Cover Image */}
                    {project.coverImage && (
                      <div className="relative w-full h-64 md:h-80">
                        <img src={project.coverImage} alt={project.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent" />
                      </div>
                    )}

                    {/* Content */}
                    <div className="p-6 md:p-8">
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div>
                          <p className="text-xs text-neutral-500 uppercase tracking-wider mb-2">{project.category}</p>
                          <h2 className="text-2xl md:text-3xl font-medium text-white">{project.title}</h2>
                        </div>
                        <SocialShare 
                          title={project.title}
                          url={typeof window !== 'undefined' ? window.location.href : undefined}
                          description={project.shortDescription || project.description}
                        />
                      </div>
                      
                      {project.shortDescription && (
                        <p className="text-sm text-neutral-400 mb-6">{project.shortDescription}</p>
                      )}

                      {/* Gallery */}
                      {project.galleryImages && project.galleryImages.length > 0 && (
                        <div className="mb-6">
                          <h3 className="text-sm font-medium text-white mb-3">Gallery</h3>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {project.galleryImages.map((img, i) => (
                              <img key={i} src={img} alt="" className="w-full h-32 object-cover rounded" />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Full Description */}
                      {project.description && (
                        <div className="mb-6">
                          <h3 className="text-sm font-medium text-white mb-3">About This Project</h3>
                          <div 
                            className="text-sm text-neutral-400 leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: project.description }}
                          />
                        </div>
                      )}

                      {/* Meta Info */}
                      <div className="grid grid-cols-2 gap-4 pt-6 border-t border-neutral-900">
                        {project.client && (
                          <div>
                            <p className="text-[10px] text-neutral-600 uppercase tracking-wider mb-1">Client</p>
                            <p className="text-sm text-white">{project.client}</p>
                          </div>
                        )}
                        {project.year && (
                          <div>
                            <p className="text-[10px] text-neutral-600 uppercase tracking-wider mb-1">Year</p>
                            <p className="text-sm text-white">{project.year}</p>
                          </div>
                        )}
                        {project.type && (
                          <div>
                            <p className="text-[10px] text-neutral-600 uppercase tracking-wider mb-1">Type</p>
                            <p className="text-sm text-white">{project.type}</p>
                          </div>
                        )}
                        {project.services && project.services.length > 0 && (
                          <div>
                            <p className="text-[10px] text-neutral-600 uppercase tracking-wider mb-1">Services</p>
                            <p className="text-sm text-white">{project.services.join(', ')}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <p className="text-sm text-neutral-500">Failed to load project details</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
