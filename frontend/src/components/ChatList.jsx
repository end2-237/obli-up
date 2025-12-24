"use client"

import { motion } from "framer-motion"
import { MessageSquare } from "lucide-react"
import { Link } from "react-router-dom"

export default function ChatList({ conversations = [] }) {
  const mockConversations = [
    {
      id: "1",
      otherUser: {
        name: "Jean Dupont",
        avatar: "/placeholder-user.jpg",
        online: true,
      },
      lastMessage: "Je serai là vers 15h. Merci encore!",
      timestamp: new Date(Date.now() - 900000),
      unread: 0,
      itemName: "iPhone 14 Pro",
    },
    {
      id: "2",
      otherUser: {
        name: "Marie Martin",
        avatar: "/placeholder-user.jpg",
        online: false,
      },
      lastMessage: "D'accord, on se voit demain!",
      timestamp: new Date(Date.now() - 7200000),
      unread: 2,
      itemName: "Sac à dos Nike",
    },
    {
      id: "3",
      otherUser: {
        name: "Pierre Dubois",
        avatar: "/placeholder-user.jpg",
        online: false,
      },
      lastMessage: "Merci pour votre aide!",
      timestamp: new Date(Date.now() - 86400000),
      unread: 0,
      itemName: "Clés de voiture",
    },
  ]

  const formatTime = (date) => {
    const now = new Date()
    const diff = now - date

    if (diff < 86400000) {
      return new Intl.DateTimeFormat("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(date)
    }

    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "short",
    }).format(date)
  }

  const activeConversations = conversations.length > 0 ? conversations : mockConversations

  if (activeConversations.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <MessageSquare className="text-muted-foreground" size={32} />
        </div>
        <h3 className="text-xl font-semibold mb-2">Aucune conversation</h3>
        <p className="text-muted-foreground">Vos conversations apparaîtront ici</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {activeConversations.map((conversation, index) => (
        <motion.div
          key={conversation.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <Link to={`/chat/${conversation.id}`}>
            <div className="glass rounded-xl p-4 hover:bg-muted/50 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="relative flex-shrink-0">
                  <img
                    src={conversation.otherUser.avatar || "/placeholder.svg"}
                    alt={conversation.otherUser.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  {conversation.otherUser.online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-secondary rounded-full border-2 border-background" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold truncate">{conversation.otherUser.name}</h3>
                    <span className="text-xs text-muted-foreground">{formatTime(conversation.timestamp)}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground truncate flex-1">{conversation.lastMessage}</p>
                    {conversation.unread > 0 && (
                      <span className="ml-2 w-5 h-5 bg-primary text-primary-foreground rounded-full text-xs flex items-center justify-center font-semibold">
                        {conversation.unread}
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-muted-foreground mt-1">
                    <MessageSquare size={12} className="inline mr-1" />
                    {conversation.itemName}
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  )
}
