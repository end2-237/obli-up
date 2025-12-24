"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { QrCode, ShoppingCart, Check, Star, Package, Shield, Zap, Smartphone } from "lucide-react"
import { useTranslation } from "react-i18next"
import { QRCodeSVG } from "qrcode.react"

export default function QRStorePage() {
  const { t } = useTranslation()
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [cart, setCart] = useState([])

  const products = [
    {
      id: 1,
      name: "QR Sticker Basic",
      nameEn: "QR Sticker Basic",
      nameFr: "Autocollant QR Basique",
      price: 2500,
      quantity: 5,
      features: ["5 autocollants QR", "Résistant à l'eau", "Scan illimité", "Support email"],
      featuresEn: ["5 QR stickers", "Waterproof", "Unlimited scans", "Email support"],
      featuresFr: ["5 autocollants QR", "Résistant à l'eau", "Scan illimité", "Support email"],
      popular: false,
    },
    {
      id: 2,
      name: "QR Sticker Pro",
      nameEn: "QR Sticker Pro",
      nameFr: "Autocollant QR Pro",
      price: 4500,
      quantity: 15,
      features: [
        "15 autocollants QR",
        "Design personnalisé",
        "Résistant à l'eau",
        "Notifications SMS/Email",
        "Support prioritaire",
      ],
      featuresEn: ["15 QR stickers", "Custom design", "Waterproof", "SMS/Email notifications", "Priority support"],
      featuresFr: [
        "15 autocollants QR",
        "Design personnalisé",
        "Résistant à l'eau",
        "Notifications SMS/Email",
        "Support prioritaire",
      ],
      popular: true,
    },
    {
      id: 3,
      name: "QR Sticker Premium",
      nameEn: "QR Sticker Premium",
      nameFr: "Autocollant QR Premium",
      price: 8000,
      quantity: 30,
      features: [
        "30 autocollants QR",
        "Design ultra personnalisé",
        "Matériau premium",
        "Notifications instantanées",
        "Dashboard analytics",
        "Support 24/7",
      ],
      featuresEn: [
        "30 QR stickers",
        "Ultra custom design",
        "Premium material",
        "Instant notifications",
        "Analytics dashboard",
        "24/7 support",
      ],
      featuresFr: [
        "30 autocollants QR",
        "Design ultra personnalisé",
        "Matériau premium",
        "Notifications instantanées",
        "Dashboard analytics",
        "Support 24/7",
      ],
      popular: false,
    },
  ]

  const addToCart = (product) => {
    setCart([...cart, product])
    setSelectedProduct(product)
  }

  const handleCheckout = () => {
    const totalAmount = cart.reduce((sum, item) => sum + item.price, 0)
    alert(`Paiement de ${totalAmount} FCFA en cours de traitement...`)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary/10 to-secondary/10 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
              <QrCode size={20} className="text-primary" />
              <span className="text-sm font-semibold">{t("qrStore")}</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">{t("qrStoreTitle")}</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{t("qrStoreDesc")}</p>
          </motion.div>
        </div>
      </div>

      {/* How It Works */}
      <section className="py-16 bg-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Comment ça fonctionne</h2>
            <p className="text-muted-foreground">Protégez vos objets en 3 étapes simples</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="text-primary" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-2">1. Commandez vos QR</h3>
              <p className="text-muted-foreground">
                Choisissez votre pack et recevez vos autocollants QR personnalisés
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Smartphone className="text-secondary" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-2">2. Collez sur vos objets</h3>
              <p className="text-muted-foreground">Appliquez les autocollants sur vos affaires importantes</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="text-accent" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-2">3. Recevez des alertes</h3>
              <p className="text-muted-foreground">Soyez notifié par SMS et email si quelqu'un trouve votre objet</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className={`glass rounded-2xl p-8 relative ${product.popular ? "border-2 border-primary" : ""}`}
              >
                {product.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <div className="px-4 py-1 bg-primary text-primary-foreground rounded-full text-sm font-semibold flex items-center gap-1">
                      <Star size={14} fill="currentColor" />
                      Populaire
                    </div>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-2">{product.nameFr}</h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold gradient-text">{product.price}</span>
                    <span className="text-muted-foreground">FCFA</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{product.quantity} autocollants</p>
                </div>

                <ul className="space-y-3 mb-8">
                  {product.featuresFr.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Check size={18} className="text-primary flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => addToCart(product)}
                  className={`w-full py-3 rounded-xl font-semibold transition-colors ${
                    product.popular ? "bg-primary text-primary-foreground hover:bg-primary/90" : "glass hover:bg-muted"
                  }`}
                >
                  {t("addToCart")}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* QR Code Preview */}
      <section className="py-16 bg-card/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass rounded-2xl p-8 md:p-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-4">Aperçu de votre QR Code</h2>
                <p className="text-muted-foreground mb-6">
                  Chaque QR code est unique et lié à votre profil. Quand quelqu'un le scanne, vous recevez immédiatement
                  un SMS et un email avec la localisation.
                </p>
                <div className="flex items-center gap-4">
                  <Shield className="text-primary" size={24} />
                  <div>
                    <div className="font-semibold">100% Sécurisé</div>
                    <div className="text-sm text-muted-foreground">Vos données sont protégées</div>
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <div className="p-6 bg-white rounded-2xl shadow-lg">
                  <QRCodeSVG
                    value="https://obli.app/found/ABC123"
                    size={200}
                    level="H"
                    includeMargin={true}
                    fgColor="#0a0a0a"
                  />
                  <div className="mt-4 text-center">
                    <p className="text-sm font-semibold text-gray-900">J'ai trouvé cet objet!</p>
                    <p className="text-xs text-gray-600 mt-1">Scannez pour notifier le propriétaire</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cart Summary */}
      {cart.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-8 right-8 glass rounded-2xl p-6 shadow-2xl max-w-sm z-50"
        >
          <div className="flex items-center gap-3 mb-4">
            <ShoppingCart className="text-primary" size={24} />
            <h3 className="font-semibold text-lg">Panier ({cart.length})</h3>
          </div>

          <div className="space-y-2 mb-4">
            {cart.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span>{item.nameFr}</span>
                <span className="font-semibold">{item.price} FCFA</span>
              </div>
            ))}
          </div>

          <div className="border-t border-border pt-4 mb-4">
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span className="gradient-text">{cart.reduce((sum, item) => sum + item.price, 0)} FCFA</span>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors"
          >
            Payer maintenant
          </button>
        </motion.div>
      )}
    </div>
  )
}
