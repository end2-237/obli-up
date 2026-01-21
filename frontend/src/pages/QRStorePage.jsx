"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  QrCode,
  ShoppingCart,
  Check,
  Star,
  Package,
  Shield,
  Truck,
  CreditCard,
  User,
  Phone,
  MapPin,
  Mail,
  ArrowRight,
  ArrowLeft,
  Download,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { QRCodeSVG } from "qrcode.react";
import { useAuth } from "../contexts/AuthContext";
import { formService } from "../services/formService";
import { useNavigate } from "react-router-dom";
import { payunitService } from "../services/payunitService";
import PaymentModal from "../components/PaymentModal";
const QR_PACKAGES = [
  {
    id: 1,
    name: "Pack Starter",
    quantity: 5,
    price: 2500,
    features: [
      "5 autocollants QR personnalisés",
      "Résistant à l'eau",
      "Notifications SMS + Email",
      "Support technique 48h",
    ],
    popular: false,
  },
  {
    id: 2,
    name: "Pack Pro",
    quantity: 15,
    price: 6500,
    savings: 1000,
    features: [
      "15 autocollants QR personnalisés",
      "Design premium",
      "Notifications instantanées",
      "Statistiques de scan",
      "Support prioritaire 24h",
    ],
    popular: true,
  },
  {
    id: 3,
    name: "Pack Famille",
    quantity: 30,
    price: 11000,
    savings: 4000,
    features: [
      "30 autocollants QR personnalisés",
      "Design ultra premium",
      "Dashboard complet",
      "Contacts multiples",
      "Support VIP 24/7",
    ],
    popular: false,
  },
];

const OBJECT_TYPES = [
  { id: "electronics", label: "Électronique", icon: "📱" },
  { id: "bags", label: "Bagagerie", icon: "🎒" },
  { id: "keys", label: "Clés", icon: "🔑" },
  { id: "accessories", label: "Accessoires", icon: "👜" },
  { id: "documents", label: "Documents", icon: "📄" },
  { id: "other", label: "Autre", icon: "📦" },
];

