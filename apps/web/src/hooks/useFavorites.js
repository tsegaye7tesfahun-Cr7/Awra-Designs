import { useState, useEffect } from 'react'

const FAVORITES_KEY = 'awra_favorites'

export function useFavorites() {
  const [favorites, setFavorites] = useState([])

  useEffect(() => {
    const stored = localStorage.getItem(FAVORITES_KEY)
    if (stored) {
      try {
        setFavorites(JSON.parse(stored))
      } catch (e) {
        console.error('Failed to parse favorites:', e)
      }
    }
  }, [])

  const toggleFavorite = (projectId) => {
    setFavorites(prev => {
      const newFavorites = prev.includes(projectId)
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites))
      return newFavorites
    })
  }

  const isFavorite = (projectId) => favorites.includes(projectId)

  const clearFavorites = () => {
    setFavorites([])
    localStorage.removeItem(FAVORITES_KEY)
  }

  return { favorites, toggleFavorite, isFavorite, clearFavorites }
}
