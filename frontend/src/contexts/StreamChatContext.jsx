
import { createContext, useContext, useEffect, useState, useRef } from 'react'
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

export const StreamChatProvider = ({ children }) => {
  const { user } = useAuth();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const clientRef = useRef(null);

  useEffect(() => {
    if (!user) {
      // Aucun user → cleanup
      if (clientRef.current) {
        clientRef.current.disconnectUser().catch(console.error);
        clientRef.current = null;
      }
      setClient(null);
      setLoading(false);
      setError(null);
      return;
    }

    // Ne rien faire si déjà connecté pour le même user
    if (clientRef.current?.userID === user.id) {
      setClient(clientRef.current);
      setLoading(false);
      return;
    }

    let isMounted = true;

    const initChat = async () => {
      try {
        setLoading(true);
        setError(null);

        const apiKey = import.meta.env.VITE_STREAM_API_KEY || "8ft8rb9avt9r";
        const { data: sessionData } = await supabase.auth.getSession();
        const accessToken = sessionData?.session?.access_token;

        const res = await fetch(`http://localhost:3000/stream/token`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        });

        const { token } = await res.json();

        const chatClient = StreamChat.getInstance(apiKey);

        // Connecter seulement si pas déjà connecté
        if (!chatClient.userID) {
          await chatClient.connectUser(
            {
              id: user.id,
              name: user.user_metadata?.name || user.email.split('@')[0],
              email: user.email,
            },
            token
          );
        }

        if (isMounted) {
          clientRef.current = chatClient;
          setClient(chatClient);
          setError(null);
        }
      } catch (err) {
        console.error(err);
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initChat();

    return () => {
      isMounted = false;
    };
  }, [user]);

  return (
    <StreamChatContext.Provider value={{ client, loading, error }}>
      {children}
    </StreamChatContext.Provider>
  );
};
