"use client"

import { useState } from "react"
import { useParams, Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, MapPin, Calendar, Tag, User, MessageSquare, Share2, Lock, CreditCard, Check } from "lucide-react"
import { useLanguage } from "../contexts/LanguageContext"

// Mock data - sera remplacé par Supabase
const mockItem = {
  id: 1,
  title: "iPhone 14 Pro",
  description:
    "Téléphone noir avec coque bleue trouvé dans le métro ligne 6. L'écran a quelques rayures mais le téléphone fonctionne normalement. Il y a un sticker Pokemon à l'arrière de la coque.",
  category: "Électronique",
  location: "Paris 15ème - Métro Dupleix",
  date: "2025-01-15",
  status: "lost",
  images: ["/iphone-front.png", "/iphone-back.png", "/stylish-iphone-case.png"],
  reporter: {
    name: "Jean Dupont",
    joinedDate: "2024-06-15",
    itemsReported: 5,
  },
}

export default function ItemDetailPage() {
  const { id } = useParams()
  const { t } = useLanguage()
  const [selectedImage, setSelectedImage] = useState(0)
  const [showContactForm, setShowContactForm] = useState(false)
  const [hasPaid, setHasPaid] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)

  const handlePayment = async () => {
    setIsProcessingPayment(true)
    // Simulate payment processing
    setTimeout(() => {
      setHasPaid(true)
      setShowPaymentModal(false)
      setIsProcessingPayment(false)
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link to="/items" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8">
          <ArrowLeft size={20} />
          <span>{t("backToResults")}</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
            <div className="glass rounded-2xl overflow-hidden mb-4 relative">
              <img
                src={mockItem.images[selectedImage] || "/placeholder.svg"}
                alt={mockItem.title}
                className={`w-full h-96 object-cover transition-all ${!hasPaid ? "blur-lg" : ""}`}
                crossOrigin="anonymous"
              />
              {!hasPaid && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowPaymentModal(true)}
                    className="px-8 py-4 bg-primary text-primary-foreground rounded-xl font-semibold glow-primary flex items-center gap-3"
                  >
                    <Lock size={20} />
                    {t("unlockDetails")} - 500 FCFA
                  </motion.button>
                </div>
              )}
            </div>
            <div className="grid grid-cols-3 gap-4">
              {mockItem.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`glass rounded-xl overflow-hidden border-2 transition-all ${
                    selectedImage === index ? "border-primary" : "border-transparent hover:border-border"
                  }`}
                >
                  <img
                    src={image || "/placeholder.svg"}
                    alt={`${mockItem.title} ${index + 1}`}
                    className="w-full h-24 object-cover"
                    crossOrigin="anonymous"
                  />
                </button>
              ))}
            </div>
          </motion.div>

          {/* Item Details */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
            <div className="glass rounded-2xl p-6 mb-6">
              <div className="flex items-start justify-between mb-4">
                <h1 className="text-3xl font-bold">{mockItem.title}</h1>
                <span
                  className={`px-4 py-2 rounded-full text-sm font-semibold ${
                    mockItem.status === "lost" ? "bg-destructive/20 text-destructive" : "bg-secondary/20 text-secondary"
                  }`}
                >
                  {mockItem.status === "lost" ? "Perdu" : "Trouvé"}
                </span>
              </div>

              <p className={`text-muted-foreground leading-relaxed mb-6 ${!hasPaid ? "blur-sm select-none" : ""}`}>
                {mockItem.description}
              </p>

              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Tag size={20} className="text-primary" />
                  <span className="font-semibold text-foreground">{t("category")}:</span>
                  <span>{mockItem.category}</span>
                </div>
                <div className={`flex items-center gap-3 text-muted-foreground ${!hasPaid ? "blur-sm" : ""}`}>
                  <MapPin size={20} className="text-primary" />
                  <span className="font-semibold text-foreground">{t("location")}:</span>
                  <span>{hasPaid ? mockItem.location : "••••••••"}</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Calendar size={20} className="text-primary" />
                  <span className="font-semibold text-foreground">{t("date")}:</span>
                  <span>{new Date(mockItem.date).toLocaleDateString(t("locale"))}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => (hasPaid ? setShowContactForm(!showContactForm) : setShowPaymentModal(true))}
                  className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold glow-primary hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                >
                  {hasPaid ? (
                    <>
                      <MessageSquare size={20} />
                      {t("contact")}
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
            {showContactForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="glass rounded-2xl p-6 mb-6"
              >
                <h3 className="text-xl font-semibold mb-4">Envoyer un message</h3>
                <form className="space-y-4">
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
                    type="submit"
                    className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors"
                  >
                    Envoyer le message
                  </button>
                </form>
              </motion.div>
            )}

            {/* Reporter Info */}
            <div className="glass rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <User size={20} className="text-primary" />
                Déclaré par
              </h3>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                  <User className="text-primary" size={24} />
                </div>
                <div>
                  <p className="font-semibold">{mockItem.reporter.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Membre depuis {new Date(mockItem.reporter.joinedDate).toLocaleDateString("fr-FR")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {mockItem.reporter.itemsReported} objet{mockItem.reporter.itemsReported > 1 ? "s" : ""} déclaré
                    {mockItem.reporter.itemsReported > 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {showPaymentModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => !isProcessingPayment && setShowPaymentModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass rounded-2xl p-8 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="text-primary" size={32} />
                </div>
                <h2 className="text-2xl font-bold mb-2">{t("unlockItemDetails")}</h2>
                <p className="text-muted-foreground">{t("paymentDescription")}</p>
              </div>

              <div className="bg-muted/50 rounded-xl p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg">{t("accessFee")}</span>
                  <span className="text-2xl font-bold text-primary">500 FCFA</span>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Check size={16} className="text-primary" />
                    <span>{t("fullDetailsAccess")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check size={16} className="text-primary" />
                    <span>{t("contactOwner")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check size={16} className="text-primary" />
                    <span>{t("instantMessaging")}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handlePayment}
                  disabled={isProcessingPayment}
                  className="w-full px-6 py-4 bg-primary text-primary-foreground rounded-xl font-semibold glow-primary hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isProcessingPayment ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                        className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full"
                      />
                      {t("processing")}
                    </>
                  ) : (
                    <>
                      <CreditCard size={20} />
                      {t("payNow")}
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  disabled={isProcessingPayment}
                  className="w-full px-6 py-3 glass rounded-xl hover:bg-muted transition-colors disabled:opacity-50"
                >
                  {t("cancel")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
