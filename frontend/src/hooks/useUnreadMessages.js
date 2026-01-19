// frontend/src/hooks/useUnreadMessages.js
import { useState, useEffect } from 'react';
import { useStreamChat } from '../contexts/StreamChatContext';
import { useAuth } from '../contexts/AuthContext';

export const useUnreadMessages = () => {
  const { client } = useStreamChat();
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [recentMessages, setRecentMessages] = useState([]);

  useEffect(() => {
    if (!client || !user) return;

    const loadUnreadMessages = async () => {
      try {
        // Récupérer tous les canaux de l'utilisateur
        const filter = {
          type: 'messaging',
          members: { $in: [user.id] }
        };

        const sort = [{ last_message_at: -1 }];
        const channels = await client.queryChannels(filter, sort, {
          watch: true,
          state: true
        });

        // Calculer le nombre total de messages non lus
        let totalUnread = 0;
        const messages = [];

        channels.forEach(channel => {
          const unread = channel.countUnread();
          totalUnread += unread;

          // Récupérer le dernier message de chaque canal
          const lastMessage = channel.state.messages[channel.state.messages.length - 1];
          if (lastMessage && lastMessage.user.id !== user.id) {
            messages.push({
              channelId: channel.id,
              text: lastMessage.text,
              userName: lastMessage.user.name,
              timestamp: lastMessage.created_at,
              unread: unread
            });
          }
        });

        setUnreadCount(totalUnread);
        setRecentMessages(messages.slice(0, 5)); // Garder seulement les 5 plus récents

        // Écouter les nouveaux messages
        const handleNewMessage = (event) => {
          if (event.user.id !== user.id) {
            setUnreadCount(prev => prev + 1);
          }
        };

        client.on('message.new', handleNewMessage);

        return () => {
          client.off('message.new', handleNewMessage);
        };

      } catch (error) {
        console.error('Erreur chargement messages non lus:', error);
      }
    };

    loadUnreadMessages();

    // Rafraîchir toutes les 30 secondes
    const interval = setInterval(loadUnreadMessages, 30000);

    return () => clearInterval(interval);
  }, [client, user]);

  return { unreadCount, recentMessages };
};