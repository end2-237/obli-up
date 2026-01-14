// frontend/src/services/sponsorService.js
import { supabase } from "../lib/supabase";

export const sponsorService = {
  // Créer un profil de parrain
  async createSponsorProfile(userId) {
    try {
      // Vérifier si le profil existe déjà
      const { data: existing } = await supabase
        .from("sponsors")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (existing) {
        return existing;
      }
      
      // Générer un code unique
      const { data: codeData, error: codeError } = await supabase.rpc(
        "generate_sponsor_code"
      );

      if (codeError) throw codeError;

      const sponsorCode = codeData;

      // Créer le profil sponsor
      const { data, error } = await supabase
        .from("sponsors")
        .insert([
          {
            user_id: userId,
            sponsor_code: sponsorCode,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error("Erreur création profil sponsor:", error);
      throw error;
    }
  },

  // Récupérer le profil sponsor d'un utilisateur
  async getSponsorProfile(userId) {
    const { data, error } = await supabase
      .from("sponsors")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error && error.code !== "PGRST116") throw error;
    return data;
  },

  // Récupérer un sponsor par code
  async getSponsorByCode(code) {
    const { data, error } = await supabase
      .from("sponsors")
      .select("*")
      .eq("sponsor_code", code)
      .maybeSingle();
  
    if (error) throw error;
    return data;
  },  

  // Créer une affiliation
  async createReferral(sponsorCode, referredUserId) {
    try {
      // Récupérer le sponsor
      const sponsor = await this.getSponsorByCode(sponsorCode);

      if (!sponsor) {
        throw new Error("Code de parrainage invalide");
      }

      // Vérifier que l'utilisateur ne se parraine pas lui-même
      if (sponsor.user_id === referredUserId) {
        // console.log("Un utilisateur ne peut pas se parrainer lui-même");
        return null;
      }

      // Vérifier que l'utilisateur n'est pas déjà parrainé
      const { data: existing } = await supabase
        .from("referrals")
        .select("id")
        .eq("referred_user_id", referredUserId)
        .maybeSingle();

      if (existing) {
        // console.log("Utilisateur déjà parrainé");
        return null;
      }

      // Créer l'affiliation
      const { data, error } = await supabase
        .from("referrals")
        .insert([
          {
            sponsor_id: sponsor.id,
            referred_user_id: referredUserId,
            status: "active",
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // console.log("Affiliation créée avec succès:", data);
      return data;
    } catch (error) {
      // console.error("Erreur création affiliation:", error);
      throw error;
    }
  },

  async getSponsorReferrals(sponsorId) {
    try {
      // console.log("Chargement des filleuls pour sponsor:", sponsorId);
  
      const { data: referralsData, error: referralsError } = await supabase
        .from("referrals")
        .select("*")
        .eq("sponsor_id", sponsorId)
        .order("created_at", { ascending: false });
  
      if (referralsError) throw referralsError;
      if (!referralsData?.length) return [];
  
      // console.log("Referrals trouvés:", referralsData.length);
  
      // Récupérer les userIds valides
      const userIds = referralsData
        .map(r => r.referred_user_id)
  
      if (!userIds.length) return referralsData.map(r => ({
        ...r,
        user: { display_name: "Utilisateur", created_at: r.created_at }
      }));
  
      // Récupérer les profils correspondants
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, display_name, created_at")
        .in("id", userIds);
  
      if (profilesError) console.warn("Impossible de récupérer les profils:", profilesError);
      // console.log("Profils trouvés:", profilesData?.length || 0);
  
      // Combiner referrals + profils
      return referralsData.map(referral => {
        const profile = profilesData?.find(p => p.id === referral.referred_user_id);
        return {
          ...referral,
          user: profile || { display_name: "Utilisateur", created_at: referral.created_at }
        };
      });
  
    } catch (error) {
      console.error("Erreur dans getSponsorReferrals:", error);
      return [];
    }
  }
  
  ,


  // Générer l'URL de parrainage
  generateReferralUrl(sponsorCode) {
    // const baseUrl = window.location.origin;
    const baseUrl = "https://obli.space";
    return `${baseUrl}/auth?ref=${sponsorCode}`;
  },

  // Générer l'URL du QR code
  generateQRCodeUrl(sponsorCode) {
    const referralUrl = this.generateReferralUrl(sponsorCode);
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
      referralUrl
    )}`;
  },

  // Mettre à jour le QR code dans la base
  async updateQRCodeUrl(sponsorId, qrCodeUrl) {
    const { error } = await supabase
      .from("sponsors")
      .update({ qr_code_url: qrCodeUrl })
      .eq("id", sponsorId);

    if (error) throw error;
  },
};