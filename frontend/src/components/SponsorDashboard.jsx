import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, QrCode, Link2, Share2, Download, Copy, CheckCircle, Gift, TrendingUp } from "lucide-react";
import { sponsorService } from "../services/sponsorService";

export default function SponsorDashboard({ userId, userEmail }) {
  const [sponsorProfile, setSponsorProfile] = useState(null);
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState(null);
  const [claiming, setClaiming] = useState(false);
  const [rewardClaimed, setRewardClaimed] = useState(
    sponsorProfile?.reward_claimed ?? false
  );  


  const REWARD_THRESHOLD = 15;
  const REWARD_AMOUNT = 500;

  useEffect(() => {
    if (userId) {
      loadSponsorData();
    }
  }, [userId]);


const handleClaimReward = async () => {
  if (claiming || rewardClaimed) return;

  try {
    setClaiming(true);

    // 👉 ici tu brancheras plus tard une RPC ou un update SQL
    // await sponsorService.claimReward(sponsorProfile.id);

    setRewardClaimed(true);
  } catch (error) {
    console.error("Erreur réclamation récompense:", error);
  } finally {
    setClaiming(false);
  }
};


  const loadSponsorData = async () => {
    try {
      setLoading(true);
      
      let profile = await sponsorService.getSponsorProfile(userId);
      
      if (!profile) {
        profile = await sponsorService.createSponsorProfile(userId);
      }
      
      setSponsorProfile(profile);
      
      const qrUrl = sponsorService.generateQRCodeUrl(profile.sponsor_code);
      setQrCodeUrl(qrUrl);
      
      const refs = await sponsorService.getSponsorReferrals(profile.id);
      console.log('Filleuls chargés:', refs);
      setReferrals(refs || []);
      
    } catch (error) {
      console.error('Erreur chargement données parrain:', error);
    } finally {
      setLoading(false);
    }
  };

  const referralUrl = sponsorProfile 
    ? sponsorService.generateReferralUrl(sponsorProfile.sponsor_code)
    : '';

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Erreur copie:', err);
    }
  };

  const downloadQRCode = () => {
    if (!qrCodeUrl) return;
    
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `obli-qr-${sponsorProfile.sponsor_code}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const shareReferralLink = async () => {
    if (navigator.share && referralUrl) {
      try {
        await navigator.share({
          title: 'Rejoignez Obli',
          text: 'Inscrivez-vous sur Obli avec mon lien de parrainage !',
          url: referralUrl
        });
      } catch (err) {
        console.error('Erreur partage:', err);
      }
    }
  };

  // Calcule la progression de récompense
  const totalReferrals = sponsorProfile?.total_referrals || 0;
  const progressPercentage = Math.min((totalReferrals / REWARD_THRESHOLD) * 100, 100);
  const remainingReferrals = Math.max(REWARD_THRESHOLD - totalReferrals, 0);
  const hasReachedReward = totalReferrals >= REWARD_THRESHOLD;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Reward Progress Banner */}
<motion.div
  initial={{ opacity: 0, y: -20 }}
  animate={{ opacity: 1, y: 0 }}
  className={`glass rounded-2xl p-6 border-2 ${
    hasReachedReward
      ? "border-secondary bg-secondary/5"
      : "border-primary/20"
  }`}
>
  <div className="flex items-center gap-4 mb-4">
    <div
      className={`w-14 h-14 rounded-full flex items-center justify-center ${
        hasReachedReward ? "bg-secondary/20" : "bg-primary/20"
      }`}
    >
      <Gift
        className={hasReachedReward ? "text-secondary" : "text-primary"}
        size={28}
      />
    </div>

    <div className="flex-1">
      <h3 className="text-xl font-bold">
        {hasReachedReward
          ? "Récompense débloquée"
          : "Progression vers la récompense"}
      </h3>
      <p className="text-sm text-muted-foreground">
        {hasReachedReward
          ? `Vous avez atteint ${REWARD_THRESHOLD} filleuls`
          : `Encore ${remainingReferrals} filleuls pour débloquer ${REWARD_AMOUNT.toLocaleString()} FCFA`}
      </p>
    </div>

    {hasReachedReward && (
      <div className="text-right">
        <div className="text-3xl font-bold text-secondary">
          {REWARD_AMOUNT.toLocaleString()}
        </div>
        <div className="text-sm text-muted-foreground">FCFA</div>
      </div>
    )}
  </div>

  {/* Progress Bar */}
  <div className="relative">
    <div className="h-3 bg-muted rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${progressPercentage}%` }}
        transition={{ duration: 1, ease: "easeOut" }}
        className={`h-full ${
          hasReachedReward ? "bg-secondary" : "bg-primary"
        }`}
      />
    </div>

    <div className="mt-2 flex justify-between text-sm">
      <span className="text-muted-foreground">{totalReferrals} filleuls</span>
      <span className="font-semibold">
        {Math.round(progressPercentage)}%
      </span>
      <span className="text-muted-foreground">
        {REWARD_THRESHOLD} filleuls
      </span>
    </div>
  </div>

  {/* CTA Réclamation */}
{hasReachedReward && !rewardClaimed && (
  <div className="mt-6 flex justify-end">
    <button
      onClick={handleClaimReward}
      disabled={claiming}
      className="px-6 py-2 rounded-xl font-medium
                 bg-secondary text-white
                 hover:bg-secondary/90
                 disabled:opacity-60 disabled:cursor-not-allowed
                 transition-colors"
    >
      {claiming ? "Traitement..." : "Réclamer la récompense"}
    </button>
  </div>
)}