export default function QRStorePageNew() {
  const navigate = useNavigate();

  const { t } = useTranslation();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1); // 1: Package, 2: Personnalisation, 3: Livraison, 4: Paiement, 5: Confirmation
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);

  const [personalInfo, setPersonalInfo] = useState({
    fullName: user?.user_metadata?.name || "",
    email: user?.email || "",
    phone: "",
    secondaryPhone: "",
    address: "",
    city: "",
    postalCode: "",
  });
  const [qrConfig, setQrConfig] = useState({
    objectTypes: [],
    customMessage: "",
    notificationPreference: "both", // sms, email, both
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePersonalInfoChange = (field, value) => {
    setPersonalInfo((prev) => ({ ...prev, [field]: value }));
  };

  const toggleObjectType = (typeId) => {
    setQrConfig((prev) => ({
      ...prev,
      objectTypes: prev.objectTypes.includes(typeId)
        ? prev.objectTypes.filter((id) => id !== typeId)
        : [...prev.objectTypes, typeId],
    }));
  };


  const handlePayment = async () => {
    if (!user) {
      alert("Vous devez être connecté pour passer commande");
      navigate("/auth");
      return;
    }
  
    setIsProcessing(true);
  
    try {
      // 1. Créer la commande dans la base de données
      const orderData = {
        userId: user.id,
        packageId: selectedPackage.id,
        packageName: selectedPackage.name,
        quantity: selectedPackage.quantity,
        price: selectedPackage.price,
        deliveryFee: deliveryFee,
        totalPrice: totalPrice + deliveryFee,
        personalInfo: personalInfo,
        qrConfig: qrConfig
      };
  
      const order = await formService.createQROrder(orderData);
      console.log("✅ Commande créée:", order.id);
      
      setCurrentOrder(order);
      
      // 2. Ouvrir le modal de paiement
      setShowPaymentModal(true);
  
    } catch (error) {
      console.error("❌ Erreur lors de la commande:", error);
      alert(`Erreur: ${error.message || "Une erreur est survenue lors de la commande"}`);
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Ajouter ces fonctions de callback :
  
  const handlePaymentSuccess = async (transaction) => {
    console.log("✅ Paiement réussi:", transaction);
    
    // Passer à l'étape de confirmation
    setCurrentStep(5);
    setShowPaymentModal(false);
    
    // Optionnel : Recharger la commande mise à jour
    // const updatedOrder = await formService.getUserOrders(user.id);
  };
  
  const handlePaymentError = (error) => {
    console.error("❌ Erreur paiement:", error);
    alert("Le paiement a échoué. Veuillez réessayer.");
    setShowPaymentModal(false);
  };
  
  // AJOUTER à la fin du JSX (avant la fermeture du dernier </div>) :
  
  

  const totalPrice = selectedPackage?.price || 0;
  const deliveryFee = 1000;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/10 to-secondary/10 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6 border border-border">
              <QrCode size={20} className="text-primary" />
              <span className="text-sm font-semibold">
                Boutique QR Personnalisés
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-foreground">
              Protégez Vos Objets
            </h1>
            <p className="text-lg text-muted-foreground">
              QR codes personnalisés avec vos informations de contact
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            {[
              { id: 1, label: "Package", icon: Package },
              { id: 2, label: "Personnalisation", icon: User },
              { id: 3, label: "Livraison", icon: Truck },
              { id: 4, label: "Paiement", icon: CreditCard },
              { id: 5, label: "Confirmation", icon: Check },
            ].map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-all border-2 ${
                      currentStep > step.id
                        ? "bg-primary border-primary text-primary-foreground"
                        : currentStep === step.id
                        ? "bg-primary border-primary text-primary-foreground"
                        : "bg-background border-border text-muted-foreground"
                    }`}
                  >
                    {currentStep > step.id ? (
                      <Check size={24} />
                    ) : (
                      <step.icon size={24} />
                    )}
                  </div>
                  <div className="mt-2 text-xs font-semibold text-center hidden sm:block text-foreground">
                    {step.label}
                  </div>
                </div>
                {index < 4 && (
                  <div
                    className={`h-0.5 flex-1 transition-colors ${
                      currentStep > step.id ? "bg-primary" : "bg-border"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {/* Étape 1: Choix du Package */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h2 className="text-3xl font-bold mb-8 text-center text-foreground">
                Choisissez Votre Pack
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {QR_PACKAGES.map((pkg, index) => (
                  <motion.div
                    key={pkg.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => setSelectedPackage(pkg)}
                    className={`glass rounded-2xl p-6 cursor-pointer transition-all border-2 ${
                      selectedPackage?.id === pkg.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    } ${pkg.popular ? "relative" : ""}`}
                  >
                    {pkg.popular && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                        <div className="px-4 py-1 bg-primary text-primary-foreground rounded-full text-xs font-bold flex items-center gap-1">
                          <Star size={12} fill="currentColor" />
                          Le Plus Populaire
                        </div>
                      </div>
                    )}

                    <div className="text-center mb-6 mt-2">
                      <h3 className="text-2xl font-bold mb-2 text-foreground">
                        {pkg.name}
                      </h3>
                      <div className="flex items-baseline justify-center gap-2 mb-2">
                        <span className="text-4xl font-bold gradient-text">
                          {pkg.price}
                        </span>
                        <span className="text-muted-foreground">FCFA</span>
                      </div>
                      {pkg.savings && (
                        <div className="text-sm text-secondary font-semibold">
                          Économisez {pkg.savings} FCFA
                        </div>
                      )}
                      <div className="text-sm text-muted-foreground mt-2">
                        {pkg.quantity} autocollants QR
                      </div>
                    </div>

                    <ul className="space-y-3 mb-6">
                      {pkg.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <Check
                            size={16}
                            className="text-primary flex-shrink-0 mt-0.5"
                          />
                          <span className="text-muted-foreground">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {selectedPackage?.id === pkg.id && (
                      <div className="absolute top-4 right-4">
                        <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                          <Check
                            size={16}
                            className="text-primary-foreground"
                          />
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>

              <div className="flex justify-center">
                <button
                  onClick={() => selectedPackage && setCurrentStep(2)}
                  disabled={!selectedPackage}
                  className="px-8 py-4 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  Continuer
                  <ArrowRight size={20} />
                </button>
              </div>
            </motion.div>
          )}

          {/* Étape 2: Personnalisation */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-4xl mx-auto"
            >
              <h2 className="text-3xl font-bold mb-8 text-center text-foreground">
                Personnalisation de vos QR Codes
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Formulaire */}
                <div className="space-y-6">
                  <div className="glass rounded-2xl p-6 border border-border">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-foreground">
                      <User size={20} className="text-primary" />
                      Informations de Contact
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold mb-2 text-foreground">
                          Nom Complet *
                        </label>
                        <input
                          type="text"
                          value={personalInfo.fullName}
                          onChange={(e) =>
                            handlePersonalInfoChange("fullName", e.target.value)
                          }
                          className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                          placeholder="Jean Dupont"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold mb-2 text-foreground">
                          Email *
                        </label>
                        <input
                          type="email"
                          value={personalInfo.email}
                          onChange={(e) =>
                            handlePersonalInfoChange("email", e.target.value)
                          }
                          className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                          placeholder="jean@example.com"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold mb-2 text-foreground">
                          Téléphone Principal *
                        </label>
                        <input
                          type="tel"
                          value={personalInfo.phone}
                          onChange={(e) =>
                            handlePersonalInfoChange("phone", e.target.value)
                          }
                          className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                          placeholder="+221 77 123 45 67"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold mb-2 text-foreground">
                          Téléphone Secondaire
                        </label>
                        <input
                          type="tel"
                          value={personalInfo.secondaryPhone}
                          onChange={(e) =>
                            handlePersonalInfoChange(
                              "secondaryPhone",
                              e.target.value
                            )
                          }
                          className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                          placeholder="+221 76 987 65 43"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Contact d'urgence en cas d'indisponibilité
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="glass rounded-2xl p-6 border border-border">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-foreground">
                      <Package size={20} className="text-primary" />
                      Types d'Objets
                    </h3>

                    <p className="text-sm text-muted-foreground mb-4">
                      Sélectionnez les types d'objets que vous souhaitez
                      protéger
                    </p>

                    <div className="grid grid-cols-2 gap-3">
                      {OBJECT_TYPES.map((type) => (
                        <button
                          key={type.id}
                          onClick={() => toggleObjectType(type.id)}
                          className={`p-4 rounded-xl border-2 transition-all text-left ${
                            qrConfig.objectTypes.includes(type.id)
                              ? "border-primary bg-primary/10"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <div className="text-2xl mb-1">{type.icon}</div>
                          <div className="text-sm font-semibold text-foreground">
                            {type.label}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="glass rounded-2xl p-6 border border-border">
                    <h3 className="text-xl font-bold mb-4 text-foreground">
                      Message Personnalisé
                    </h3>

                    <textarea
                      value={qrConfig.customMessage}
                      onChange={(e) =>
                        setQrConfig((prev) => ({
                          ...prev,
                          customMessage: e.target.value,
                        }))
                      }
                      rows={4}
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary resize-none text-foreground"
                      placeholder="Message affiché lors du scan du QR code (optionnel)..."
                    />
                  </div>
                </div>

                {/* Aperçu */}
                <div className="space-y-6">
                  <div className="glass rounded-2xl p-6 sticky top-24 border border-border">
                    <h3 className="text-xl font-bold mb-6 text-center text-foreground">
                      Aperçu de votre QR Code
                    </h3>

                    <div className="bg-white p-8 rounded-2xl mb-6 shadow-lg">
                      <QRCodeSVG
                        value={`https://obli.app/found/${user?.id || "demo"}`}
                        size={240}
                        level="H"
                        includeMargin={true}
                        className="mx-auto"
                      />

                      <div className="mt-6 text-center">
                        <div className="text-lg font-bold text-gray-900 mb-2">
                          J'ai trouvé cet objet!
                        </div>
                        <div className="text-sm text-gray-600 mb-3">
                          Scannez pour notifier le propriétaire
                        </div>
                        {qrConfig.customMessage && (
                          <div className="mt-4 p-3 bg-gray-100 rounded-lg text-xs text-gray-700 italic">
                            "{qrConfig.customMessage}"
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Shield size={16} className="text-primary" />
                        <span>Design premium imperméable</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Check size={16} className="text-primary" />
                        <span>Scan illimité à vie</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Check size={16} className="text-primary" />
                        <span>Notifications en temps réel</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="px-8 py-4 glass rounded-xl hover:bg-muted transition-colors flex items-center gap-2 border border-border"
                >
                  <ArrowLeft size={20} />
                  Retour
                </button>
                <button
                  onClick={() => setCurrentStep(3)}
                  disabled={
                    !personalInfo.fullName ||
                    !personalInfo.email ||
                    !personalInfo.phone
                  }
                  className="px-8 py-4 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  Continuer
                  <ArrowRight size={20} />
                </button>
              </div>
            </motion.div>
          )}

          {/* Étape 3: Livraison */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-2xl mx-auto"
            >
              <h2 className="text-3xl font-bold mb-8 text-center text-foreground">
                Informations de Livraison
              </h2>

              <div className="glass rounded-2xl p-8 mb-8 border border-border">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2 flex items-center gap-2 text-foreground">
                      <MapPin size={16} className="text-primary" />
                      Adresse de Livraison *
                    </label>
                    <input
                      type="text"
                      value={personalInfo.address}
                      onChange={(e) =>
                        handlePersonalInfoChange("address", e.target.value)
                      }
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                      placeholder="123 Avenue des Champs-Élysées"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-foreground">
                        Ville *
                      </label>
                      <input
                        type="text"
                        value={personalInfo.city}
                        onChange={(e) =>
                          handlePersonalInfoChange("city", e.target.value)
                        }
                        className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                        placeholder="Douala"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2 text-foreground">
                        Code Postal
                      </label>
                      <input
                        type="text"
                        value={personalInfo.postalCode}
                        onChange={(e) =>
                          handlePersonalInfoChange("postalCode", e.target.value)
                        }
                        className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                        placeholder="75008"
                      />
                    </div>
                  </div>

                  <div className="bg-accent/10 border border-accent rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <Truck
                        className="text-accent flex-shrink-0 mt-1"
                        size={20}
                      />
                      <div className="text-sm">
                        <div className="font-semibold text-foreground mb-1">
                          Livraison Standard - 1000 FCFA
                        </div>
                        <div className="text-muted-foreground">
                          Livraison sous 3-5 jours ouvrés
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="px-8 py-4 glass rounded-xl hover:bg-muted transition-colors flex items-center gap-2 border border-border"
                >
                  <ArrowLeft size={20} />
                  Retour
                </button>
                <button
                  onClick={() => setCurrentStep(4)}
                  disabled={!personalInfo.address || !personalInfo.city}
                  className="px-8 py-4 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  Continuer
                  <ArrowRight size={20} />
                </button>
              </div>
            </motion.div>
          )}

          {/* Étape 4: Paiement */}
          {currentStep === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-2xl mx-auto"
            >
              <h2 className="text-3xl font-bold mb-8 text-center text-foreground">
                Récapitulatif et Paiement
              </h2>

              <div className="glass rounded-2xl p-8 mb-8 border border-border">
                <h3 className="text-xl font-bold mb-6 text-foreground">
                  Récapitulatif de la commande
                </h3>

                <div className="space-y-4 mb-6 pb-6 border-b border-border">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {selectedPackage?.name} ({selectedPackage?.quantity} QR)
                    </span>
                    <span className="font-semibold text-foreground">
                      {selectedPackage?.price} FCFA
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Livraison</span>
                    <span className="font-semibold text-foreground">
                      {deliveryFee} FCFA
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-6">
                  <span className="text-xl font-bold text-foreground">
                    Total
                  </span>
                  <span className="text-3xl font-bold gradient-text">
                    {totalPrice + deliveryFee} FCFA
                  </span>
                </div>

                <button
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className="w-full px-6 py-4 bg-secondary text-secondary-foreground rounded-xl font-semibold hover:bg-secondary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="w-5 h-5 border-2 border-secondary-foreground border-t-transparent rounded-full"
                      />
                      Traitement en cours...
                    </>
                  ) : (
                    <>
                      <CreditCard size={20} />
                      Payer Maintenant
                    </>
                  )}
                </button>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={() => setCurrentStep(3)}
                  className="px-8 py-4 glass rounded-xl hover:bg-muted transition-colors flex items-center gap-2 border border-border"
                >
                  <ArrowLeft size={20} />
                  Retour
                </button>
              </div>
            </motion.div>
          )}

          {/* Étape 5: Confirmation */}
          {currentStep === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-2xl mx-auto text-center"
            >
              <div className="glass rounded-2xl p-10 border border-border">
                <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check size={40} className="text-primary-foreground" />
                </div>

                <h2 className="text-3xl font-bold mb-4 text-foreground">
                  Commande Confirmée 🎉
                </h2>

                <p className="text-muted-foreground mb-6">
                  Merci pour votre commande. Vos autocollants QR personnalisés
                  sont en cours de préparation.
                </p>

                <div className="bg-accent/10 border border-accent rounded-xl p-4 mb-6 text-sm text-left">
                  <div className="flex justify-between mb-2">
                    <span className="text-muted-foreground">Pack choisi</span>
                    <span className="font-semibold text-foreground">
                      {selectedPackage?.name}
                    </span>
                  </div>

                  <div className="flex justify-between mb-2">
                    <span className="text-muted-foreground">Quantité</span>
                    <span className="font-semibold text-foreground">
                      {selectedPackage?.quantity} QR
                    </span>
                  </div>

                  <div className="flex justify-between mb-2">
                    <span className="text-muted-foreground">Livraison</span>
                    <span className="font-semibold text-foreground">
                      {personalInfo.city}
                    </span>
                  </div>

                  <div className="flex justify-between border-t border-border pt-2 mt-2">
                    <span className="font-semibold text-foreground">
                      Total payé
                    </span>
                    <span className="font-bold text-primary">
                      {totalPrice + deliveryFee} FCFA
                    </span>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Mail size={16} className="text-primary" />
                    <span>Confirmation envoyée par email</span>
                  </div>

                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Phone size={16} className="text-primary" />
                    <span>Notifications SMS activées</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => (window.location.href = "/dashboard")}
                    className="px-8 py-4 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                  >
                    <User size={20} />
                    Accéder à mon espace
                  </button>

                  <button
                    onClick={() => window.print()}
                    className="px-8 py-4 glass rounded-xl border border-border hover:bg-muted transition-colors flex items-center justify-center gap-2"
                  >
                    <Download size={20} />
                    Télécharger le reçu
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Payment Modal */}
  {showPaymentModal && currentOrder && (
    <PaymentModal
      isOpen={showPaymentModal}
      onClose={() => setShowPaymentModal(false)}
      amount={currentOrder.total_price}
      description={`Commande QR - ${currentOrder.package_name} (${currentOrder.quantity} QR codes)`}
      customerInfo={{
        email: currentOrder.email,
        name: currentOrder.full_name,
        phone: currentOrder.phone,
      }}
      orderId={`qr-${currentOrder.id}`}
      orderType="qr_order"
      onSuccess={handlePaymentSuccess}
      onError={handlePaymentError}
    />
  )}
        </AnimatePresence>
      </div>
    </div>
  );
}
