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

export default function ItemDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useLanguage()
  const { user } = useAuth()

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
        console.error(error)
        navigate("/items")
        return
      }

      const { data: imagesData } = await supabase
        .from("item_images")
        .select("image_url")
        .eq("item_id", id)

      setItem({
        ...itemData,
        images: imagesData?.map(i => i.image_url) || [],
        image: imagesData?.[0]?.image_url || null,
        reporter: {
          name: "Utilisateur",
          joinedDate: itemData.created_at,
          itemsReported: 0,
        },
      })

      setLoading(false)
    }

    fetchItem()
  }, [id, navigate])

  const handleVerificationComplete = (success) => {
    if (success) {
      setHasAccess(true)
      setShowVerification(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Chargement…
      </div>
    )
  }

  if (!item) return null

  /* =========================
     RENDER
  ========================= */
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
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
                  <img src={img} className="w-full h-24 object-cover" />
                </button>
              ))}
            </div>
          </motion.div>

          {/* ================= DETAILS ================= */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="glass rounded-2xl p-6 mb-6">
              <h1 className="text-3xl font-bold mb-4">{item.title}</h1>

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

              <button
                onClick={() =>
                  hasAccess ? setShowContactForm(true) : setShowVerification(true)
                }
                className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-xl"
              >
                {hasAccess ? t("contact") : t("unlockToContact")}
              </button>
            </div>

            <div className="glass rounded-2xl p-6">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <User size={18} /> Déclaré par
              </h3>
              <p>{item.reporter.name}</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ================= VERIFICATION MODAL ================= */}
      <AnimatePresence>
        {showVerification && (
          <motion.div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <OwnershipVerification
              item={item}
              onVerificationComplete={handleVerificationComplete}
              onClose={() => setShowVerification(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
