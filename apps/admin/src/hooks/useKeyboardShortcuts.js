import { useEffect } from 'react'

export function useKeyboardShortcuts() {
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Only trigger when not typing in an input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) return
      if (document.activeElement.isContentEditable) return

      // Ctrl/Cmd + S: Save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        const saveButton = document.querySelector('button[type="submit"]')
        if (saveButton) saveButton.click()
      }

      // Ctrl/Cmd + K: Quick search (optional enhancement)
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        const searchInput = document.querySelector('input[type="search"]')
        if (searchInput) searchInput.focus()
      }

      // ESC: Close modals
      if (e.key === 'Escape') {
        const closeButton = document.querySelector('[aria-label="Close"]')
        if (closeButton) closeButton.click()
      }

      // Ctrl/Cmd + /: Open command palette (future enhancement)
      // if ((e.ctrlKey || e.metaKey) && e.key === '/') {
      //   e.preventDefault()
      //   // Open command palette
      // }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])
}
