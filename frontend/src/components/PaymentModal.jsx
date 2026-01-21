// frontend/src/components/PaymentModal.jsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CreditCard, Loader2, AlertCircle, ExternalLink, Check } from "lucide-react";
import { payunitService } from "../services/payunitService";

const PAYMENT_METHODS = [
  { id: "orange_money_cm", name: "Orange Money", icon: "🟠", color: "orange" },
  { id: "mtn_cm", name: "MTN Mobile Money", icon: "🟡", color: "yellow" },
  { id: "moov_cm", name: "Moov Money", icon: "🔵", color: "blue" },
  { id: "card", name: "Carte Bancaire", icon: "💳", color: "gray" },
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
  const [paymentUrl, setPaymentUrl] = useState(null);
  const [transactionId, setTransactionId] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState(null);

  const handlePayment = async () => {
    if (!selectedMethod) {
      setError("Veuillez sélectionner une méthode de paiement");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const paymentData = {
        amount: amount,
        currency: "XAF",
        description: description,
        orderId: orderId,
        orderType: orderType,
        paymentMethod: selectedMethod, // Ajouter la méthode de paiement
      };

      const result = await payunitService.initiatePayment(paymentData);

      setPaymentUrl(result.paymentUrl);
      setTransactionId(result.transactionId);

      // Ouvrir PayUnit dans une nouvelle fenêtre
      const paymentWindow = window.open(
        result.paymentUrl,
        "PayUnit",
        "width=600,height=700,scrollbars=yes"
      );

      // Vérifier périodiquement si le paiement est terminé
      const checkInterval = setInterval(async () => {
        if (paymentWindow.closed) {
          clearInterval(checkInterval);
          
          // Vérifier le statut de la transaction
          try {
            const transaction = await payunitService.checkTransactionStatus(result.transactionId);
            
            if (transaction.status === "success") {
              onSuccess(transaction);
              onClose();
            } else if (transaction.status === "failed" || transaction.status === "cancelled") {
              setError("Le paiement a échoué ou a été annulé");
            }
          } catch (err) {
            console.error("Erreur vérification:", err);
          }
          
          setLoading(false);
        }
      }, 1000);

      // Timeout après 10 minutes
      setTimeout(() => {
        clearInterval(checkInterval);
        if (!paymentWindow.closed) {
          paymentWindow.close();
        }
        setLoading(false);
      }, 600000);

    } catch (err) {
      console.error("Erreur paiement:", err);
      setError(err.message || "Une erreur est survenue lors du paiement");
      setLoading(false);
      if (onError) onError(err);
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
              {customerInfo.phone && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Téléphone</span>
                  <span className="font-semibold">{customerInfo.phone}</span>
                </div>
              )}
            </div>
          </div>

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
              disabled={loading || !selectedMethod}
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

            {paymentUrl && (
              <a
                href={paymentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center text-sm text-primary hover:underline flex items-center justify-center gap-1"
              >
                Ouvrir à nouveau la page de paiement
                <ExternalLink size={14} />
              </a>
            )}

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