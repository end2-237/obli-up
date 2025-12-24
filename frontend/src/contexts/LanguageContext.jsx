"use client"

import { createContext, useContext, useState, useEffect } from "react"

const LanguageContext = createContext()

const translations = {
  en: {
    heroTitle: "Finding What's Lost",
    heroSubtitle: "Connecting What Matters",
    heroDescription: "The premium platform for lost & found items. Report, search, and recover with ease.",
    report: "Report Lost Item",
    search: "Search Items",
    missionTitle: "Our Mission",
    missionDescription:
      "To simplify the emotional journey of lost belongings. We provide a secure, efficient, and elegant solution for the community.",
    features: "How It Works",
    featuresDescription: "Discover our powerful features designed to help you find what matters most",
    ctaTitle: "Ready to Get Started?",
    ctaDescription: "Join our community and start reporting or finding lost items today",
    ctaButton: "Get Started Now",
    home: "Home",
    reportItem: "Report Item",
    findItem: "Find Item",
    myItems: "My Items",
    qrStore: "QR Store",
    contact: "Contact",
    account: "Account",
    login: "Login",
    logout: "Logout",
    signup: "Sign Up",
    darkMode: "Dark Mode",
    lightMode: "Light Mode",
    backToResults: "Back to results",
    unlockDetails: "Unlock Details",
    unlockToContact: "Unlock to Contact",
    unlockItemDetails: "Unlock Item Details",
    paymentDescription: "Pay 500 FCFA to access full details and contact the owner",
    accessFee: "Access Fee",
    fullDetailsAccess: "Full item details",
    contactOwner: "Contact owner directly",
    instantMessaging: "Instant messaging",
    processing: "Processing...",
    payNow: "Pay Now",
    cancel: "Cancel",
    category: "Category",
    location: "Location",
    date: "Date",
    locale: "en-US",
    comingSoon: "Coming Soon",
    downloadApp: "Download the",
    goMobile: "Obli Mobile App",
    appDescription:
      "Take Obli with you everywhere. Report lost items, scan QR codes, and get instant notifications right from your phone.",
    instantNotifications: "Instant Notifications",
    instantNotificationsDesc: "Get real-time alerts when someone finds your item",
    qrScanner: "Built-in QR Scanner",
    qrScannerDesc: "Quickly scan Obli QR codes to report found items",
    offlineMode: "Offline Mode",
    offlineModeDesc: "Access your reported items even without internet",
    downloadOn: "Download on the",
    getItOn: "Get it on",
    searchYourItem: "Search your item...",
  },
  fr: {
    heroTitle: "Retrouver ce qui est Perdu",
    heroSubtitle: "Connecter ce qui Compte",
    heroDescription:
      "La plateforme premium pour les objets perdus et trouvés. Déclarez, cherchez et récupérez facilement.",
    report: "Déclarer un Objet Perdu",
    search: "Rechercher des Objets",
    missionTitle: "Notre Mission",
    missionDescription:
      "Simplifier le parcours émotionnel des objets perdus. Nous fournissons une solution sécurisée, efficace et élégante pour la communauté.",
    features: "Comment ça Marche",
    featuresDescription:
      "Découvrez nos fonctionnalités puissantes conçues pour vous aider à trouver ce qui compte le plus",
    ctaTitle: "Prêt à Commencer?",
    ctaDescription: "Rejoignez notre communauté et commencez à déclarer ou trouver des objets perdus aujourd'hui",
    ctaButton: "Commencer Maintenant",
    home: "Accueil",
    reportItem: "Déclarer",
    findItem: "Rechercher",
    myItems: "Mes Objets",
    qrStore: "Boutique QR",
    contact: "Contact",
    account: "Compte",
    login: "Connexion",
    logout: "Déconnexion",
    signup: "Inscription",
    darkMode: "Mode Sombre",
    lightMode: "Mode Clair",
    backToResults: "Retour aux résultats",
    unlockDetails: "Débloquer les Détails",
    unlockToContact: "Débloquer pour Contacter",
    unlockItemDetails: "Débloquer les Détails de l'Objet",
    paymentDescription: "Payez 500 FCFA pour accéder aux détails complets et contacter le propriétaire",
    accessFee: "Frais d'accès",
    fullDetailsAccess: "Détails complets de l'objet",
    contactOwner: "Contacter le propriétaire directement",
    instantMessaging: "Messagerie instantanée",
    processing: "Traitement en cours...",
    payNow: "Payer Maintenant",
    cancel: "Annuler",
    category: "Catégorie",
    location: "Lieu",
    date: "Date",
    locale: "fr-FR",
    comingSoon: "Bientôt Disponible",
    downloadApp: "Téléchargez",
    goMobile: "l'App Mobile Obli",
    appDescription:
      "Emportez Obli partout avec vous. Déclarez des objets perdus, scannez des QR codes et recevez des notifications instantanées depuis votre téléphone.",
    instantNotifications: "Notifications Instantanées",
    instantNotificationsDesc: "Recevez des alertes en temps réel quand quelqu'un trouve votre objet",
    qrScanner: "Scanner QR Intégré",
    qrScannerDesc: "Scannez rapidement les QR codes Obli pour déclarer des objets trouvés",
    offlineMode: "Mode Hors Ligne",
    offlineModeDesc: "Accédez à vos objets déclarés même sans internet",
    downloadOn: "Télécharger sur",
    getItOn: "Disponible sur",
    searchYourItem: "Recherchez votre objet...",
  },
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem("language") || "fr"
  })

  useEffect(() => {
    localStorage.setItem("language", language)
    document.documentElement.lang = language
  }, [language])

  const t = (key) => {
    return translations[language][key] || key
  }

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "en" ? "fr" : "en"))
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, toggleLanguage }}>{children}</LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
