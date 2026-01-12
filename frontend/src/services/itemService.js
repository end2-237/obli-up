// frontend/src/services/itemService.js
import { supabase } from "../lib/supabase";

export const itemService = {
  async getAllImages() {
    console.log("Début récupération de toutes les images...");

    const { data: imagesData, error } = await supabase
      .from("item_images")
      .select("*");

    if (error) {
      console.error("Erreur récupération images:", error);
      return [];
    }

    console.log(`Images récupérées (${imagesData.length}):`);
    imagesData.forEach((img) =>
      console.log(`Item ${img.item_id} => ${img.image_url}`)
    );

    return imagesData;
  },

  // Récupérer tous les items actifs
  async getAllItems(filters = {}) {
    // Récupérer les items
    const { data: items, error } = await supabase
      .from("items")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Pour chaque item, récupérer ses images dans item_images
    const itemsWithImages = await Promise.all(
      items.map(async (item) => {
        const { data: imagesData, error: imagesError } = await supabase
          .from("item_images")
          .select("image_url")
          .eq("item_id", item.id);

        if (imagesError) console.error(imagesError);

        return {
          ...item,
          image: imagesData?.[0]?.image_url || null, // première image
          images: imagesData?.map((img) => img.image_url) || [],
        };
      })
    );

    // Appliquer les filtres après récupération si besoin
    let filteredItems = itemsWithImages;

    if (filters.category && filters.category !== "Tous") {
      filteredItems = filteredItems.filter(
        (i) => i.category === filters.category
      );
    }
    if (filters.type) {
      filteredItems = filteredItems.filter((i) => i.type === filters.type);
    }
    if (filters.search) {
      filteredItems = filteredItems.filter(
        (i) =>
          i.title.toLowerCase().includes(filters.search.toLowerCase()) ||
          i.description.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    return filteredItems;
  },

  // Récupérer un item par ID
  async getItemById(id) {
    const { data: item, error } = await supabase
      .from("items")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;

    const { data: imagesData, error: imagesError } = await supabase
      .from("item_images")
      .select("image_url")
      .eq("item_id", id);

    if (imagesError) console.error(imagesError);

    return {
      ...item,
      image: imagesData?.[0]?.image_url || null,
      images: imagesData?.map((img) => img.image_url) || [],
      reporter: {
        name: "Utilisateur", // à compléter
        joinedDate: item.created_at,
        itemsReported: 0,
      },
    };
  },

  // Créer un nouvel item
  async createItem(itemData, userId) {
    const requestId = crypto.randomUUID();
    const { data, error } = await supabase
      .from("items")
      .insert([
        {
          user_id: userId,
          type: itemData.type,
          title: itemData.title,
          description: itemData.description,
          category: itemData.category,
          location: itemData.location,
          date: itemData.date,
          proof_data: itemData.proofData || null,
          proof_fields_config: itemData.proofFieldsConfig || null,
          verification_required: itemData.verificationRequired !== false,
          request_id: requestId,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Upload d'images
  async uploadImages(itemId, files) {
    const uploadedUrls = [];

    for (const file of files) {
      const fileExt = file.name.split(".").pop();
      const fileName = `${itemId}/${Math.random()}.${fileExt}`;
      const filePath = `items/${fileName}`;

      // Upload vers Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("objets-images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Obtenir l'URL publique
      const {
        data: { publicUrl },
      } = supabase.storage.from("objets-images").getPublicUrl(filePath);

      // Insérer dans la table item_images
      const { error: dbError } = await supabase.from("item_images").insert([
        {
          item_id: itemId,
          image_url: publicUrl,
        },
      ]);

      if (dbError) throw dbError;
      uploadedUrls.push(publicUrl);
    }

    return uploadedUrls;
  },

  // Récupérer les items d'un utilisateur
  async getUserItems(userId) {
    const { data, error } = await supabase
      .from("items")
      .select(
        `
        *,
        item_images(*),
        messages(count)
      `
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return data.map((item) => ({
      ...item,
      image: item.item_images?.[0]?.image_url || null,
      views: item.views || 0,
      messages: item.messages?.[0]?.count || 0,
    }));
  },

  // Mettre à jour un item
  async updateItem(itemId, updates) {
    const { data, error } = await supabase
      .from("items")
      .update(updates)
      .eq("id", itemId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Supprimer un item
  async deleteItem(itemId) {
    const { error } = await supabase.from("items").delete().eq("id", itemId);

    if (error) throw error;
    return true;
  },

  // Incrémenter le nombre de vues
  async incrementViews(itemId) {
    const { error } = await supabase.rpc("increment_views", {
      item_id: itemId,
    });

    if (error) console.error("Error incrementing views:", error);
  },

  // Obtenir les statistiques
  async getStats(userId) {
    const { data: lostItems } = await supabase
      .from("items")
      .select("id", { count: "exact" })
      .eq("user_id", userId)
      .eq("type", "lost");

    const { data: foundItems } = await supabase
      .from("items")
      .select("id", { count: "exact" })
      .eq("user_id", userId)
      .eq("type", "found");

    const { data: messages } = await supabase
      .from("messages")
      .select("id", { count: "exact" })
      .eq("receiver_id", userId);

    const { data: viewsData } = await supabase
      .from("items")
      .select("views")
      .eq("user_id", userId);

    const totalViews =
      viewsData?.reduce((sum, item) => sum + (item.views || 0), 0) || 0;

    return {
      lostItems: lostItems?.length || 0,
      foundItems: foundItems?.length || 0,
      messages: messages?.length || 0,
      totalViews,
    };
  },
};

// Créer la fonction RPC pour incrémenter les vues (à exécuter dans Supabase SQL Editor)
/*
CREATE OR REPLACE FUNCTION increment_views(item_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE items 
  SET views = views + 1 
  WHERE id = item_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
*/
