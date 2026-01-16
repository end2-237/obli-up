// frontend/src/pages/ChatPage.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import {
  Chat,
  Channel,
  ChannelHeader,
  MessageInput,
  MessageList,
  Thread,
  Window,
} from "stream-chat-react";
import { useStreamChat } from "../contexts/StreamChatContext";
import { useAuth } from "../contexts/AuthContext";

// Importer les styles CSS de Stream Chat
import "stream-chat-react/dist/css/v2/index.css";

export default function ChatPage() {
  const { channelId } = useParams();
  const navigate = useNavigate();
  const { client, loading: chatLoading } = useStreamChat();
  const { user } = useAuth();
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!client || !user) {
      setLoading(false);
      return;
    }

    const initChannel = async () => {
      try {
        let activeChannel;

        if (channelId) {
          // Rejoindre un canal existant
          activeChannel = client.channel("messaging", channelId);
          await activeChannel.watch();
        } else {
          // Créer/récupérer le canal général pour l'utilisateur
          const channels = await client.queryChannels({
            type: "messaging",
            members: { $in: [user.id] },
          });

          if (channels.length > 0) {
            activeChannel = channels[0];
          } else {
            // Créer un nouveau canal si aucun n'existe
            activeChannel = client.channel("messaging", {
              members: [user.id],
              name: "Mes Conversations",
            });
            await activeChannel.create();
          }
        }

        setChannel(activeChannel);
        console.log("✅ Canal chargé:", activeChannel.id);
      } catch (error) {
        console.error("❌ Erreur chargement canal:", error);
      } finally {
        setLoading(false);
      }
    };

    initChannel();
  }, [client, user, channelId]);

  // Afficher loader pendant le chargement
  if (chatLoading || loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="animate-spin mx-auto mb-4 text-primary" size={48} />
          <p className="text-muted-foreground">Chargement du chat...</p>
        </div>
      </div>
    );
  }

  // Si pas de client Stream ou pas d'utilisateur
  if (!client || !user) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center glass rounded-2xl p-8 max-w-md">
          <h2 className="text-2xl font-bold mb-4">Connexion requise</h2>
          <p className="text-muted-foreground mb-6">
            Vous devez être connecté pour accéder au chat.
          </p>
          <button
            onClick={() => navigate("/auth")}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors"
          >
            Se connecter
          </button>
        </div>
      </div>
    );
  }

  // Si pas de canal chargé
  if (!channel) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Aucune conversation sélectionnée</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header personnalisé */}
      <div className="glass border-b border-border px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate("/chat/list")}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-semibold">Chat</h1>
      </div>

      {/* Stream Chat Component */}
      <div className="flex-1 overflow-hidden">
        <Chat client={client} theme="str-chat__theme-light">
          <Channel channel={channel}>
            <Window>
              <ChannelHeader />
              <MessageList />
              <MessageInput />
            </Window>
            <Thread />
          </Channel>
        </Chat>
      </div>
    </div>
  );
}

// Styles CSS personnalisés à ajouter dans votre globals.css
/*
.str-chat__channel {
  height: 100%;
}

.str-chat__main-panel {
  height: 100%;
}

.str-chat__list {
  background: hsl(var(--background));
}

.str-chat__message-simple {
  background: hsl(var(--muted));
}

.str-chat__message--me .str-chat__message-simple {
  background: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
}

.str-chat__input-flat {
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
}
*/