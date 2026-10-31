import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  useEffect(() => {
    // Load messages from localStorage
    const saved = localStorage.getItem('chat_messages')
    if (saved) {
      setMessages(JSON.parse(saved))
    } else {
      // Welcome message
      const welcomeMsg = {
        id: 1,
        text: "Hi! 👋 Welcome to Awra Designs. How can I help you today?",
        sender: 'bot',
        timestamp: new Date().toISOString()
      }
      setMessages([welcomeMsg])
      localStorage.setItem('chat_messages', JSON.stringify([welcomeMsg]))
    }
  }, [])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage = {
      id: Date.now(),
      text: input,
      sender: 'user',
      timestamp: new Date().toISOString()
    }

    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    localStorage.setItem('chat_messages', JSON.stringify(updatedMessages))
    setInput('')
    setIsTyping(true)

    // Send to backend
    try {
      await fetch('https://awra-designs.onrender.com/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userMessage)
      })
    } catch (err) {
      console.error('Failed to send message:', err)
    }

    // Simulate bot response
    setTimeout(() => {
      const botResponse = generateBotResponse(input)
      const botMessage = {
        id: Date.now() + 1,
        text: botResponse,
        sender: 'bot',
        timestamp: new Date().toISOString()
      }
      const newMessages = [...updatedMessages, botMessage]
      setMessages(newMessages)
      localStorage.setItem('chat_messages', JSON.stringify(newMessages))
      setIsTyping(false)
    }, 1500)
  }

  const generateBotResponse = (userInput) => {
    const input = userInput.toLowerCase()

    if (input.includes('service') || input.includes('offer') || input.includes('do')) {
      return "We offer architectural design, interior planning, finishing work, and branding services. Would you like to see our portfolio or discuss a specific project?"
    } else if (input.includes('price') || input.includes('cost') || input.includes('rate')) {
      return "Our pricing varies based on project scope and requirements. I'd be happy to arrange a consultation to provide you with a detailed quote. What type of project are you considering?"
    } else if (input.includes('contact') || input.includes('email') || input.includes('phone')) {
      return "You can reach us at contact@awradesigns.pro.et or call us at +251 911 234 567. You can also fill out the contact form on our website."
    } else if (input.includes('location') || input.includes('where') || input.includes('address')) {
      return "We're based in Addis Ababa, Ethiopia. Feel free to visit our office or schedule a site visit for your project."
    } else if (input.includes('portfolio') || input.includes('work') || input.includes('project')) {
      return "Check out our Work section to see our completed projects! We specialize in residential and commercial spaces. Would you like to see a specific type of project?"
    } else if (input.includes('hello') || input.includes('hi') || input.includes('hey')) {
      return "Hello! How can I assist you with your design project today?"
    } else if (input.includes('thank')) {
      return "You're welcome! If you have any more questions, feel free to ask. We're here to help!"
    } else {
      return "Thanks for your message! I'll pass this along to our team. For detailed inquiries, please use our contact form or email us directly. Is there anything specific about our services you'd like to know?"
    }
  }

  const clearChat = () => {
    const welcomeMsg = {
      id: Date.now(),
      text: "Hi! 👋 Welcome to Awra Designs. How can I help you today?",
      sender: 'bot',
      timestamp: new Date().toISOString()
    }
    setMessages([welcomeMsg])
    localStorage.setItem('chat_messages', JSON.stringify([welcomeMsg]))
  }

  return (
    <>
      {/* Chat Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-white text-neutral-900 rounded-full shadow-2xl flex items-center justify-center hover:bg-neutral-100 transition-colors"
      >
        {isOpen ? (
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-50 w-80 h-96 bg-neutral-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-neutral-800"
          >
            {/* Header */}
            <div className="bg-neutral-800 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                  <span className="text-lg">🏠</span>
                </div>
                <div>
                  <h3 className="text-white font-medium text-sm">Awra Designs</h3>
                  <p className="text-neutral-400 text-xs">Online</p>
                </div>
              </div>
              <button
                onClick={clearChat}
                className="text-neutral-400 hover:text-white transition-colors"
                title="Clear chat"
              >
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${
                      msg.sender === 'user'
                        ? 'bg-white text-neutral-900 rounded-br-none'
                        : 'bg-neutral-800 text-white rounded-bl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-neutral-800 px-3 py-2 rounded-2xl rounded-bl-none flex gap-1">
                    <span className="w-2 h-2 bg-neutral-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-neutral-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-neutral-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 border-t border-neutral-800">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-neutral-800 text-white px-4 py-2 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-white/20 placeholder-neutral-500"
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="w-10 h-10 bg-white text-neutral-900 rounded-full flex items-center justify-center hover:bg-neutral-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
