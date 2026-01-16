// frontend/src/components/ChatListWithStream.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MessageSquare, Loader2 } from "lucide-react";
import { useStreamChat } from "../contexts/StreamChatContext";
import { useAuth } from "../contexts/AuthContext";

export default function ChatListWithStream() {
  const navigate = useNavigate();
  const { client, loading: chatLoading } = useStreamChat();
  const { user } = useAuth();
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!client || !user) return;
  
    const loadChannels = async () => {
      try {
        const filter = {
          type: "messaging",
          members: { $in: [user.id] },
        };
        const sort = [{ last_message_at: -1 }];
  
        const channelsList = await client.queryChannels(filter, sort, {
          watch: true,
          state: true,
        });
  
        // Watch explicitement chaque canal pour recevoir les messages en temps réel
        for (const channel of channelsList) {
          await channel.watch();
        }
  
        setChannels(channelsList);
        console.log("✅ Canaux chargés:", channelsList.length, channelsList.map(c => c.id));
      } catch (error) {
        console.error("❌ Erreur chargement canaux:", error);
      } finally {
        setLoading(false);
      }
    };
  
    loadChannels();
  
    const handleEvent = (event) => {
      if (event.type === "message.new") {
        loadChannels();
      }
    };
  
    client.on(handleEvent);
    return () => client.off(handleEvent);
  }, [client, user]);
  

  const formatTime = (date) => {
    if (!date) return "";
    const messageDate = new Date(date);
    const now = new Date();
    const diff = now - messageDate;

    // Moins d'une heure
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return minutes < 1 ? "À l'instant" : `Il y a ${minutes} min`;
    }

    // Aujourd'hui
    if (messageDate.toDateString() === now.toDateString()) {
      return new Intl.DateTimeFormat("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(messageDate);
    }

    // Cette semaine
    if (diff < 604800000) {
      return new Intl.DateTimeFormat("fr-FR", {
        weekday: "short",
      }).format(messageDate);
    }

    // Plus ancien
    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "short",
    }).format(messageDate);
  };

  const getOtherMember = (channel) => {
    const members = Object.values(channel.state.members);
    const otherMember = members.find((m) => m.user.id !== user.id);
    return otherMember?.user;
  };

  const getUnreadCount = (channel) => {
    return channel.countUnread();
  };

  if (chatLoading || loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (!client || !user) {
    return (
      <div className="text-center py-12 glass rounded-xl p-6">
        <MessageSquare className="mx-auto mb-4 text-muted-foreground" size={48} />
        <h3 className="text-xl font-semibold mb-2">Connexion requise</h3>
        <p className="text-muted-foreground">
          Connectez-vous pour accéder à vos conversations
        </p>
      </div>
    );
  }

  if (channels.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <MessageSquare className="text-muted-foreground" size={32} />
        </div>
        <h3 className="text-xl font-semibold mb-2">Aucune conversation</h3>
        <p className="text-muted-foreground">
          Vos conversations apparaîtront ici
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {channels.map((channel, index) => {
        const otherUser = getOtherMember(channel);
        const lastMessage = channel.state.messages[channel.state.messages.length - 1];
        const unreadCount = getUnreadCount(channel);

        return (
          <motion.div
            key={channel.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <button
              onClick={() => navigate(`/chat/${channel.id}`)}
              className="w-full glass rounded-xl p-4 hover:bg-muted/50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                    <span className="text-lg font-semibold text-primary">
                      {otherUser?.name?.[0] || otherUser?.id?.[0] || "?"}
                    </span>
                  </div>
                  {otherUser?.online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-secondary rounded-full border-2 border-background" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold truncate">
                      {otherUser?.name || otherUser?.id || "Utilisateur"}
                    </h3>
                    <span className="text-xs text-muted-foreground">
                      {formatTime(lastMessage?.created_at)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground truncate flex-1">
                      {lastMessage?.text || "Aucun message"}
                    </p>
                    {unreadCount > 0 && (
                      <span className="ml-2 w-5 h-5 bg-primary text-primary-foreground rounded-full text-xs flex items-center justify-center font-semibold">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          </motion.div>
        );
      })}
    </div>
  );
}