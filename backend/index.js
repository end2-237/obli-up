import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { StreamChat } from "stream-chat";
import { PayunitClient } from "@payunit/nodejs-sdk";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const streamClient = StreamChat.getInstance(
  process.env.STREAM_API_KEY,
  process.env.STREAM_API_SECRET
);

// Configuration PayUnit
const PAYUNIT_API_KEY = process.env.PAYUNIT_API_KEY;
const PAYUNIT_USERNAME = process.env.PAYUNIT_USERNAME;
const PAYUNIT_PASSWORD = process.env.PAYUNIT_PASSWORD;
const PAYUNIT_MODE = process.env.PAYUNIT_MODE || "live";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3000";

// Initialiser le client PayUnit avec le SDK officiel
const payunitClient = new PayunitClient({
  baseURL: "https://gateway.payunit.net",
  apiKey: PAYUNIT_API_KEY,
  apiUsername: PAYUNIT_USERNAME,
  apiPassword: PAYUNIT_PASSWORD,
  mode: PAYUNIT_MODE,
  timeout: 15000,
});

// ============================================
// FONCTIONS PAYUNIT
// ============================================

/**
 * Initialiser un paiement PayUnit avec le SDK officiel
 */
async function initiatePayUnitPayment(paymentData) {
  try {
    const {
      transactionId,
      amount,
      currency = "XAF",
      description,
      callbackUrl,
      returnUrl,
    } = paymentData;

    console.log("📤 Initialisation paiement PayUnit SDK...");

    // Utiliser le SDK officiel PayUnit comme dans l'exemple
    const paymentRequest = await payunitClient.collections.initiatePayment({
      total_amount: parseInt(amount),
      currency: currency,
      description: description || "Paiement",
      transaction_id: transactionId,
      return_url: returnUrl,
      notify_url: callbackUrl,
      payment_country: "CM",
    });

    console.log("✅ Réponse PayUnit SDK:", paymentRequest);

    const payunitId = paymentRequest?.transaction_id || transactionId;

    // Retourner l'URL de paiement
    return {
      reference: payunitId,
      payment_url: paymentRequest.payment_url || paymentRequest.url || paymentRequest.data?.payment_url,
      status: "pending",
    };
  } catch (error) {
    console.error("❌ Erreur initiatePayUnitPayment:", error.response?.data || error.message);
    throw error;
  }
}

/**
 * Vérifier le statut d'un paiement PayUnit
 */
async function checkPayUnitStatus(transactionId) {
  try {
    console.log("🔍 Vérification statut PayUnit SDK:", transactionId);

    // Utiliser la méthode du SDK pour vérifier le statut
    const result = await payunitClient.collections.getTransactionStatus({
      transaction_id: transactionId,
    });
    
    console.log("📊 Statut PayUnit:", result);

    return {
      status: result.transaction_status || result.status,
      ...result,
    };
  } catch (error) {
    console.error("❌ Erreur checkPayUnitStatus:", error.response?.data || error.message);
    throw error;
  }
}

/**
 * Mapper le statut PayUnit vers notre système
 */
function mapPayUnitStatus(payunitStatus) {
  const statusMap = {
    "successful": "success",
    "success": "success",
    "completed": "success",
    "paid": "success",
    "pending": "pending",
    "processing": "pending",
    "initiated": "pending",
    "failed": "failed",
    "cancelled": "cancelled",
    "canceled": "cancelled",
    "expired": "expired",
  };
  return statusMap[payunitStatus?.toLowerCase()] || "pending";
}

// ============================================
// ROUTES PAYUNIT
// ============================================

/**
 * POST /payunit/init
 * Initialiser un paiement
 */
