"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Package, Search, MessageSquare, Settings, Plus, Edit, Trash2, Eye } from "lucide-react"
import { Link } from "react-router-dom"

// Mock data - sera remplacé par Supabase
const mockUserItems = {
  lost: [
    {
      id: 1,
      title: "iPhone 14 Pro",
      category: "Électronique",
      status: "active",
      date: "2025-01-15",
      views: 45,
      messages: 3,
    },
    {
      id: 2,
      title: "Portefeuille Cuir",
      category: "Accessoires",
      status: "found",
      date: "2025-01-10",
      views: 28,
      messages: 1,
    },
  ],
  found: [
    {
      id: 3,
      title: "Clés de voiture",
      category: "Clés",
      status: "claimed",
      date: "2025-01-12",
      views: 67,
      messages: 8,
    },
  ],
}

const mockMessages = [
  {
    id: 1,
    itemTitle: "iPhone 14 Pro",
    sender: "Marie Dubois",
    message: "Bonjour, je pense avoir retrouvé votre téléphone...",
    date: "2025-01-16",
    unread: true,
  },
  {
    id: 2,
    itemTitle: "iPhone 14 Pro",
    sender: "Thomas Martin",
    message: "Pouvez-vous me donner plus de détails sur la coque ?",
    date: "2025-01-15",
    unread: true,
  },
  {
    id: 3,
    itemTitle: "Portefeuille Cuir",
    sender: "Sophie Bernard",
    message: "J'ai peut-être vu votre portefeuille...",
    date: "2025-01-14",
    unread: false,
  },
]

const stats = [
  { label: "Objets Perdus", value: 2, icon: Search, color: "destructive" },
  { label: "Objets Trouvés", value: 1, icon: Package, color: "secondary" },
  { label: "Messages", value: 3, icon: MessageSquare, color: "accent" },
  { label: "Vues Totales", value: 140, icon: Eye, color: "primary" },
]

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("lost")

  const getStatusBadge = (status) => {
    const badges = {
      active: { label: "Actif", className: "bg-primary/20 text-primary" },
      found: { label: "Retrouvé", className: "bg-secondary/20 text-secondary" },
      claimed: { label: "Récupéré", className: "bg-accent/20 text-accent" },
    }
    return badges[status] || badges.active
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary/10 to-secondary/10 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl sm:text-5xl font-bold mb-4">Mon Espace</h1>
                <p className="text-lg text-muted-foreground">Gérez vos déclarations et messages</p>
              </div>
              <Link to="/report">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2 glow-primary"
                >
                  <Plus size={20} />
                  <span className="hidden sm:inline">Nouvelle Déclaration</span>
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-${stat.color}/10 flex items-center justify-center`}>
                  <stat.icon className={`text-${stat.color}`} size={24} />
                </div>
                <div className="text-3xl font-bold">{stat.value}</div>
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items List */}
          <div className="lg:col-span-2">
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Mes Déclarations</h2>
                <div className="flex gap-2 glass rounded-xl p-1">
                  <button
                    onClick={() => setActiveTab("lost")}
                    className={`px-4 py-2 rounded-lg transition-colors text-sm font-semibold ${
                      activeTab === "lost" ? "bg-destructive/20 text-destructive" : "hover:bg-muted"
                    }`}
                  >
                    Perdus ({mockUserItems.lost.length})
                  </button>
                  <button
                    onClick={() => setActiveTab("found")}
                    className={`px-4 py-2 rounded-lg transition-colors text-sm font-semibold ${
                      activeTab === "found" ? "bg-secondary/20 text-secondary" : "hover:bg-muted"
                    }`}
                  >
                    Trouvés ({mockUserItems.found.length})
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {mockUserItems[activeTab].map((item) => {
                  const badge = getStatusBadge(item.status)
                  return (
                    <div
                      key={item.id}
                      className="bg-card border border-border rounded-xl p-4 hover:border-primary/50 transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold mb-1">{item.title}</h3>
                          <p className="text-sm text-muted-foreground">{item.category}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.className}`}>
                          {badge.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-6 text-sm text-muted-foreground mb-4">
                        <div className="flex items-center gap-1">
                          <Eye size={16} />
                          <span>{item.views} vues</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageSquare size={16} />
                          <span>{item.messages} messages</span>
                        </div>
                        <div>
                          <span>{new Date(item.date).toLocaleDateString("fr-FR")}</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Link to={`/items/${item.id}`} className="flex-1">
                          <button className="w-full px-4 py-2 glass rounded-lg hover:bg-muted transition-colors text-sm font-semibold">
                            Voir
                          </button>
                        </Link>
                        <button className="px-4 py-2 glass rounded-lg hover:bg-muted transition-colors">
                          <Edit size={16} />
                        </button>
                        <button className="px-4 py-2 glass rounded-lg hover:bg-destructive/20 transition-colors text-destructive">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Messages & Settings */}
          <div className="space-y-6">
            {/* Messages */}
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Messages</h2>
                <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-xs font-semibold">
                  {mockMessages.filter((m) => m.unread).length} nouveaux
                </span>
              </div>

              <div className="space-y-3">
                {mockMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`p-4 rounded-xl border transition-all cursor-pointer hover:border-primary/50 ${
                      message.unread ? "bg-primary/5 border-primary/20" : "bg-card border-border"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="font-semibold text-sm">{message.sender}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(message.date).toLocaleDateString("fr-FR")}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground mb-2">{message.itemTitle}</div>
                    <p className="text-sm line-clamp-2">{message.message}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Settings */}
            <div className="glass rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Settings size={20} />
                Paramètres Rapides
              </h2>
              <div className="space-y-3">
                <button className="w-full px-4 py-3 bg-card rounded-xl hover:bg-muted transition-colors text-left text-sm">
                  Notifications
                </button>
                <button className="w-full px-4 py-3 bg-card rounded-xl hover:bg-muted transition-colors text-left text-sm">
                  Confidentialité
                </button>
                <button className="w-full px-4 py-3 bg-card rounded-xl hover:bg-muted transition-colors text-left text-sm">
                  Mon Profil
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
