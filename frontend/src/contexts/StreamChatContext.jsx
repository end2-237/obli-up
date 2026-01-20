// frontend/src/contexts/StreamChatContext.jsx
import { createContext, useContext, useEffect, useState } from 'react'
import { StreamChat } from 'stream-chat'
import { useAuth } from './AuthContext'
import { supabase } from '../lib/supabase'

const StreamChatContext = createContext(null)

export const useStreamChat = () => {
  const ctx = useContext(StreamChatContext)
  if (!ctx) {
    throw new Error('useStreamChat must be used within StreamChatProvider')
  }
  return ctx
}

let globalClient = null; // ✅ Instance globale pour survivre au StrictMode

export const StreamChatProvider = ({ children }) => {
  const { user } = useAuth();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!user) {
      setClient(null);
      setLoading(false);
      setError(null);
      setIsReady(false);
      return;
    }

    // ✅ Si on a déjà un client global pour ce user, le réutiliser
    if (globalClient?.userID === user.id) {
      console.log('✅ Réutilisation client existant');
      setClient(globalClient);
      setIsReady(true);
      setLoading(false);
      window.__streamClient = globalClient;
      return;
    }

    let cancelled = false;

    const initChat = async () => {
      try {
        setLoading(true);
        setIsReady(false);
        console.log('🔄 Init Stream pour:', user.email);

        const apiKey = import.meta.env.VITE_STREAM_API_KEY || "8ft8rb9avt9r";
        const { data: sessionData } = await supabase.auth.getSession();
        const accessToken = sessionData?.session?.access_token;

        if (!accessToken) throw new Error('No access token');

        const res = await fetch(`http://localhost:3000/stream/token`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        });

        if (!res.ok) throw new Error('Failed to get Stream token');

        const { token } = await res.json();
        console.log('✅ Token reçu');

        const chatClient = StreamChat.getInstance(apiKey);

        // Déconnecter ancien user si différent
        if (chatClient.userID && chatClient.userID !== user.id) {
          await chatClient.disconnectUser();
        }

        // Connecter si pas connecté
        if (!chatClient.userID) {
          await chatClient.connectUser(
            {
              id: user.id,
              name: user.user_metadata?.name || user.email.split('@')[0],
              email: user.email,
              image: user.user_metadata?.avatar_url,
            },
            token
          );
          console.log('✅ Connecté');
        }

        // ✅ TOUJOURS mettre à jour même si cancelled
        // (pour survivre au StrictMode)
        globalClient = chatClient;
        window.__streamClient = chatClient;
        
        if (!cancelled) {
          setClient(chatClient);
          setIsReady(true);
          setError(null);
          console.log('✅ Client prêt');
        } else {
          console.log('⚠️ Cancelled mais client sauvegardé');
        }

      } catch (err) {
        console.error('❌ Erreur:', err);
        if (!cancelled) {
          setError(err.message);
          setIsReady(false);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    initChat();

    return () => {
      cancelled = true;
      // Ne PAS déconnecter pour survivre au StrictMode
    };
  }, [user?.id]);

  return (
    <StreamChatContext.Provider value={{ client, loading, error, isReady }}>
      {children}
    </StreamChatContext.Provider>
  );
};