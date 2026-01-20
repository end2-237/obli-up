import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { StreamChat } from "stream-chat";

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

// ✅ FONCTION DÉDIÉE pour ajouter les membres
async function addMembersToChannel(channel, memberIds) {
  try {
    console.log('➕ Ajout des membres au canal:', memberIds);
    
    // Vérifier les membres actuels
    const state = await channel.watch();
    const currentMembers = Object.keys(state.members);
    
    console.log('   Membres actuels:', currentMembers);
    
    // Trouver les membres manquants
    const missingMembers = memberIds.filter(id => !currentMembers.includes(id));
    
    if (missingMembers.length === 0) {
      console.log('✅ Tous les membres sont déjà présents');
      return true;
    }
    
    console.log('   Membres à ajouter:', missingMembers);
    
    // Ajouter les membres manquants
    await channel.addMembers(missingMembers);
    
    console.log('✅ Membres ajoutés avec succès');
    
    // Vérification finale
    const finalState = await channel.watch();
    const finalMembers = Object.keys(finalState.members);
    
    console.log('   Membres finaux:', finalMembers);
    
    // Vérifier que tous les membres sont bien là
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

// Route pour générer un token Stream
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

// ✅ ROUTE: Supprimer un canal corrompu
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

// ✅ NOUVELLE ROUTE: Ajouter des membres à un canal existant
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

    // Récupérer le canal
    const channel = streamClient.channel('messaging', channelId);
    
    try {
      await channel.watch();
      console.log('✅ Canal trouvé:', channelId);
    } catch (err) {
      console.error('❌ Canal introuvable:', channelId);
      return res.status(404).json({ error: 'Channel not found' });
    }

    // Utiliser la fonction dédiée pour ajouter les membres
    const success = await addMembersToChannel(channel, memberIds);
    
    if (!success) {
      return res.status(500).json({ error: 'Failed to add all members' });
    }

    // Vérification finale
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

// Route pour créer un channel
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

    // ÉTAPE 1: Créer les utilisateurs dans Stream
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

    // ÉTAPE 2: Vérifier si le canal existe
    let channel;
    let channelExists = false;
    
    try {
      channel = streamClient.channel('messaging', channelId);
      await channel.watch();
      
      console.log('✅ Canal existant trouvé:', channelId);
      channelExists = true;
      
      // ✅ Utiliser la fonction pour ajouter les membres manquants
      await addMembersToChannel(channel, memberIds);
      
    } catch (channelError) {
      console.log('⚠️ Canal non existant, création...');
    }

    // ÉTAPE 3: Créer le canal si nécessaire
    if (!channelExists) {
      const channelData = {
        created_by_id: currentUserId,
        members: memberIds, // ✅ AJOUT DES MEMBRES DÈS LA CRÉATION
      };

      if (itemId) channelData.item_id = itemId;
      if (itemTitle) channelData.item_title = itemTitle;

      console.log('🔄 Création canal avec membres:', channelData);

      channel = streamClient.channel('messaging', channelId, channelData);
      
      // Créer le canal AVEC les membres
      await channel.create();
      console.log('✅ Canal créé avec membres');
      
      // Vérifier que les membres sont bien là
      const verifyState = await channel.watch();
      const verifyMembers = Object.keys(verifyState.members);
      console.log('👥 Membres après création:', verifyMembers);
      
      if (verifyMembers.length !== memberIds.length) {
        console.error('❌ Échec: membres manquants après création');
        return res.status(500).json({ error: 'Failed to add members to channel' });
      }
    }

    // Réponse finale
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});