app.post("/payunit/init", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ error: "Missing authorization header" });
    }

    const jwt = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(jwt);

    if (authError || !user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const {
      amount,
      currency,
      description,
      orderId,
      orderType, // 'qr_order', 'item_verification'
    } = req.body;

    // Validation
    if (!amount || !orderId || !orderType) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    console.log("💳 Initialisation paiement pour:", user.email);

    // 1. Créer la transaction dans Supabase
    const { data: transaction, error: txError } = await supabase
      .from("transactions")
      .insert([
        {
          order_id: orderId,
          order_type: orderType,
          amount: amount,
          currency: currency || "XAF",
          customer_email: user.email,
          customer_name: user.user_metadata?.name || user.email.split("@")[0],
          customer_phone: user.user_metadata?.phone || "",
          description: description,
          status: "pending",
        },
      ])
      .select()
      .single();

    if (txError) {
      console.error("❌ Erreur création transaction:", txError);
      return res.status(500).json({ error: "Failed to create transaction" });
    }

    console.log("✅ Transaction créée:", transaction.id);

    // 2. Initialiser le paiement PayUnit
    const backendUrl = process.env.BACKEND_URL || `${req.protocol}://${req.get('host')}`;
    
    const payunitResponse = await initiatePayUnitPayment({
      transactionId: transaction.id,
      amount: amount,
      currency: currency || "XAF",
      description: description || `Paiement ${orderType}`,
      customerEmail: user.email,
      customerName: user.user_metadata?.name || user.email.split("@")[0],
      customerPhone: user.user_metadata?.phone || "",
      callbackUrl: `${backendUrl}/payunit/callback`,
      returnUrl: `${FRONTEND_URL}/payment/success?tx=${transaction.id}`,
      cancelUrl: `${FRONTEND_URL}/payment/cancel?tx=${transaction.id}`,
    });

    // 3. Mettre à jour la transaction avec les infos PayUnit
    await supabase
      .from("transactions")
      .update({
        payunit_reference: payunitResponse.reference,
        payunit_payment_url: payunitResponse.payment_url,
        payunit_status: payunitResponse.status,
      })
      .eq("id", transaction.id);

    // 4. Retourner les infos au client
    return res.json({
      success: true,
      transactionId: transaction.id,
      paymentUrl: payunitResponse.payment_url,
      reference: payunitResponse.reference,
    });

  } catch (error) {
    console.error("❌ Erreur /payunit/init:", error);
    return res.status(500).json({
      error: error.message || "Internal server error",
    });
  }
});

/**
 * GET /payunit/status/:transactionId
 * Vérifier le statut d'une transaction
 */
