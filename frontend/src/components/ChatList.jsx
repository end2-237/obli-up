// frontend/src/components/ChatList.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MessageSquare, Loader2, RefreshCw, Search } from "lucide-react";
import { useStreamChat } from "../contexts/StreamChatContext";
import { useAuth } from "../contexts/AuthContext";

export default function ChatListWithStream() {
  const navigate = useNavigate();
  const { client, loading: chatLoading, isReady } = useStreamChat();
  const { user } = useAuth();
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const loadChannels = async (showLoader = true) => {
    if (!client || !user || !isReady) {
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
      const options = {
        watch: true,
        state: true,
        presence: true,
        limit: 30,
      };

      const channelsList = await client.queryChannels(filter, sort, options);
      setChannels(channelsList);

    } catch (error) {
      console.error("❌ Erreur chargement canaux:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (client && user && isReady && !chatLoading) {
      loadChannels();
    }
  }, [client, user, isReady, chatLoading]);

  // Écouter les événements Stream
  useEffect(() => {
    if (!client) return;

    const handleEvent = (event) => {
      if (
        event.type === "message.new" ||
        event.type === "channel.updated" ||
        event.type === "notification.added_to_channel" ||
        event.type === "notification.message_new"
      ) {
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
      return minutes < 1 ? "À l'instant" : `${minutes}min`;
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
    try {
      return channel.countUnread() || 0;
    } catch {
      return 0;
    }
  };

  // Filtrer les canaux selon la recherche
  const filteredChannels = channels.filter((channel) => {
    if (!searchQuery) return true;
    const otherUser = getOtherMember(channel);
    const userName = otherUser?.name?.toLowerCase() || "";
    const lastMessage = channel.state.messages[channel.state.messages.length - 1];
    const messageText = lastMessage?.text?.toLowerCase() || "";
    
    return userName.includes(searchQuery.toLowerCase()) || 
           messageText.includes(searchQuery.toLowerCase());
  });

  if (chatLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="animate-spin text-primary mx-auto mb-3" size={40} />
          <p className="text-sm text-muted-foreground">Chargement des conversations...</p>
        </div>
      </div>
    );
  }

  if (!client || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="text-center glass rounded-2xl p-8 max-w-md">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="text-primary" size={32} />
          </div>
          <h3 className="text-xl font-semibold mb-2">Connexion requise</h3>
          <p className="text-muted-foreground">
            Connectez-vous pour accéder à vos conversations
          </p>
        </div>
      </div>
    );
  }

  if (channels.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="text-primary" size={40} />
          </div>
          <h3 className="text-2xl font-bold mb-2">Aucune conversation</h3>
          <p className="text-muted-foreground mb-6">
            Vos conversations apparaîtront ici une fois que vous aurez contacté un vendeur
          </p>
          <button
            onClick={() => loadChannels()}
            disabled={refreshing}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors inline-flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} />
            Rafraîchir
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 pb-20">
      {/* Header avec recherche */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">Messages</h1>
            <p className="text-sm text-muted-foreground">
              {filteredChannels.length} conversation{filteredChannels.length > 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={() => loadChannels()}
            disabled={refreshing}
            className="p-2.5 hover:bg-muted rounded-xl transition-colors disabled:opacity-50"
            title="Rafraîchir"
          >
            <RefreshCw 
              size={20} 
              className={refreshing ? "animate-spin" : ""} 
            />
          </button>
        </div>

        {/* Barre de recherche */}
        {channels.length > 3 && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input
              type="text"
              placeholder="Rechercher une conversation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 glass rounded-xl border border-border/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
        )}
      </div>

      {/* Liste des conversations */}
      <div className="space-y-2">
        {filteredChannels.length === 0 && searchQuery ? (
          <div className="text-center py-12 glass rounded-xl">
            <p className="text-muted-foreground">Aucun résultat pour "{searchQuery}"</p>
          </div>
        ) : (
          filteredChannels.map((channel, index) => {
            const otherUser = getOtherMember(channel);
            const lastMessage = channel.state.messages[channel.state.messages.length - 1];
            const unreadCount = getUnreadCount(channel);
            const isUnread = unreadCount > 0;

            return (
              <motion.div
                key={channel.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03, duration: 0.2 }}
              >
                <button
                  onClick={() => navigate(`/chat/${channel.id}`)}
                  className={`w-full glass rounded-xl p-4 hover:bg-muted/50 transition-all text-left ${
                    isUnread ? 'border-2 border-primary/30' : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
                        isUnread ? 'bg-primary/30' : 'bg-primary/10'
                      }`}>
                        {otherUser?.image ? (
                          <img 
                            src={otherUser.image} 
                            alt={otherUser.name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span className={`text-xl font-bold ${
                            isUnread ? 'text-primary' : 'text-primary/70'
                          }`}>
                            {otherUser?.name?.[0]?.toUpperCase() || "?"}
                          </span>
                        )}
                      </div>
                      {otherUser?.online && (
                        <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-background" />
                      )}
                      {isUnread && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                          <span className="text-[10px] font-bold text-primary-foreground">
                            {unreadCount > 9 ? '9+' : unreadCount}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Contenu */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className={`font-semibold truncate ${
                          isUnread ? 'text-foreground' : 'text-foreground/90'
                        }`}>
                          {otherUser?.name || "Utilisateur"}
                        </h3>
                        <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                          {formatTime(lastMessage?.created_at)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <p className={`text-sm truncate flex-1 ${
                          isUnread 
                            ? 'text-foreground/80 font-medium' 
                            : 'text-muted-foreground'
                        }`}>
                          {lastMessage?.text || "Pas encore de message"}
                        </p>
                      </div>
                    </div>
                  </div>
                </button>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}