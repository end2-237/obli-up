// frontend/src/components/ShareButtons.jsx
import { Share2, MessageCircle } from 'lucide-react';

export default function ShareButtons({ item }) {
  const shareUrl = `${window.location.origin}/items/${item.id}`;
  const imageUrl = item.image || '';
  
  const shareMessage = `🔍 ${item.type === 'lost' ? 'OBJET PERDU' : 'OBJET TROUVÉ'} 🔍

📦 ${item.title}
📍 ${item.location}
📅 ${new Date(item.date).toLocaleDateString('fr-FR')}

${item.description.substring(0, 100)}...

👉 Voir les détails: ${shareUrl}

#ObliApp #ObjetPerdu #ObjetTrouvé`;

  const handleWhatsAppShare = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleWhatsAppStatus = () => {
    // Pour le statut WhatsApp, ouvrir l'app directement
    const statusText = `${item.type === 'lost' ? '🔴' : '🟢'} ${item.title}\n${item.location}\n\n${shareUrl}`;
    const whatsappStatusUrl = `whatsapp://send?text=${encodeURIComponent(statusText)}`;
    
    // Fallback vers le web si l'app n'est pas installée
    try {
      window.location.href = whatsappStatusUrl;
      
      // Fallback après 1 seconde
      setTimeout(() => {
        handleWhatsAppShare();
      }, 1000);
    } catch {
      handleWhatsAppShare();
    }
  };

  const handleGeneralShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: item.title,
          text: shareMessage,
          url: shareUrl,
        });
      } catch (err) {
        console.log('Partage annulé');
      }
    } else {
      // Fallback: copier dans le presse-papier
      navigator.clipboard.writeText(`${shareMessage}\n\n${shareUrl}`);
      alert('✅ Lien copié dans le presse-papier!');
    }
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={handleWhatsAppStatus}
        className="flex-1 px-4 py-3 bg-[#25D366] text-white rounded-xl font-semibold hover:bg-[#128C7E] transition-colors flex items-center justify-center gap-2"
      >
        <MessageCircle size={20} />
        Statut WhatsApp
      </button>
      
      <button
        onClick={handleWhatsAppShare}
        className="px-4 py-3 bg-[#25D366] text-white rounded-xl font-semibold hover:bg-[#128C7E] transition-colors"
      >
        <MessageCircle size={20} />
      </button>
      
      <button
        onClick={handleGeneralShare}
        className="px-4 py-3 glass rounded-xl hover:bg-muted transition-colors"
      >
        <Share2 size={20} />
      </button>
    </div>
  );
}