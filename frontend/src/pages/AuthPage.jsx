"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { Mail, Lock, User, AlertCircle } from "lucide-react"
import { useAuth } from "../contexts/AuthContext"

export default function AuthPage() {
  const navigate = useNavigate()
  const { signIn, signUp } = useAuth()
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  })

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (isLogin) {
        const { error } = await signIn(formData.email, formData.password)
        if (error) throw error
        navigate("/dashboard")
      } else {
        const { error } = await signUp(formData.email, formData.password, { name: formData.name })
        if (error) throw error
        setError("Compte créé ! Vérifiez votre email pour confirmer votre inscription.")
      }
    } catch (err) {
      setError(err.message || "Une erreur s'est produite")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          {/* Logo */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold gradient-text mb-2">Obli</h1>
            <p className="text-muted-foreground">
              {isLogin ? "Connectez-vous à votre compte" : "Créez votre compte gratuitement"}
            </p>
          </div>

          {/* Auth Card */}
          <div className="glass rounded-2xl p-8">
            {/* Toggle Tabs */}
            <div className="flex gap-2 glass rounded-xl p-1 mb-6">
              <button
                onClick={() => {
                  setIsLogin(true)
                  setError(null)
                }}
                className={`flex-1 py-2 rounded-lg transition-colors text-sm font-semibold ${
                  isLogin ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                }`}
              >
                Connexion
              </button>
              <button
                onClick={() => {
                  setIsLogin(false)
                  setError(null)
                }}
                className={`flex-1 py-2 rounded-lg transition-colors text-sm font-semibold ${
                  !isLogin ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                }`}
              >
                Inscription
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mb-4 p-4 rounded-xl flex items-start gap-3 ${
                  error.includes("créé")
                    ? "bg-secondary/10 text-secondary border border-secondary/20"
                    : "bg-destructive/10 text-destructive border border-destructive/20"
                }`}
              >
                <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                <p className="text-sm">{error}</p>
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="block text-sm font-semibold mb-2">Nom complet</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder="John Doe"
                      className="w-full pl-12 pr-4 py-3 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                      required={!isLogin}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="john@example.com"
                    className="w-full pl-12 pr-4 py-3 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Mot de passe</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-3 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                    required
                    minLength={6}
                  />
                </div>
                {!isLogin && <p className="mt-2 text-xs text-muted-foreground">Minimum 6 caractères</p>}
              </div>

              {isLogin && (
                <div className="text-right">
                  <button type="button" className="text-sm text-primary hover:underline">
                    Mot de passe oublié ?
                  </button>
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold glow-primary hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Chargement..." : isLogin ? "Se Connecter" : "Créer un Compte"}
              </motion.button>
            </form>
          </div>

          {/* Additional Info */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            En continuant, vous acceptez nos{" "}
            <a href="#" className="text-primary hover:underline">
              Conditions d'utilisation
            </a>{" "}
            et notre{" "}
            <a href="#" className="text-primary hover:underline">
              Politique de confidentialité
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
