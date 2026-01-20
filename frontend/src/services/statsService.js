// frontend/src/services/statsService.js
import { supabase } from "../lib/supabase";

export const statsService = {
  // Récupérer les statistiques globales de la plateforme
  async getPlatformStats() {
    try {
      // Nombre total d'utilisateurs
      const { count: usersCount, error: usersError } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      if (usersError) {
        console.warn("Erreur comptage utilisateurs:", usersError);
      }

      // Nombre total d'objets déclarés
      const { count: totalItemsCount, error: itemsError } = await supabase
        .from("items")
        .select("*", { count: "exact", head: true });

      if (itemsError) {
        console.warn("Erreur comptage items:", itemsError);
      }

      // Nombre d'objets retrouvés (status = claimed)
      const { count: returnedItemsCount, error: returnedError } = await supabase
        .from("items")
        .select("*", { count: "exact", head: true })
        .eq("status", "claimed");

      if (returnedError) {
        console.warn("Erreur comptage objets retrouvés:", returnedError);
      }

      // Nombre de messages échangés
      const { count: messagesCount, error: messagesError } = await supabase
        .from("item_messages")
        .select("*", { count: "exact", head: true });

      if (messagesError) {
        console.warn("Erreur comptage messages:", messagesError);
      }

      // Nombre de commandes QR
      const { count: qrOrdersCount, error: qrError } = await supabase
        .from("qr_orders")
        .select("*", { count: "exact", head: true });

      if (qrError) {
        console.warn("Erreur comptage commandes QR:", qrError);
      }

      return {
        users: usersCount || 0,
        totalItems: totalItemsCount || 0,
        returnedItems: returnedItemsCount || 0,
        messages: messagesCount || 0,
        qrOrders: qrOrdersCount || 0,
        // Taux de réussite (objets retrouvés / objets déclarés)
        successRate: totalItemsCount > 0 
          ? Math.round((returnedItemsCount / totalItemsCount) * 100) 
          : 0
      };
    } catch (error) {
      console.error("Erreur récupération statistiques:", error);
      // Retourner des valeurs par défaut en cas d'erreur
      return {
        users: 0,
        totalItems: 0,
        returnedItems: 0,
        messages: 0,
        qrOrders: 0,
        successRate: 0
      };
    }
  },

  // Récupérer les statistiques en temps réel (avec abonnement)
  subscribeToStats(callback) {
    const channel = supabase
      .channel("platform-stats")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "items" },
        () => {
          this.getPlatformStats().then(callback);
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles" },
        () => {
          this.getPlatformStats().then(callback);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
};

/*
NOTE: Pour que ce service fonctionne, assurez-vous que la table 'profiles' existe.
Si elle n'existe pas, créez-la avec cette migration SQL :

CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Trigger pour créer automatiquement un profil à l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
*/