import { useState } from 'react'

export default function BeforeAfterGallery({ items = [] }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [sliderPosition, setSliderPosition] = useState(50)

  if (!items.length) return null

  const currentItem = items[activeIndex]

  const handleSliderMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = (x / rect.width) * 100
    setSliderPosition(Math.max(0, Math.min(100, percentage)))
  }

  return (
    <div className="w-full">
      {/* Main comparison view */}
      <div className="relative w-full aspect-[16/9] md:aspect-[21/9] overflow-hidden rounded-lg border border-neutral-800">
        {/* Before image (bottom layer) */}
        <img
          src={currentItem.before}
          alt="Before"
          className="absolute inset-0 w-full h-full object-cover"
        />
        
        {/* After image (top layer, clipped) */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: `inset(0 0 0 ${sliderPosition}%)` }}
        >
          <img
            src={currentItem.after}
            alt="After"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ transform: `translateX(-${sliderPosition}%)` }}
          />
        </div>

        {/* Slider handle */}
        <div
          className="absolute inset-0 cursor-ew-resize"
          onMouseMove={handleSliderMove}
          onTouchMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect()
            const x = e.touches[0].clientX - rect.left
            const percentage = (x / rect.width) * 100
            setSliderPosition(Math.max(0, Math.min(100, percentage)))
          }}
        >
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-white"
            style={{ left: `${sliderPosition}%` }}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-neutral-900">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
              </svg>
            </div>
          </div>
        </div>

        {/* Labels */}
        <div className="absolute top-4 left-4 px-3 py-1 bg-black/50 backdrop-blur-sm text-white text-xs rounded">
          Before
        </div>
        <div className="absolute top-4 right-4 px-3 py-1 bg-black/50 backdrop-blur-sm text-white text-xs rounded">
          After
        </div>
      </div>

      {/* Thumbnails */}
      {items.length > 1 && (
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
          {items.map((item, index) => (
            <button
              key={index}
              onClick={() => { setActiveIndex(index); setSliderPosition(50) }}
              className={`flex-shrink-0 w-24 h-16 rounded overflow-hidden border-2 transition-colors ${
                index === activeIndex ? 'border-white' : 'border-neutral-800 hover:border-neutral-600'
              }`}
            >
              <img src={item.after} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Project info */}
      {currentItem.title && (
        <div className="mt-4">
          <h3 className="text-sm font-medium text-white">{currentItem.title}</h3>
          {currentItem.description && (
            <p className="text-xs text-neutral-500 mt-1">{currentItem.description}</p>
          )}
        </div>
      )}
    </div>
  )
}
