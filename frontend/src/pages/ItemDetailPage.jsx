// frontend/src/pages/ItemDetailPage.jsx
"use client"

import { useEffect, useState } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Tag,
  User,
  MessageSquare,
  Share2,
  Lock,
} from "lucide-react"

import { useLanguage } from "../contexts/LanguageContext"
import { useAuth } from "../contexts/AuthContext"
import { supabase } from "../lib/supabase"
import OwnershipVerification from "../components/OwnershipVerification"

import { useStreamChat } from "../contexts/StreamChatContext"
import { createOrGetChannel } from "../utils/chatUtils"

export default function ItemDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useLanguage()
  const { user } = useAuth()

  const { client: chatClient, loading: chatLoading, error: chatError } = useStreamChat()

  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)

  const [selectedImage, setSelectedImage] = useState(0)
  const [showContactForm, setShowContactForm] = useState(false)
  const [hasAccess, setHasAccess] = useState(false)
  const [showVerification, setShowVerification] = useState(false)

  /* =========================
     DATA FETCH
  ========================= */
  useEffect(() => {
    const fetchItem = async () => {
      setLoading(true)

      const { data: itemData, error } = await supabase
        .from("items")
        .select("*")
        .eq("id", id)
        .single()

      if (error || !itemData) {
        console.error('❌ Erreur chargement item:', error)
        navigate("/items")
        return
      }

      // Parsing proof_data
      let proofData = itemData.proof_data
      if (typeof proofData === "string") {
        try { proofData = JSON.parse(proofData) } catch (e) { proofData = null }
      }

      // Récupérer les images
      const { data: imagesData } = await supabase
        .from("item_images")
        .select("image_url")
        .eq("item_id", id)

      setItem({
        ...itemData,
        proofData,
        images: imagesData?.map(i => i.image_url) || [],
        reporter: {
          name: "Utilisateur",
          joinedDate: itemData.created_at,
        },
      })
      setLoading(false)
    }

    fetchItem()
  }, [id, navigate])

  /* =========================
     CHAT LOGIC
  ========================= */
  const handleStartChat = async () => {
    if (!hasAccess) {
      setShowVerification(true)
      return
    }

    if (!chatClient) {
      alert("❌ Erreur : Chat non initialisé")
      console.error("chatClient:", chatClient)
      return
    }

    if (!user) {
      alert("❌ Utilisateur non connecté")
      return
    }

    if (user.id === item.user_id) {
      alert("❌ Vous ne pouvez pas démarrer une conversation avec vous-même.")
      return
    }

    try {
      const channel = await createOrGetChannel(
        chatClient,
        user.id,
        item.user_id,
        item.id,
        item.title
      )

      // Envoyer un message initial si canal vide
      if ((channel.state.messages || []).length === 0) {
        await channel.sendMessage({
          text: `Bonjour, je suis intéressé par votre objet "${item.title}".`,
        })
      }

      navigate(`/chat/${channel.id}`)
    } catch (error) {
      console.error("Erreur handleStartChat:", error)
      alert("Erreur lors du démarrage du chat. Vérifiez la console.")
    }
  }

  const handleVerificationComplete = (success) => {
    if (success) {
      setHasAccess(true)
      setShowVerification(false)
      alert("✅ Accès débloqué avec succès !")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!item) return null

  /* =========================
     RENDER
  ========================= */
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to="/items"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8"
        >
          <ArrowLeft size={20} />
          {t("backToResults")}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* ================= GALLERY ================= */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="glass rounded-2xl overflow-hidden mb-4 relative">
              <img
                src={item.images[selectedImage] || "/placeholder.svg"}
                alt={item.title}
                className={`w-full h-96 object-cover ${!hasAccess ? "blur-lg" : ""}`}
              />

              {!hasAccess && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <button
                    onClick={() => setShowVerification(true)}
                    className="px-8 py-4 bg-primary text-primary-foreground rounded-xl font-semibold flex items-center gap-2"
                  >
                    <Lock size={20} />
                    {t("unlockDetails")} – 500 FCFA
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4">
              {item.images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`rounded-xl overflow-hidden border-2 ${
                    selectedImage === index ? "border-primary" : "border-transparent"
                  }`}
                >
                  <img src={img} className="w-full h-24 object-cover" alt={`Preview ${index + 1}`} />
                </button>
              ))}
            </div>
          </motion.div>

          {/* ================= DETAILS ================= */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="glass rounded-2xl p-6 mb-6">
              <div className="flex items-start justify-between mb-4">
                <h1 className="text-3xl font-bold">{item.title}</h1>
                <span
                  className={`px-4 py-2 rounded-full text-sm font-semibold ${
                    item.type === "lost" ? "bg-destructive/20 text-destructive" : "bg-secondary/20 text-secondary"
                  }`}
                >
                  {item.type === "lost" ? "Perdu" : "Trouvé"}
                </span>
              </div>

              <p className={`mb-6 ${!hasAccess ? "blur-sm select-none" : ""}`}>
                {item.description}
              </p>

              <div className="space-y-3 mb-6">
                <div className="flex gap-2">
                  <Tag size={18} /> {item.category}
                </div>
                <div className={`flex gap-2 ${!hasAccess ? "blur-sm" : ""}`}>
                  <MapPin size={18} />
                  {hasAccess ? item.location : "••••••••"}
                </div>
                <div className="flex gap-2">
                  <Calendar size={18} />
                  {new Date(item.created_at).toLocaleDateString()}
                </div>
              </div>

              {/* Boutons d'action */}
              <div className="flex gap-3">
                <button
                  onClick={() => (hasAccess ? setShowContactForm(!showContactForm) : setShowVerification(true))}
                  className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                >
                  {hasAccess ? (
                    <>
                      <MessageSquare size={20} />
                      Contact
                    </>
                  ) : (
                    <>
                      <Lock size={20} />
                      {t("unlockToContact")}
                    </>
                  )}
                </button>
                <button className="px-6 py-3 glass rounded-xl hover:bg-muted transition-colors flex items-center justify-center">
                  <Share2 size={20} />
                </button>
              </div>
            </div>

            {/* Contact Form */}
            {showContactForm && hasAccess && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="glass rounded-2xl p-6 mb-6"
              >
                <h3 className="text-xl font-semibold mb-4">Envoyer un message</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Votre nom</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Email</label>
                    <input
                      type="email"
                      className="w-full px-4 py-3 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Message</label>
                    <textarea
                      rows={4}
                      className="w-full px-4 py-3 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                      placeholder="Bonjour, je pense que cet objet m'appartient..."
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      alert('Message envoyé ! (Fonctionnalité à implémenter)')
                    }}
                    className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors"
                  >
                    Envoyer le message
                  </button>
                  <button
                    type="button"
                    onClick={handleStartChat}
                    className="w-full px-6 py-3 bg-secondary text-secondary-foreground rounded-xl font-semibold hover:bg-secondary/90 transition-colors"
                  >
                    Démarrer une Conversation
                  </button>
                </div>
              </motion.div>
            )}

            <div className="glass rounded-2xl p-6">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <User size={18} /> Déclaré par
              </h3>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                  <User className="text-primary" size={24} />
                </div>
                <div>
                  <p className="font-semibold">{item.reporter.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Membre depuis {new Date(item.reporter.joinedDate).toLocaleDateString("fr-FR")}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ================= VERIFICATION MODAL ================= */}
      <AnimatePresence>
        {showVerification && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={() => setShowVerification(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-4xl"
              onClick={(e) => e.stopPropagation()}
            >
              <OwnershipVerification
                item={item}
                onVerificationComplete={handleVerificationComplete}
                onClose={() => setShowVerification(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}