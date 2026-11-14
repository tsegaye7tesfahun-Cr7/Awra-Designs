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
        text: "Hi! 👋 Welcome to Awra Designs. I can help you with our services, pricing, timelines, portfolio, and more. What would you like to know?",
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
    const msg = userInput.toLowerCase().trim()

    // Greetings
    if (/^(hi|hello|hey|good morning|good afternoon|good evening|selam|ሰላም)/.test(msg)) {
      return "Hello! 👋 Great to have you here. Are you looking to start a new project, get a quote, or just explore what we do?"
    }

    // Thanks
    if (/thank|thanks|appreciated|great|perfect|awesome/.test(msg)) {
      return "You're very welcome! Feel free to ask anything else — we're happy to help. 😊"
    }

    // Services — general
    if (/service|offer|what do you do|specializ|work on|help with/.test(msg)) {
      return "We offer a full range of design services:\n\n• Architecture & Building Design\n• Interior Design (residential & commercial)\n• 3D Visualization & Renders\n• Finishing & Fit-out Works\n• Building Permit Documentation\n• Branding & Visual Identity\n\nWould you like to know more about any of these?"
    }

    // Architecture
    if (/architect|building design|floor plan|structural|construction drawing|permit drawing/.test(msg)) {
      return "Our architecture team handles everything from initial concept and floor plans to full permit-ready drawing sets prepared to Addis Ababa Building Authority standards. We work on villas, apartments, office buildings, and commercial spaces."
    }

    // Interior design
    if (/interior|bedroom|living room|kitchen|office interior|dining|lounge|suite|residential design/.test(msg)) {
      return "Our interior design service covers space planning, material selection, furniture layout, lighting design, and full supervision through execution. We've completed 80+ residential interiors and 40+ commercial spaces across Ethiopia."
    }

    // 3D visualization / renders
    if (/3d|render|visuali|walkthrough|animation|realistic|view|perspective/.test(msg)) {
      return "Our 3D visualization service delivers photorealistic renders from multiple angles, material and lighting studies, and revision rounds based on your feedback. It's perfect for approving a design before construction starts — no surprises on site."
    }

    // Finishing / fit-out
    if (/finish|fit.?out|fit out|tile|paint|ceiling|gypsum|cladding|flooring|fit-out/.test(msg)) {
      return "Our finishing and fit-out team handles all interior surface work — gypsum ceilings, tiling, painting, joinery, and final detailing. We coordinate directly with contractors to make sure the design is executed exactly as intended."
    }

    // Building permit
    if (/permit|ፍቃድ|kebele|municipality|authority|addis ababa permit|documentation|drawing set/.test(msg)) {
      return "We prepare complete building permit documentation to Addis Ababa City Administration standards — including architectural, structural, and sanitary drawings. You can also use our Permit Fee Calculator on this site to estimate your costs before we begin."
    }

    // Branding
    if (/brand|logo|identity|graphic|visual/.test(msg)) {
      return "Our branding service covers logo design, brand identity systems, and visual communication materials — ideal for businesses launching alongside a new space."
    }

    // Pricing / cost
    if (/price|cost|rate|fee|how much|budget|expensive|affordable|charge|payment/.test(msg)) {
      return "Our pricing depends on project type, scale, and complexity. We offer:\n\n• Fixed-fee contracts for defined scopes\n• Percentage-of-cost models for larger builds\n\nWe provide a free initial estimate after a brief consultation. Would you like to arrange one?"
    }

    // Timeline / duration
    if (/how long|timeline|duration|time|week|month|deadline|when/.test(msg)) {
      return "Typical timelines:\n\n• Single room design: 4–8 weeks\n• Full apartment: 3–4 months\n• Commercial space: 4–6 months\n• Architecture + permit docs: 3–6 weeks\n\nWe share a detailed schedule at the proposal stage so you always know what to expect."
    }

    // Start a project / consultation
    if (/start|begin|consult|how do i|get started|first step|initiate|new project/.test(msg)) {
      return "Starting is simple:\n\n1. Reach out via WhatsApp, phone, or our contact form\n2. We schedule a free initial consultation\n3. We assess your space, vision, and budget\n4. You receive a tailored proposal within a few days\n\nWant me to take you to the contact section?"
    }

    // Free consultation
    if (/free|consultation|initial meeting|no cost|first meeting/.test(msg)) {
      return "Yes — we offer a free initial consultation! No commitment required. We use that session to understand your project, answer your questions, and figure out the best approach together."
    }

    // Portfolio / past work
    if (/portfolio|past work|previous|example|sample|project|completed|show me/.test(msg)) {
      return "Our portfolio is live on this page — scroll up to the Work section to browse completed projects. You can filter by category: Architecture, Residential Interiors, Commercial Design, and more. Each project includes photos and details."
    }

    // Location / outside Addis
    if (/location|where|address|addis|ethiopia|outside|region|city|hawassa|dire dawa|mekelle|jimma/.test(msg)) {
      return "Our studio is based in Addis Ababa. We take on projects across all of Ethiopia — for remote locations we coordinate closely through digital tools and make site visits at key milestones. Distance isn't a barrier for us."
    }

    // Contact / reach
    if (/contact|email|phone|whatsapp|call|reach|get in touch|message/.test(msg)) {
      return "You can reach us through:\n\n📱 WhatsApp: +251 92 381 4125\n📧 Email: info@awradesigns.com\n📍 Location: Addis Ababa, Ethiopia\n\nOr just scroll down to the Contact section and fill in the form — we respond within 24 hours."
    }

    // Team
    if (/team|staff|architect|designer|founder|who|people/.test(msg)) {
      return "Awra Designs was founded by Tesfahun Tsegaye, our Lead Architect. The team includes senior architects, interior designers, 3D artists, and a brand designer — all working together from our Addis Ababa studio."
    }

    // Experience / years
    if (/experience|year|since|how long have|established|founded/.test(msg)) {
      return "We've been designing and building spaces since 2019 — that's 7+ years of experience across 120+ completed projects in Ethiopia, ranging from private villas to commercial offices and hospitality spaces."
    }

    // Reviews / testimonials
    if (/review|testimonial|feedback|client|rating|trust|recommend/.test(msg)) {
      return "We're proud of the relationships we build with clients. You can read testimonials from past clients in the Testimonials section of this page. We've worked with 100+ satisfied clients across Ethiopia."
    }

    // Default fallback — varied so it doesn't always feel the same
    const fallbacks = [
      "That's a great question! For detailed answers, our team is best placed to help. Would you like to contact us via WhatsApp or through the contact form?",
      "I want to make sure you get the right answer. Could you tell me a bit more about your project or what you're looking for?",
      "I'm not sure I fully understand — could you rephrase that? Or if you'd prefer to speak directly with our team, just head to the Contact section below.",
      "Thanks for reaching out! For specific project queries, our team can give you a much more tailored answer. Want me to point you to our contact form?",
    ]
    return fallbacks[Math.floor(Math.random() * fallbacks.length)]
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
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center overflow-hidden border border-neutral-200">
                  <img src="/Logo.svg" alt="Awra Designs" className="w-7 h-7 object-contain" />
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
