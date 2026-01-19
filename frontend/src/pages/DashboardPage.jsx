// frontend/src/pages/DashboardPage.jsx
"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Package, Search, MessageSquare, Settings, Plus, Edit, Trash2, Eye, Loader2, CheckCircle, Bell } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { itemService } from "../services/itemService"
import SponsorDashboard from "../components/SponsorDashboard"
import { useUnreadMessages } from "../hooks/useUnreadMessages"

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("lost") 
  const [itemTypeTab, setItemTypeTab] = useState("lost") 
  const [userItems, setUserItems] = useState({ lost: [], found: [] })
  const [stats, setStats] = useState({
    lostItems: 0,
    foundItems: 0,
    messages: 0,
    totalViews: 0
  })
  const [loading, setLoading] = useState(true)
  const { unreadCount, recentMessages } = useUnreadMessages()

  useEffect(() => {
    if (user) {
      loadUserData()
    }
  }, [user])

  const loadUserData = async () => {
    try {
      setLoading(true)

      const items = await itemService.getUserItems(user.id)
      const lost = items.filter(item => item.type === 'lost')
      const found = items.filter(item => item.type === 'found')
      
      setUserItems({ lost, found })

      const statsData = await itemService.getStats(user.id)
      setStats(statsData)

    } catch (error) {
      console.error('Erreur lors du chargement des données:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (itemId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet objet ?')) {
      return
    }

    try {
      await itemService.deleteItem(itemId)
      loadUserData()
      alert('✅ Objet supprimé avec succès')
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      alert('❌ Erreur lors de la suppression')
    }
  }

  const handleMarkAsReturned = async (itemId) => {
    if (!window.confirm('Confirmer que cet objet a été retrouvé/rendu à son propriétaire ?')) {
      return
    }

    try {
      await itemService.markAsReturned(itemId)
      loadUserData()
      alert('✅ Objet marqué comme retrouvé')
    } catch (error) {
      console.error('Erreur:', error)
      alert('❌ Erreur lors de la mise à jour')
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      active: { label: "Actif", className: "bg-primary/20 text-primary" },
      found: { label: "Retrouvé", className: "bg-green-500/20 text-green-600" },
      returned: { label: "Rendu", className: "bg-secondary/20 text-secondary" },
      claimed: { label: "Récupéré", className: "bg-accent/20 text-accent" },
    }
    return badges[status] || badges.active
  }

  const statsConfig = [
    { label: "Objets Perdus", value: stats.lostItems, icon: Search, color: "destructive" },
    { label: "Objets Trouvés", value: stats.foundItems, icon: Package, color: "secondary" },
    { label: "Messages", value: unreadCount, icon: MessageSquare, color: "accent", badge: unreadCount > 0 },
    { label: "Vues Totales", value: stats.totalViews, icon: Eye, color: "primary" },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="">
        <div className="flex rounded-xl bg-gray-100 p-1">
          <button
            type="button"
            onClick={() => setActiveTab("lost")}
            aria-current={activeTab === "lost"}
            className={`w-1/2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
              activeTab === "lost"
                ? "bg-white text-gray-900 shadow"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Mes objets
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("sponsor")}
            aria-current={activeTab === "sponsor"}
            className={`w-1/2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
              activeTab === "sponsor"
                ? "bg-white text-gray-900 shadow"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Parrainage
          </button>
        </div>
      </div>

      {activeTab === "lost" && (
        <div>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {statsConfig.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass rounded-2xl p-6 relative"
                >
                  {stat.badge && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">{stat.value}</span>
                    </div>
                  )}
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
              <div className="lg:col-span-2">
                <div className="glass rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">Mes Déclarations</h2>
                    <div className="flex gap-2 glass rounded-xl p-1">
                      <button
                        onClick={() => setItemTypeTab("lost")}
                        className={`px-4 py-2 rounded-lg transition-colors text-sm font-semibold ${
                          itemTypeTab === "lost" ? "bg-destructive/20 text-destructive" : "hover:bg-muted"
                        }`}
                      >
                        Perdus ({userItems.lost.length})
                      </button>
                      <button
                        onClick={() => setItemTypeTab("found")}
                        className={`px-4 py-2 rounded-lg transition-colors text-sm font-semibold ${
                          itemTypeTab === "found" ? "bg-secondary/20 text-secondary" : "hover:bg-muted"
                        }`}
                      >
                        Trouvés ({userItems.found.length})
                      </button>
                    </div>
                  </div>
  
                  <div className="space-y-4">
                    {userItems[itemTypeTab].length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                          <Package className="text-muted-foreground" size={32} />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Aucun objet</h3>
                        <p className="text-muted-foreground mb-4">
                          Vous n'avez pas encore déclaré d'objet {itemTypeTab === 'lost' ? 'perdu' : 'trouvé'}
                        </p>
                        <Link to="/report">
                          <button className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors">
                            Déclarer un objet
                          </button>
                        </Link>
                      </div>
                    ) : (
                      userItems[itemTypeTab].map((item) => {
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
                              
                              {item.type === 'found' && item.status === 'active' && (
                                <button 
                                  onClick={() => handleMarkAsReturned(item.id)}
                                  className="px-4 py-2 glass rounded-lg hover:bg-green-500/20 transition-colors text-green-600"
                                  title="Marquer comme retrouvé"
                                >
                                  <CheckCircle size={16} />
                                </button>
                              )}
                              
                              <button 
                                className="px-4 py-2 glass rounded-lg hover:bg-muted transition-colors"
                                title="Modifier"
                              >
                                <Edit size={16} />
                              </button>
                              <button 
                                onClick={() => handleDelete(item.id)}
                                className="px-4 py-2 glass rounded-lg hover:bg-destructive/20 transition-colors text-destructive"
                                title="Supprimer"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>
              </div>
  
              <div className="space-y-6">
                <div className="glass rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <MessageSquare size={20} />
                      Messages
                    </h2>
                    {unreadCount > 0 && (
                      <span className="px-3 py-1 bg-red-500 text-white rounded-full text-xs font-semibold animate-pulse">
                        {unreadCount} nouveau{unreadCount > 1 ? 'x' : ''}
                      </span>
                    )}
                  </div>
  
                  {recentMessages.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageSquare className="mx-auto mb-4 text-muted-foreground" size={32} />
                      <p className="text-sm text-muted-foreground">Aucun message pour le moment</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {recentMessages.map((msg, idx) => (
                        <div
                          key={idx}
                          onClick={() => navigate(`/chat/${msg.channelId}`)}
                          className="p-3 bg-card rounded-lg hover:bg-muted transition-colors cursor-pointer border border-border"
                        >
                          <div className="flex items-start justify-between mb-1">
                            <p className="font-semibold text-sm">{msg.userName}</p>
                            {msg.unread > 0 && (
                              <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">
                                {msg.unread}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">{msg.text}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(msg.timestamp).toLocaleString('fr-FR')}
                          </p>
                        </div>
                      ))}
                      <Link to="/chat/list">
                        <button className="w-full px-4 py-2 glass rounded-lg hover:bg-muted transition-colors text-sm font-semibold">
                          Voir tous les messages
                        </button>
                      </Link>
                    </div>
                  )}
                </div>
  
                <div className="glass rounded-2xl p-6">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Settings size={20} />
                    Paramètres Rapides
                  </h2>
                  <div className="space-y-3">
                    <button className="w-full px-4 py-3 bg-card rounded-xl hover:bg-muted transition-colors text-left text-sm flex items-center gap-2">
                      <Bell size={16} />
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
      )}
      
      {activeTab === "sponsor" && (
        <SponsorDashboard 
          userId={user.id} 
          userEmail={user.email} 
        />
      )}
    </div>
  )
}