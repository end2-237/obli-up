"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Send, ArrowLeft, MoreVertical, ImageIcon, Paperclip, Phone, Video } from "lucide-react"
import { useTranslation } from "react-i18next"
import { useAuth } from "../contexts/AuthContext"

export default function ChatPage() {
  const { conversationId } = useParams()
  const { user } = useAuth()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const messagesEndRef = useRef(null)

  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState([
    {
      id: 1,
      senderId: "other",
      senderName: "Jean Dupont",
      content: "Bonjour! J'ai trouvé votre iPhone près de la station de métro.",
      timestamp: new Date(Date.now() - 3600000),
      read: true,
    },
    {
      id: 2,
      senderId: user?.id || "me",
      senderName: "Moi",
      content: "Merci beaucoup! Où pouvons-nous nous rencontrer?",
      timestamp: new Date(Date.now() - 3000000),
      read: true,
    },
    {
      id: 3,
      senderId: "other",
      senderName: "Jean Dupont",
      content: "Je suis disponible demain après-midi au café près de la gare.",
      timestamp: new Date(Date.now() - 1800000),
      read: true,
    },
    {
      id: 4,
      senderId: user?.id || "me",
      senderName: "Moi",
      content: "Parfait! Je serai là vers 15h. Merci encore!",
      timestamp: new Date(Date.now() - 900000),
      read: true,
    },
  ])

  const [otherUser] = useState({
    name: "Jean Dupont",
    avatar: "/placeholder-user.jpg",
    online: true,
    lastSeen: new Date(),
  })

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = (e) => {
    e.preventDefault()
    if (!message.trim()) return

    const newMessage = {
      id: messages.length + 1,
      senderId: user?.id || "me",
      senderName: "Moi",
      content: message,
      timestamp: new Date(),
      read: false,
    }

    setMessages([...messages, newMessage])
    setMessage("")

    // Simulate other user typing and responding
    setTimeout(() => {
      const response = {
        id: messages.length + 2,
        senderId: "other",
        senderName: otherUser.name,
        content: "Message reçu! Je vous réponds bientôt.",
        timestamp: new Date(),
        read: false,
      }
      setMessages((prev) => [...prev, response])
    }, 2000)
  }

  const formatTime = (date) => {
    return new Intl.DateTimeFormat("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const formatDate = (date) => {
    const today = new Date()
    const messageDate = new Date(date)

    if (messageDate.toDateString() === today.toDateString()) {
      return "Aujourd'hui"
    }

    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (messageDate.toDateString() === yesterday.toDateString()) {
      return "Hier"
    }

    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "long",
    }).format(messageDate)
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-background">
      {/* Chat Header */}
      <div className="glass border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/dashboard")} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <ArrowLeft size={20} />
          </button>

          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={otherUser.avatar || "/placeholder.svg"}
                alt={otherUser.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              {otherUser.online && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-secondary rounded-full border-2 border-background" />
              )}
            </div>

            <div>
              <div className="font-semibold">{otherUser.name}</div>
              <div className="text-xs text-muted-foreground">
                {otherUser.online ? "En ligne" : `Vu ${formatTime(otherUser.lastSeen)}`}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-muted rounded-lg transition-colors">
            <Phone size={20} />
          </button>
          <button className="p-2 hover:bg-muted rounded-lg transition-colors">
            <Video size={20} />
          </button>
          <button className="p-2 hover:bg-muted rounded-lg transition-colors">
            <MoreVertical size={20} />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => {
          const showDate = index === 0 || formatDate(messages[index - 1].timestamp) !== formatDate(msg.timestamp)

          return (
            <div key={msg.id}>
              {showDate && (
                <div className="text-center my-4">
                  <span className="px-3 py-1 text-xs bg-muted rounded-full text-muted-foreground">
                    {formatDate(msg.timestamp)}
                  </span>
                </div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.senderId === (user?.id || "me") ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] ${
                    msg.senderId === (user?.id || "me")
                      ? "bg-primary text-primary-foreground"
                      : "glass border border-border"
                  } rounded-2xl px-4 py-2`}
                >
                  <p className="text-sm break-words">{msg.content}</p>
                  <div
                    className={`text-xs mt-1 ${
                      msg.senderId === (user?.id || "me") ? "text-primary-foreground/70" : "text-muted-foreground"
                    }`}
                  >
                    {formatTime(msg.timestamp)}
                  </div>
                </div>
              </motion.div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="glass border-t border-border px-4 py-3">
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <button type="button" className="p-2 hover:bg-muted rounded-lg transition-colors">
            <Paperclip size={20} className="text-muted-foreground" />
          </button>

          <button type="button" className="p-2 hover:bg-muted rounded-lg transition-colors">
            <ImageIcon size={20} className="text-muted-foreground" />
          </button>

          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Écrivez votre message..."
            className="flex-1 px-4 py-2 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground"
          />

          <button
            type="submit"
            disabled={!message.trim()}
            className="p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  )
}
