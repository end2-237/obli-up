"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { QrCode, Camera, AlertCircle, CheckCircle, Mail, MessageSquare } from "lucide-react"
import { useTranslation } from "react-i18next"

export default function QRScannerPage() {
  const { t } = useTranslation()
  const [scanning, setScanning] = useState(false)
  const [scannedData, setScannedData] = useState(null)
  const [notificationSent, setNotificationSent] = useState(false)

  const handleScan = () => {
    setScanning(true)
    // Simulate QR scan
    setTimeout(() => {
      setScanning(false)
      setScannedData({
        itemId: "ABC123",
        itemName: "iPhone 14 Pro",
        ownerEmail: "owner@example.com",
        ownerPhone: "+221 77 123 45 67",
        secondaryContact: "+221 76 987 65 43",
      })
    }, 2000)
  }

  const sendNotification = async () => {
    // Simulate sending SMS and email
    setNotificationSent(true)
    alert(
      `✅ Notifications envoyées!\n\nSMS envoyé à: ${scannedData.ownerPhone}\nEmail envoyé à: ${scannedData.ownerEmail}\nContact secondaire notifié: ${scannedData.secondaryContact}`,
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
            <QrCode size={20} className="text-primary" />
            <span className="text-sm font-semibold">Scanner QR</span>
          </div>
          <h1 className="text-4xl font-bold mb-4">Vous avez trouvé un objet?</h1>
          <p className="text-lg text-muted-foreground">Scannez le QR code pour notifier le propriétaire</p>
        </motion.div>

        {!scannedData ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-2xl p-8 md:p-12"
          >
            <div className="text-center">
              {scanning ? (
                <div className="space-y-6">
                  <div className="w-32 h-32 mx-auto border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  <p className="text-lg font-semibold">Scan en cours...</p>
                  <p className="text-muted-foreground">Positionnez le QR code dans le cadre</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="w-32 h-32 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                    <Camera className="text-primary" size={64} />
                  </div>
                  <button
                    onClick={handleScan}
                    className="px-8 py-4 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors inline-flex items-center gap-2"
                  >
                    <QrCode size={20} />
                    Commencer le scan
                  </button>
                  <p className="text-sm text-muted-foreground">
                    Assurez-vous que le QR code est bien visible et éclairé
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
            {/* Success Alert */}
            <div className="glass rounded-2xl p-6 border-2 border-secondary">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center">
                  <CheckCircle className="text-secondary" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Objet identifié!</h3>
                  <p className="text-sm text-muted-foreground">QR Code scanné avec succès</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Objet</span>
                  <span className="font-semibold">{scannedData.itemName}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Code</span>
                  <span className="font-mono text-sm">{scannedData.itemId}</span>
                </div>
              </div>
            </div>

            {/* Notification Action */}
            {!notificationSent ? (
              <div className="glass rounded-2xl p-8">
                <h3 className="text-xl font-semibold mb-4">Notifier le propriétaire</h3>
                <p className="text-muted-foreground mb-6">
                  En cliquant sur ce bouton, le propriétaire recevra un SMS et un email avec votre localisation et un
                  message indiquant que son objet a été trouvé.
                </p>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg">
                    <MessageSquare className="text-primary" size={20} />
                    <div>
                      <div className="font-semibold text-sm">SMS</div>
                      <div className="text-xs text-muted-foreground">{scannedData.ownerPhone}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-secondary/5 rounded-lg">
                    <Mail className="text-secondary" size={20} />
                    <div>
                      <div className="font-semibold text-sm">Email</div>
                      <div className="text-xs text-muted-foreground">{scannedData.ownerEmail}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-accent/5 rounded-lg">
                    <MessageSquare className="text-accent" size={20} />
                    <div>
                      <div className="font-semibold text-sm">Contact secondaire</div>
                      <div className="text-xs text-muted-foreground">{scannedData.secondaryContact}</div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={sendNotification}
                  className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                >
                  <Mail size={20} />
                  Envoyer les notifications
                </button>
              </div>
            ) : (
              <div className="glass rounded-2xl p-8 text-center">
                <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="text-secondary" size={32} />
                </div>
                <h3 className="text-2xl font-bold mb-2">Notifications envoyées!</h3>
                <p className="text-muted-foreground mb-6">
                  Le propriétaire a été informé par SMS et email. Il devrait vous contacter bientôt.
                </p>
                <button
                  onClick={() => {
                    setScannedData(null)
                    setNotificationSent(false)
                  }}
                  className="px-6 py-3 glass rounded-xl hover:bg-muted transition-colors"
                >
                  Scanner un autre QR
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* Info Section */}
        <div className="mt-12 glass rounded-2xl p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-primary flex-shrink-0 mt-1" size={20} />
            <div className="text-sm text-muted-foreground">
              <p className="font-semibold text-foreground mb-2">Important</p>
              <p>
                En scannant ce QR code, vous acceptez de partager votre localisation approximative avec le propriétaire
                de l'objet. Aucune donnée personnelle n'est collectée sans votre consentement.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
