import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CreditCard, Loader2, AlertCircle, Check, Phone } from "lucide-react";
import { payunitService } from "../services/payunitService";

const PAYMENT_METHODS = [
  { id: "CM_ORANGE", name: "Orange Money", icon: "🟠", color: "orange" },
  { id: "CM_MTN", name: "MTN Mobile Money", icon: "🟡", color: "yellow" }
];

export default function PaymentModal({
  isOpen,
  onClose,
  amount,
  description,
  onSuccess,
  onError,
  customerInfo,
  orderType = "qr_order",
  orderId,
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [transactionId, setTransactionId] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState(customerInfo?.phone || "");
  const [processingMessage, setProcessingMessage] = useState("");

  const validatePhone = (phone) => {
    const cleaned = phone.replace(/[\s\+]/g, "").replace(/^237/, "");
    return /^6\d{8}$/.test(cleaned);
  };

  const handlePayment = async () => {
    if (!selectedMethod) {
      setError("Veuillez sélectionner une méthode de paiement");
      return;
    }

    if (!phoneNumber || !validatePhone(phoneNumber)) {
      setError("Veuillez entrer un numéro de téléphone valide (ex: 6XXXXXXXX)");
      return;
    }
  
    setLoading(true);
    setError("");
    setProcessingMessage("Initialisation du paiement...");
  
    try {
      const paymentData = {
        amount: amount,
        currency: "XAF",
        description: description,
        orderId: orderId,
        orderType: orderType,
        gateway: selectedMethod,
        phoneNumber: phoneNumber,
      };
  
      const result = await payunitService.initiatePayment(paymentData);
      
      setTransactionId(result.transactionId);
      setProcessingMessage("Paiement en cours de traitement...");

      // Attendre quelques secondes puis vérifier le statut
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setProcessingMessage("Vérification du statut...");
      const transaction = await payunitService.checkTransactionStatus(result.transactionId);
  
      if (transaction.status === "success") {
        setProcessingMessage("Paiement réussi !");
        onSuccess(transaction);
        setTimeout(() => onClose(), 1500);
      } else if (transaction.status === "failed" || transaction.status === "cancelled") {
        setError("Le paiement a échoué ou a été annulé. Veuillez réessayer.");
        setLoading(false);
      } else {
        // Toujours en attente, continuer à vérifier
        setProcessingMessage("En attente de confirmation. Vérifiez votre téléphone...");
        pollTransactionStatus(result.transactionId);
      }
  
    } catch (err) {
      console.error("Erreur paiement:", err);
      setError(err.message || "Une erreur est survenue lors du paiement");
      setLoading(false);
      setProcessingMessage("");
      if (onError) onError(err);
    }
  };

  const pollTransactionStatus = async (txId, attempts = 0) => {
    if (attempts >= 20) { // Max 20 tentatives (60 secondes)
      setError("Le délai de paiement a expiré. Veuillez vérifier votre transaction.");
      setLoading(false);
      setProcessingMessage("");
      return;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      const transaction = await payunitService.checkTransactionStatus(txId);
      
      if (transaction.status === "success") {
        setProcessingMessage("Paiement réussi !");
        onSuccess(transaction);
        setTimeout(() => onClose(), 1500);
      } else if (transaction.status === "failed" || transaction.status === "cancelled") {
        setError("Le paiement a échoué ou a été annulé.");
        setLoading(false);
        setProcessingMessage("");
      } else {
        // Continuer à vérifier
        pollTransactionStatus(txId, attempts + 1);
      }
    } catch (err) {
      console.error("Erreur vérification:", err);
      pollTransactionStatus(txId, attempts + 1);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="glass rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold">Procéder au paiement</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              disabled={loading}
            >
              <X size={20} />
            </button>
          </div>

          {/* Résumé */}
          <div className="space-y-4 mb-6">
            <div className="bg-primary/10 border border-primary/30 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                  <CreditCard className="text-primary" size={20} />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Montant à payer</div>
                  <div className="text-2xl font-bold gradient-text">
                    {amount.toLocaleString()} FCFA
                  </div>
                </div>
              </div>
              <div className="text-sm text-muted-foreground border-t border-border pt-3">
                {description}
              </div>
            </div>

            {/* Sélection de la méthode de paiement */}
            <div className="glass rounded-xl p-4">
              <div className="text-sm font-semibold mb-3">Choisissez votre méthode de paiement</div>
              <div className="grid grid-cols-2 gap-2">
                {PAYMENT_METHODS.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id)}
                    disabled={loading}
                    className={`relative p-3 rounded-xl border-2 transition-all ${
                      selectedMethod === method.id
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50 bg-muted/50"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-2xl">{method.icon}</span>
                      <span className="text-xs font-medium text-center">{method.name}</span>
                    </div>
                    {selectedMethod === method.id && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                        <Check size={14} className="text-primary-foreground" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Numéro de téléphone */}
            <div className="glass rounded-xl p-4">
              <label className="text-sm font-semibold mb-2 block">Numéro de téléphone Mobile Money</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="6XXXXXXXX"
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-3 bg-muted border border-border rounded-lg focus:border-primary focus:outline-none transition-colors disabled:opacity-50"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Format: 6XXXXXXXX (9 chiffres, sans +237)
              </p>
            </div>

            {/* Informations client */}
            <div className="glass rounded-xl p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Client</span>
                <span className="font-semibold">{customerInfo.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email</span>
                <span className="font-semibold">{customerInfo.email}</span>
              </div>
            </div>
          </div>

          {/* Message de traitement */}
          {processingMessage && (
            <div className="bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-xl p-4 mb-6 flex items-start gap-3">
              <Loader2 className="animate-spin flex-shrink-0 mt-0.5" size={20} />
              <div className="text-sm">{processingMessage}</div>
            </div>
          )}

          {/* Erreur */}
          {error && (
            <div className="bg-destructive/10 border border-destructive text-destructive rounded-xl p-4 mb-6 flex items-start gap-3">
              <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
              <div className="text-sm">{error}</div>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={handlePayment}
              disabled={loading || !selectedMethod || !phoneNumber}
              className="w-full px-6 py-4 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Traitement en cours...
                </>
              ) : (
                <>
                  <CreditCard size={20} />
                  Payer {amount.toLocaleString()} FCFA
                </>
              )}
            </button>

            <button
              onClick={onClose}
              disabled={loading}
              className="w-full px-6 py-3 glass rounded-xl hover:bg-muted transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
          </div>

          {/* Sécurité */}
          <div className="mt-6 text-center text-xs text-muted-foreground">
            🔒 Paiement sécurisé par PayUnit
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}