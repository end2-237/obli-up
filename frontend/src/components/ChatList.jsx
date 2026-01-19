// frontend/src/components/ChatList.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MessageSquare, Loader2, RefreshCw } from "lucide-react";
import { useStreamChat } from "../contexts/StreamChatContext";
import { useAuth } from "../contexts/AuthContext";

export default function ChatListWithStream() {
  const navigate = useNavigate();
  const { client, loading: chatLoading } = useStreamChat();
  const { user } = useAuth();
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadChannels = async (showLoader = true) => {
    if (!client || !user) {
      setLoading(false);
      return;
    }

    try {
      if (showLoader) setLoading(true);
      setRefreshing(true);

      const filter = {
        type: "messaging",
        members: { $in: [user.id] },
      };
      const sort = [{ last_message_at: -1 }];

      const channelsList = await client.queryChannels(filter, sort, {
        watch: true,
        state: true,
      });

      // Watch explicitement chaque canal
      await Promise.all(channelsList.map(c => c.watch()));

      setChannels(channelsList);
      console.log("✅ Canaux chargés:", channelsList.length);
    } catch (error) {
      console.error("❌ Erreur chargement canaux:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadChannels();
  }, [client, user]);

  // Écouter les nouveaux messages pour rafraîchir la liste
  useEffect(() => {
    if (!client) return;

    const handleEvent = (event) => {
      console.log('📨 Événement Stream:', event.type);
      
      if (
        event.type === "message.new" ||
        event.type === "channel.updated" ||
        event.type === "notification.added_to_channel"
      ) {
        // Rafraîchir la liste sans loader
        loadChannels(false);
      }
    };

    client.on(handleEvent);
    return () => client.off(handleEvent);
  }, [client]);

  const formatTime = (date) => {
    if (!date) return "";
    const messageDate = new Date(date);
    const now = new Date();
    const diff = now - messageDate;

    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return minutes < 1 ? "À l'instant" : `Il y a ${minutes} min`;
    }

    if (messageDate.toDateString() === now.toDateString()) {
      return new Intl.DateTimeFormat("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(messageDate);
    }

    if (diff < 604800000) {
      return new Intl.DateTimeFormat("fr-FR", { weekday: "short" }).format(messageDate);
    }

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
        <p className="text-muted-foreground mb-4">
          Vos conversations apparaîtront ici
        </p>
        <button
          onClick={() => loadChannels()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors inline-flex items-center gap-2"
        >
          <RefreshCw size={16} />
          Rafraîchir
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Messages ({channels.length})</h2>
        <button
          onClick={() => loadChannels()}
          disabled={refreshing}
          className="p-2 hover:bg-muted rounded-lg transition-colors disabled:opacity-50"
          title="Rafraîchir"
        >
          <RefreshCw className={refreshing ? "animate-spin" : ""} size={20} />
        </button>
      </div>

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
    </div>
  );
}