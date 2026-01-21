// frontend/src/services/payunitService.js
import { supabase } from "../lib/supabase";

const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || "https://obli-up.onrender.com";

export const payunitService = {
  /**
   * Initialiser un paiement Mobile Money via le backend
   */
  async initiatePayment(paymentData) {
    try {
      const {
        amount,
        currency = "XAF",
        description,
        orderId,
        orderType,
        gateway,
        phoneNumber,
      } = paymentData;
  
      // Validation
      if (!amount || amount <= 0) {
        throw new Error("Montant invalide");
      }
  
      if (!orderId) {
        throw new Error("ID de commande requis");
      }
  
      if (!orderType) {
        throw new Error("Type de commande requis");
      }
  
      if (!gateway) {
        throw new Error("Méthode de paiement requise");
      }

      if (!phoneNumber) {
        throw new Error("Numéro de téléphone requis");
      }

      // Valider le format du numéro
      const cleanPhone = phoneNumber.replace(/[\s\+]/g, "").replace(/^237/, "");
      if (!/^6\d{8}$/.test(cleanPhone)) {
        throw new Error("Format de numéro invalide. Utilisez 6XXXXXXXX (9 chiffres)");
      }
  
      console.log("💳 Initialisation paiement Mobile Money:", {
        amount,
        currency,
        orderId,
        orderType,
        gateway,
        phone: `***${cleanPhone.slice(-4)}`, // Masquer dans les logs
      });
  
      // Récupérer le token d'authentification
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
  
      if (sessionError || !session) {
        throw new Error("Non authentifié. Veuillez vous connecter.");
      }
  
      // Appeler le backend pour initialiser le paiement
      const response = await fetch(`${BACKEND_URL}/payunit/init`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          amount,
          currency,
          description,
          orderId,
          orderType,
          gateway,
          phoneNumber: cleanPhone,
        }),
      });
  
      const result = await response.json();
  
      if (!response.ok) {
        throw new Error(
          result.error || "Erreur lors de l'initialisation du paiement"
        );
      }
  
      console.log("✅ Paiement Mobile Money initialisé:", result);
  
      return {
        transactionId: result.transactionId,
        paymentUrl: result.paymentUrl,
        reference: result.reference,
        success: result.success,
      };
    } catch (error) {
      console.error("❌ Erreur PayUnit initiatePayment:", error);
      throw error;
    }
  },

  /**
   * Vérifier le statut d'une transaction
   */
  async checkTransactionStatus(transactionId) {
    try {
      if (!transactionId) {
        throw new Error("ID de transaction requis");
      }

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        throw new Error("Non authentifié");
      }

      console.log("🔍 Vérification transaction:", transactionId);

      const response = await fetch(
        `${BACKEND_URL}/payunit/status/${transactionId}`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Erreur lors de la vérification du paiement"
        );
      }

      console.log("📊 Statut transaction:", result.transaction?.status);

      return result.transaction;
    } catch (error) {
      console.error("❌ Erreur vérification transaction:", error);
      throw error;
    }
  },

  /**
   * Créer un paiement pour une commande QR
   */
  async createQROrderPayment(order, phoneNumber) {
    if (!order || !order.id || !order.total_price) {
      throw new Error("Données de commande invalides");
    }

    if (!phoneNumber) {
      throw new Error("Numéro de téléphone requis");
    }

    const packageName = order.package_name || "Package QR";
    const quantity = order.quantity || 1;

    return this.initiatePayment({
      amount: parseFloat(order.total_price),
      currency: "XAF",
      description: `Commande QR - ${packageName} (${quantity} QR)`,
      orderId: `qr-${order.id}`,
      orderType: "qr_order",
      phoneNumber: phoneNumber,
    });
  },

  /**
   * Créer un paiement pour débloquer un item
   */
  async createItemVerificationPayment(item, user, phoneNumber) {
    if (!item || !item.id || !item.title) {
      throw new Error("Données de l'item invalides");
    }

    if (!user || !user.id) {
      throw new Error("Utilisateur non authentifié");
    }

    if (!phoneNumber) {
      throw new Error("Numéro de téléphone requis");
    }

    return this.initiatePayment({
      amount: 500, // 500 FCFA
      currency: "XAF",
      description: `Déblocage item - ${item.title}`,
      orderId: `verification-${item.id}-${user.id}`,
      orderType: "item_verification",
      phoneNumber: phoneNumber,
    });
  },

  /**
   * Vérifier si l'utilisateur a accès à un item
   */
  async checkItemAccess(itemId, userId) {
    try {
      if (!itemId || !userId) {
        return false;
      }

      console.log("🔐 Vérification accès item:", itemId, "pour", userId);

      const { data, error } = await supabase
        .from("item_access")
        .select("*")
        .eq("item_id", itemId)
        .eq("user_id", userId)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        console.error("❌ Erreur vérification accès:", error);
        return false;
      }

      const hasAccess = data !== null;
      console.log(hasAccess ? "✅ Accès accordé" : "🔒 Accès refusé");

      return hasAccess;
    } catch (error) {
      console.error("❌ Erreur vérification accès:", error);
      return false;
    }
  },

  /**
   * Récupérer l'historique des transactions de l'utilisateur
   */
  async getTransactionHistory() {
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        throw new Error("Non authentifié");
      }

      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("customer_email", session.user.email)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error("❌ Erreur récupération historique:", error);
      throw error;
    }
  },

  /**
   * Annuler une transaction en attente
   */
  async cancelTransaction(transactionId) {
    try {
      if (!transactionId) {
        throw new Error("ID de transaction requis");
      }

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        throw new Error("Non authentifié");
      }

      const { data, error } = await supabase
        .from("transactions")
        .update({ status: "cancelled" })
        .eq("id", transactionId)
        .eq("customer_email", session.user.email)
        .eq("status", "pending")
        .select()
        .single();

      if (error) throw error;

      console.log("✅ Transaction annulée:", transactionId);

      return data;
    } catch (error) {
      console.error("❌ Erreur annulation transaction:", error);
      throw error;
    }
  },

  /**
   * Formater le montant en FCFA
   */
  formatAmount(amount) {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XAF",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  },

  /**
   * Obtenir le label du statut de transaction
   */
  getStatusLabel(status) {
    const labels = {
      pending: "En attente",
      processing: "En cours",
      success: "Réussi",
      paid: "Payé",
      failed: "Échoué",
      cancelled: "Annulé",
      expired: "Expiré",
    };
    return labels[status] || status;
  },

  /**
   * Obtenir la couleur du statut
   */
  getStatusColor(status) {
    const colors = {
      pending: "orange",
      processing: "blue",
      success: "green",
      paid: "green",
      failed: "red",
      cancelled: "gray",
      expired: "gray",
    };
    return colors[status] || "gray";
  },
};