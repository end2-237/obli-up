import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { StreamChat } from "stream-chat";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Supabase SERVER client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Stream server client
const streamClient = StreamChat.getInstance(
  process.env.STREAM_API_KEY,
  process.env.STREAM_API_SECRET
);

// ✅ Route corrigée pour correspondre au frontend
app.post("/stream/token", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: "Missing Authorization header" });
    }

    const jwt = authHeader.replace("Bearer ", "");

    // Vérification utilisateur Supabase
    const { data, error } = await supabase.auth.getUser(jwt);

    if (error || !data?.user) {
      console.error("❌ Auth error:", error);
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = data.user;

    // ✅ IMPORTANT : Créer/mettre à jour l'utilisateur dans Stream
    await streamClient.upsertUser({
      id: user.id,
      name: user.user_metadata?.name || user.email.split('@')[0],
      email: user.email,
      image: user.user_metadata?.avatar_url,
    });

    // Générer le token Stream
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

// ✅ Route pour créer un channel entre deux utilisateurs
app.post("/stream/create-channel", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const { otherUserId, itemId, itemTitle } = req.body;

    if (!authHeader || !otherUserId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const jwt = authHeader.replace("Bearer ", "");
    const { data, error } = await supabase.auth.getUser(jwt);

    if (error || !data?.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const currentUserId = data.user.id;

    // Vérifier que l'autre utilisateur existe dans Stream
    try {
      await streamClient.upsertUser({
        id: otherUserId,
      });
    } catch (err) {
      console.warn("⚠️ Could not verify other user:", err.message);
    }

    // Créer un channel unique entre les deux utilisateurs
    const channelId = [currentUserId, otherUserId].sort().join('-');
    
    const channel = streamClient.channel('messaging', channelId, {
      members: [currentUserId, otherUserId],
      created_by_id: currentUserId,
      // Métadonnées optionnelles
      ...(itemId && { item_id: itemId }),
      ...(itemTitle && { item_title: itemTitle }),
    });

    await channel.create();

    console.log("✅ Channel créé:", channelId);

    return res.json({
      channelId: channel.id,
      cid: channel.cid,
    });

  } catch (err) {
    console.error("❌ Channel creation error:", err);
    return res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});