{hasReachedReward && rewardClaimed && (
  <div className="mt-6 flex justify-end">
    <span className="px-4 py-2 rounded-xl bg-secondary/20 text-secondary font-semibold text-sm">
      Récompense réclamée
    </span>
  </div>
)}

</motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Users className="text-primary" size={24} />
            </div>
            <div className="text-3xl font-bold">{totalReferrals}</div>
          </div>
          <div className="text-sm text-muted-foreground">Parrainages Total</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
              <CheckCircle className="text-secondary" size={24} />
            </div>
            <div className="text-3xl font-bold">{sponsorProfile?.active_referrals || 0}</div>
          </div>
          <div className="text-sm text-muted-foreground">Filleuls Actifs</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
              <QrCode className="text-accent" size={24} />
            </div>
            <div className="text-2xl font-bold font-mono">{sponsorProfile?.sponsor_code}</div>
          </div>
          <div className="text-sm text-muted-foreground">Code de Parrainage</div>
        </motion.div>
      </div>

      {/* QR Code and Link Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* QR Code */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass rounded-2xl p-6"
        >
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <QrCode size={24} className="text-primary" />
            Votre QR Code de Parrainage
          </h3>

          <div className="bg-white rounded-2xl p-6 mb-4 flex items-center justify-center">
            {qrCodeUrl && (
              <img 
                src={qrCodeUrl} 
                alt="QR Code Parrainage" 
                className="w-64 h-64"
              />
            )}
          </div>

          <div className="space-y-3">
            <button
              onClick={downloadQRCode}
              className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
            >
              <Download size={20} />
              Télécharger le QR Code
            </button>

            <p className="text-sm text-muted-foreground text-center">
              Partagez ce QR code pour que vos filleuls puissent s'inscrire en le scannant
            </p>
          </div>
        </motion.div>

        {/* Referral Link */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass rounded-2xl p-6"
        >
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Link2 size={24} className="text-secondary" />
            Lien de Parrainage
          </h3>

          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-xl border border-border">
              <div className="text-xs text-muted-foreground mb-2">Votre lien personnel</div>
              <div className="text-sm font-mono break-all">{referralUrl}</div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => copyToClipboard(referralUrl)}
                className="px-4 py-3 glass rounded-xl hover:bg-muted transition-colors flex items-center justify-center gap-2"
              >
                {copied ? (
                  <>
                    <CheckCircle size={20} className="text-secondary" />
                    Copié !
                  </>
                ) : (
                  <>
                    <Copy size={20} />
                    Copier
                  </>
                )}
              </button>

              <button
                onClick={shareReferralLink}
                className="px-4 py-3 glass rounded-xl hover:bg-muted transition-colors flex items-center justify-center gap-2"
              >
                <Share2 size={20} />
                Partager
              </button>
            </div>

            <div className="bg-accent/10 border border-accent rounded-xl p-4">
              <div className="text-sm space-y-2">
                <div className="font-semibold text-foreground flex items-center gap-2">
                  <TrendingUp size={16} className="text-accent" />
                  Programme de Récompenses
                </div>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Partagez votre lien ou QR code</li>
                  <li>• Vos filleuls s'inscrivent via votre lien</li>
                  <li>• À 200 filleuls: gagnez {REWARD_AMOUNT.toLocaleString()} FCFA</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Referrals List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass rounded-2xl p-6"
      >
        <h3 className="text-xl font-bold mb-6">Mes Filleuls ({referrals.length})</h3>

        {referrals.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="text-muted-foreground" size={32} />
            </div>
            <h4 className="font-semibold mb-2">Aucun filleul pour le moment</h4>
            <p className="text-sm text-muted-foreground">
              Partagez votre lien ou QR code pour commencer à parrainer
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {referrals.map((referral, index) => {
              // Gérer les différentes structures de données possibles
              const userName = referral.user?.display_name || "Utilisateur";
              const createdAt = referral.created_at || new Date();
              
              return (
                <motion.div
                  key={referral.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 bg-muted rounded-xl border border-border flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Users size={20} className="text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold">{userName}</div>
                      <div className="text-xs text-muted-foreground">
                        Inscrit le {new Date(createdAt).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    referral.status === 'active' 
                      ? 'bg-secondary/20 text-secondary'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {referral.status === 'active' ? 'Actif' : 'Inactif'}
                  </span>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}