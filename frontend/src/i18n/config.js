import i18n from "i18next"
import { initReactI18next } from "react-i18next"

const resources = {
  en: {
    translation: {
      // Navigation
      home: "Home",
      search: "Search Items",
      report: "Report Item",
      qrStore: "QR Store",
      dashboard: "Dashboard",
      contact: "Contact",

      // Hero
      heroPreTitle: "Don't lose your items",
      heroTitle: "Find lost items",
      heroSubtitle: "It's easy with Obli",
      getStarted: "Get Started",
      learnMore: "Learn More",
      heroDescription: "An elegant and secure experience to find lost items in Douala",

      // Mission
      missionTitle: "Our Mission",
      missionDescription: "Make it easier for people to find lost items in Douala",

      // Features
      features: "Features",
      instantNotification: "Instant Notification",
      instantNotificationDesc: "Get SMS and email alerts when someone finds your item",
      qrTechnology: "QR Technology",
      qrTechnologyDesc: "Smart QR codes that work anywhere, anytime",
      securePayment: "Secure Payment",
      securePaymentDesc: "Safe 500 FCFA payment to access search results",
      realTimeChat: "Real-Time Chat",
      realTimeChatDesc: "Connect instantly with finders or owners",

      // QR Store
      qrStoreTitle: "Personalized QR Stickers",
      qrStoreDesc: "Protect your belongings with custom QR codes",
      buyNow: "Buy Now",
      addToCart: "Add to Cart",

      // Search
      searchTitle: "Search Lost Items",
      searchPlaceholder: "Search by name, category...",
      category: "Category",
      allCategories: "All Categories",
      payToSearch: "Pay 500 FCFA to Search",

      // Report
      reportTitle: "Report a Lost Item",
      reportSubtitle: "Help us reunite items with their owners",
      itemName: "Item Name",
      description: "Description",
      category: "Category",
      location: "Location",
      contactInfo: "Contact Information",
      uploadPhotos: "Upload Photos",
      submit: "Submit",

      // Auth
      signIn: "Sign In",
      signUp: "Sign Up",
      signOut: "Sign Out",
      email: "Email",
      password: "Password",

      // Mobile App
      downloadApp: "Download the Obli Mobile App",
      downloadAppDesc: "Get the full Obli experience on your mobile device",
      downloadIOS: "Download Obli for iOS",
      downloadAndroid: "Download Obli for Android",
      goMobile: "On mobile",
      appDescription: "An elegant and secure experience to find lost items in Douala",
      instantNotifications: "Instant Notifications",
      instantNotificationsDesc: "Get SMS and email alerts when someone finds your item",
      qrScanner: "QR Scanner",
      qrScannerDesc: "Scan QR codes to find lost items",
      securePayment: "Secure Payment",
      securePaymentDesc: "Safe 500 FCFA payment to access search results",
      realTimeChat: "Real-Time Chat",
      realTimeChatDesc: "Connect instantly with finders or owners",
      offlineMode: "Offline Mode",
      offlineModeDesc: "Offline mode allows you to use Obli even without an internet connection",
      downloadOn: "Download on",
      getItOn: "Get it on",


      // CTA
      ctaTitle: "Ready to Find Your Lost Items?",
      ctaDescription: "Join thousands of users who trust Obli to report and recover lost items quickly and securely.",
      ctaButton: "Get Started Now",

      // Common
      loading: "Loading...",
      error: "Error",
      success: "Success",
      cancel: "Cancel",
      save: "Save",
      edit: "Edit",
      delete: "Delete",
      close: "Close",
    },
  },
  fr: {
    translation: {
      // Navigation
      home: "Accueil",
      search: "Rechercher",
      report: "Signaler",
      qrStore: "Boutique QR",
      dashboard: "Tableau de bord",
      contact: "Contact",

      // Hero
      heroPreTitle: "Ne perdez plus vos objets",
      heroTitle: "Retrouver ce qui compte",
      heroSubtitle: "C'est facile avec Obli",
      getStarted: "Commencer",
      learnMore: "En savoir plus",
      heroDescription: "Une expérience élégante et sécurisée pour retrouver vos objets perdus à Douala",

      // Mission
      missionTitle: "Notre Mission",
      missionDescription: "Simplifier le parcours émotionnel des objets perdus. Nous offrons une solution sécurisée, efficace et élégante pour la communauté.",

      // Features
      features: "Fonctionnalités",
      instantNotification: "Notification Instantanée",
      instantNotificationDesc: "Recevez des alertes SMS et email quand quelqu'un trouve votre objet",
      qrTechnology: "Technologie QR",
      qrTechnologyDesc: "Codes QR intelligents qui fonctionnent partout, tout le temps",
      securePayment: "Paiement Sécurisé",
      securePaymentDesc: "Paiement sécurisé de 500 FCFA pour accéder aux résultats",
      realTimeChat: "Chat en Temps Réel",
      realTimeChatDesc: "Connectez-vous instantanément avec les trouveurs ou propriétaires",

      // QR Store
      qrStoreTitle: "Autocollants QR Personnalisés",
      qrStoreDesc: "Protégez vos affaires avec des codes QR personnalisés",
      buyNow: "Acheter",
      addToCart: "Ajouter au panier",

      // Search
      searchTitle: "Rechercher des Objets Perdus",
      searchPlaceholder: "Rechercher par nom, catégorie...",
      category: "Catégorie",
      allCategories: "Toutes les catégories",
      payToSearch: "Payer 500 FCFA pour Rechercher",

      // Report
      reportTitle: "Signaler un Objet Perdu",
      reportSubtitle: "Aidez-nous à retrouver les propriétaires",
      itemName: "Nom de l'objet",
      description: "Description",
      category: "Catégorie",
      location: "Localisation",
      contactInfo: "Informations de contact",
      uploadPhotos: "Télécharger des photos",
      submit: "Soumettre",

      // Auth
      signIn: "Se connecter",
      signUp: "S'inscrire",
      signOut: "Se déconnecter",
      email: "Email",
      password: "Mot de passe",

      // Mobile App
      downloadApp: "Téléchargez l'application mobile Obli",
      downloadAppDesc: "Profitez de l'expérience complète Obli sur votre mobile",
      downloadIOS: "Télécharger Obli pour iOS",
      downloadAndroid: "Télécharger Obli pour Android",
      goMobile: "Sur mobile",
      appDescription: "Une expérience élégante et sécurisée pour retrouver vos objets perdus à Douala",
      instantNotifications: "Notifications instantanées",
      instantNotificationsDesc: "Recevez des alertes SMS et email quand quelqu'un trouve votre objet",
      qrScanner: "Scanner QR",
      qrScannerDesc: "Codes QR intelligents qui fonctionnent partout, tout le temps",
      securePayment: "Paiement Sécurisé",
      securePaymentDesc: "Paiement sécurisé de 500 FCFA pour accéder aux résultats",
      realTimeChat: "Chat en Temps Réel",
      realTimeChatDesc: "Connectez-vous instantanément avec les trouveurs ou propriétaires",
      offlineMode: "Mode hors ligne",
      offlineModeDesc: "Profitez de l'expérience Obli même sans connexion internet",
      downloadOn: "Télécharger sur",
      getItOn: "Obtenez-le sur",
      

      // CTA
      ctaTitle: "Prêt à Retrouver Vos Objets ?",
      ctaDescription: "Rejoignez des milliers d'utilisateurs qui font confiance à Obli pour déclarer et retrouver leurs objets perdus rapidement et en toute sécurité.",
      ctaButton: "Commencer Maintenant",

      // Common
      loading: "Chargement...",
      error: "Erreur",
      success: "Succès",
      cancel: "Annuler",
      save: "Enregistrer",
      edit: "Modifier",
      delete: "Supprimer",
      close: "Fermer",
    },
  },
}

i18n.use(initReactI18next).init({
  resources,
  lng: localStorage.getItem("language") || "fr",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
})

export default i18n