app.get("/payunit/status/:transactionId", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const { transactionId } = req.params;

    if (!authHeader) {
      return res.status(401).json({ error: "Missing authorization header" });
    }

    const jwt = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(jwt);

    if (authError || !user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Récupérer la transaction
    const { data: transaction, error: txError } = await supabase
      .from("transactions")
      .select("*")
      .eq("id", transactionId)
      .eq("customer_email", user.email)
      .single();

    if (txError || !transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    // Si déjà success, retourner directement
    if (transaction.status === "success") {
      return res.json({
        success: true,
        transaction: transaction,
      });
    }

    // Sinon, vérifier auprès de PayUnit
    if (transaction.payunit_reference) {
      try {
        const payunitStatus = await checkPayUnitStatus(transaction.payunit_reference);
        const newStatus = mapPayUnitStatus(payunitStatus.status);

        // Mettre à jour la transaction
        const { data: updatedTx } = await supabase
          .from("transactions")
          .update({
            status: newStatus,
            payunit_status: payunitStatus.status,
            paid_at: newStatus === "success" ? new Date().toISOString() : null,
          })
          .eq("id", transactionId)
          .select()
          .single();

        // Si paiement réussi, déclencher les actions
        if (newStatus === "success" && transaction.status !== "success") {
          await handlePaymentSuccess(updatedTx);
        }

        return res.json({
          success: true,
          transaction: updatedTx,
        });
      } catch (error) {
        console.error("❌ Erreur vérification PayUnit:", error);
        return res.json({
          success: true,
          transaction: transaction,
        });
      }
    }

    return res.json({
      success: true,
      transaction: transaction,
    });

  } catch (error) {
    console.error("❌ Erreur /payunit/status:", error);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * POST /payunit/callback
 * Webhook PayUnit (appelé par PayUnit après paiement)
 */
app.post("/payunit/callback", async (req, res) => {
  try {
    console.log("🔔 Webhook PayUnit reçu:", req.body);

    const { transaction_id, status, reference } = req.body;

    if (!transaction_id || !status) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Récupérer la transaction
    const { data: transaction, error: txError } = await supabase
      .from("transactions")
      .select("*")
      .eq("id", transaction_id)
      .single();

    if (txError || !transaction) {
      console.error("❌ Transaction non trouvée:", transaction_id);
      return res.status(404).json({ error: "Transaction not found" });
    }

    const newStatus = mapPayUnitStatus(status);
    console.log(`📊 Mise à jour transaction ${transaction_id}: ${newStatus}`);

    // Mettre à jour la transaction
    const { data: updatedTx } = await supabase
      .from("transactions")
      .update({
        status: newStatus,
        payunit_status: status,
        payunit_callback_data: req.body,
        paid_at: newStatus === "success" ? new Date().toISOString() : null,
      })
      .eq("id", transaction_id)
      .select()
      .single();

    // Si paiement réussi, déclencher les actions
    if (newStatus === "success") {
      await handlePaymentSuccess(updatedTx);
    }

    return res.json({ success: true });

  } catch (error) {
    console.error("❌ Erreur webhook PayUnit:", error);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * Actions à effectuer après un paiement réussi
 */
async function handlePaymentSuccess(transaction) {
  try {
    console.log("🎉 Paiement réussi pour:", transaction.id);

    const orderIdParts = transaction.order_id.split("-");
    const orderType = orderIdParts[0];

    if (orderType === "qr") {
      const orderId = orderIdParts[1];
      await supabase
        .from("qr_orders")
        .update({
          payment_status: "paid",
          status: "processing",
          paid_at: new Date().toISOString(),
        })
        .eq("id", orderId);

      console.log("✅ Commande QR mise à jour:", orderId);

    } else if (orderType === "verification") {
      const itemId = orderIdParts[1];
      const userId = orderIdParts[2];

      const { error } = await supabase
        .from("item_access")
        .insert([
          {
            item_id: itemId,
            user_id: userId,
            transaction_id: transaction.id,
            granted_at: new Date().toISOString(),
          },
        ]);

      if (error && error.code !== "23505") {
        console.error("❌ Erreur item_access:", error);
      } else {
        console.log("✅ Accès item accordé:", itemId, "→", userId);
      }
    }

  } catch (error) {
    console.error("❌ Erreur handlePaymentSuccess:", error);
  }
}

// ============================================
// ROUTES STREAM CHAT
// ============================================

async function addMembersToChannel(channel, memberIds) {
  try {
    console.log('➕ Ajout des membres au canal:', memberIds);
    
    const state = await channel.watch();
    const currentMembers = Object.keys(state.members);
    
    console.log('   Membres actuels:', currentMembers);
    
    const missingMembers = memberIds.filter(id => !currentMembers.includes(id));
    
    if (missingMembers.length === 0) {
      console.log('✅ Tous les membres sont déjà présents');
      return true;
    }
    
    console.log('   Membres à ajouter:', missingMembers);
    
    await channel.addMembers(missingMembers);
    
    console.log('✅ Membres ajoutés avec succès');
    
    const finalState = await channel.watch();
    const finalMembers = Object.keys(finalState.members);
    
    console.log('   Membres finaux:', finalMembers);
    
    const allPresent = memberIds.every(id => finalMembers.includes(id));
    
    if (!allPresent) {
      console.error('❌ ERREUR: Certains membres sont toujours manquants!');
      return false;
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout des membres:', error);
    throw error;
  }
}

app.post("/stream/token", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: "Missing Authorization header" });
    }

    const jwt = authHeader.replace("Bearer ", "");
    const { data, error } = await supabase.auth.getUser(jwt);

    if (error || !data?.user) {
      console.error("❌ Auth error:", error);
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = data.user;

    await streamClient.upsertUser({
      id: user.id,
      name: user.user_metadata?.name || user.email.split('@')[0],
      email: user.email,
      image: user.user_metadata?.avatar_url,
    });

    const streamToken = streamClient.createToken(user.id);

    console.log("✅ Token généré pour:", user.email);

    return res.json({
      token: streamToken,
      userId: user.id,
    });

  } catch (err) {
    console.error("❌ Stream token error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.delete("/stream/delete-channel/:channelId", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const { channelId } = req.params;

    if (!authHeader || !channelId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const jwt = authHeader.replace("Bearer ", "");
    const { data, error } = await supabase.auth.getUser(jwt);

    if (error || !data?.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    console.log('🗑️ Suppression canal:', channelId);

    const channel = streamClient.channel('messaging', channelId);
    
    try {
      await channel.watch();
      await channel.delete();
      console.log('✅ Canal supprimé:', channelId);
      return res.json({ success: true, message: `Channel ${channelId} deleted` });
    } catch (err) {
      console.log('⚠️ Canal introuvable ou déjà supprimé:', channelId);
      return res.json({ success: true, message: 'Channel not found or already deleted' });
    }

  } catch (err) {
    console.error("❌ Erreur suppression:", err);
    return res.status(500).json({ error: err.message });
  }
});

app.post("/stream/add-members", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const { channelId, memberIds } = req.body;

    console.log('📥 Requête ajout membres:', { channelId, memberIds });

    if (!authHeader || !channelId || !memberIds?.length) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const jwt = authHeader.replace("Bearer ", "");
    const { data, error } = await supabase.auth.getUser(jwt);

    if (error || !data?.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const channel = streamClient.channel('messaging', channelId);
    
    try {
      await channel.watch();
      console.log('✅ Canal trouvé:', channelId);
    } catch (err) {
      console.error('❌ Canal introuvable:', channelId);
      return res.status(404).json({ error: 'Channel not found' });
    }

    const success = await addMembersToChannel(channel, memberIds);
    
    if (!success) {
      return res.status(500).json({ error: 'Failed to add all members' });
    }

    const finalState = await channel.watch();
    const finalMembers = Object.keys(finalState.members);

    return res.json({
      success: true,
      channelId: channel.id,
      members: finalMembers
    });

  } catch (err) {
    console.error("❌ Erreur ajout membres:", err);
    return res.status(500).json({ 
      error: err.message,
      details: err.response?.data || null
    });
  }
});

app.post("/stream/create-channel", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const { channelId, otherUserId, itemId, itemTitle } = req.body;

    console.log('📥 Requête création canal:', { channelId, otherUserId, itemId });

    if (!authHeader || !channelId || !otherUserId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const jwt = authHeader.replace("Bearer ", "");
    const { data, error } = await supabase.auth.getUser(jwt);

    if (error || !data?.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const currentUserId = data.user.id;
    const memberIds = [currentUserId, otherUserId];

    console.log('👤 Utilisateurs:', memberIds);

    try {
      console.log('🔄 Création utilisateurs Stream...');
      
      await streamClient.upsertUser({
        id: currentUserId,
        name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'Utilisateur',
        email: data.user.email,
        image: data.user.user_metadata?.avatar_url,
      });

      const { data: otherUserData } = await supabase.auth.admin.getUserById(otherUserId);
      
      await streamClient.upsertUser({
        id: otherUserId,
        name: otherUserData?.user?.user_metadata?.name || otherUserData?.user?.email?.split('@')[0] || 'Utilisateur',
        email: otherUserData?.user?.email || `${otherUserId}@placeholder.com`,
        image: otherUserData?.user?.user_metadata?.avatar_url,
      });

      console.log('✅ Utilisateurs créés');
      
    } catch (userErr) {
      console.error('❌ Erreur création utilisateurs:', userErr);
      return res.status(500).json({ error: 'Failed to create users' });
    }

    let channel;
    let channelExists = false;
    
    try {
      channel = streamClient.channel('messaging', channelId);
      await channel.watch();
      
      console.log('✅ Canal existant trouvé:', channelId);
      channelExists = true;
      
      await addMembersToChannel(channel, memberIds);
      
    } catch (channelError) {
      console.log('⚠️ Canal non existant, création...');
    }

    if (!channelExists) {
      const channelData = {
        created_by_id: currentUserId,
        members: memberIds,
      };

      if (itemId) channelData.item_id = itemId;
      if (itemTitle) channelData.item_title = itemTitle;

      console.log('🔄 Création canal avec membres:', channelData);

      channel = streamClient.channel('messaging', channelId, channelData);
      
      await channel.create();
      console.log('✅ Canal créé avec membres');
      
      const verifyState = await channel.watch();
      const verifyMembers = Object.keys(verifyState.members);
      console.log('👥 Membres après création:', verifyMembers);
      
      if (verifyMembers.length !== memberIds.length) {
        console.error('❌ Échec: membres manquants après création');
        return res.status(500).json({ error: 'Failed to add members to channel' });
      }
    }

    const finalState = await channel.watch();
    const finalMembers = Object.keys(finalState.members);

    return res.json({
      channelId: channel.id,
      cid: channel.cid,
      existing: channelExists,
      members: finalMembers
    });

  } catch (err) {
    console.error("❌ Erreur création canal:", err);
    return res.status(500).json({ 
      error: err.message,
      details: err.response?.data || null
    });
  }
});

// ============================================
// HEALTH CHECK
// ============================================

app.get("/health", (req, res) => {
  res.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    services: {
      payunit: (PAYUNIT_API_KEY && PAYUNIT_USERNAME && PAYUNIT_PASSWORD) ? "configured" : "not configured",
      payunitSDK: payunitClient ? "initialized" : "not initialized",
      stream: streamClient ? "configured" : "not configured",
      supabase: supabase ? "configured" : "not configured",
    }
  });
});

// ============================================
// START SERVER
// ============================================

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
  console.log(`   PayUnit SDK: ${payunitClient ? '✅ Initialized' : '❌ Not initialized'}`);
  console.log(`   Stream: ${streamClient ? '✅ Configured' : '❌ Not configured'}`);
});