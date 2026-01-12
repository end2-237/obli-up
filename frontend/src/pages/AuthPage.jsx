// frontend/src/pages/AuthPageWithReferral.jsx
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Mail, Lock, User, AlertCircle, CheckCircle, Users } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { sponsorService } from "../services/sponsorService";

export default function AuthPageWithReferral() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signIn, signUp } = useAuth();
  
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sponsorInfo, setSponsorInfo] = useState(null);
  const [referralCode, setReferralCode] = useState("");
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  });

  // Détecter le code de parrainage dans l'URL
  useEffect(() => {
    const refCode = searchParams.get('ref');
    if (refCode) {
      setReferralCode(refCode);
      loadSponsorInfo(refCode);
    }
  }, [searchParams]);

  const loadSponsorInfo = async (code) => {
    try {
      const sponsor = await sponsorService.getSponsorByCode(code);
      setSponsorInfo(sponsor);
    } catch (error) {
      console.error('Code de parrainage invalide:', error);
      setError('Code de parrainage invalide');
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await signIn(formData.email, formData.password);
        if (error) throw error;
        navigate("/dashboard");
      } else {
        const { data, error } = await signUp(
          formData.email, 
          formData.password, 
          { name: formData.name }
        );
        
        if (error) throw error;

        if (referralCode && data.user) {
          try {
            await sponsorService.createReferral(referralCode, data.user.id);
          } catch (refError) {
            console.error('Erreur création affiliation:', refError);
          }
        }

        setError("✅ Compte créé ! Vérifiez votre email pour confirmer votre inscription.");
      }
    } catch (err) {
      setError(err.message || "Une erreur s'est produite");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold gradient-text mb-2">Obli</h1>
            <p className="text-muted-foreground">
              {isLogin ? "Connectez-vous à votre compte" : "Créez votre compte gratuitement"}
            </p>
          </div>

          {sponsorInfo && !isLogin && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-primary/10 border border-primary/20 rounded-xl"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                  <Users size={20} className="text-primary" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-sm">Parrainé par</div>
                  <div className="text-xs text-muted-foreground">
                    {sponsorInfo.users?.email || 'Un membre Obli'}
                  </div>
                </div>
                <CheckCircle size={20} className="text-primary" />
              </div>
            </motion.div>
          )}

          <div className="glass rounded-2xl p-8">
            <div className="flex gap-2 glass rounded-xl p-1 mb-6">
              <button
                onClick={() => {
                  setIsLogin(true);
                  setError(null);
                }}
                className={`flex-1 py-2 rounded-lg transition-colors text-sm font-semibold ${
                  isLogin ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                }`}
              >
                Connexion
              </button>
              <button
                onClick={() => {
                  setIsLogin(false);
                  setError(null);
                }}
                className={`flex-1 py-2 rounded-lg transition-colors text-sm font-semibold ${
                  !isLogin ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                }`}
              >
                Inscription
              </button>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mb-4 p-4 rounded-xl flex items-start gap-3 ${
                  error.includes("✅")
                    ? "bg-secondary/10 text-secondary border border-secondary/20"
                    : "bg-destructive/10 text-destructive border border-destructive/20"
                }`}
              >
                <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                <p className="text-sm">{error}</p>
              </motion.div>
            )}

            <div className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="block text-sm font-semibold mb-2">Nom complet</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder="Jean Dupont"
                      className="w-full pl-12 pr-4 py-3 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
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
                    placeholder="jean@example.com"
                    className="w-full pl-12 pr-4 py-3 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
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
                onClick={handleSubmit}
                disabled={loading}
                className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold glow-primary hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Chargement..." : isLogin ? "Se Connecter" : "Créer un Compte"}
              </motion.button>
            </div>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6">
            En continuant, vous acceptez nos{" "}
            <a href="#" className="text-primary hover:underline">
              Conditions d'utilisation
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}