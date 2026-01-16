import { supabase } from '../lib/supabase';

/**
 * Génère un ID unique alphanumérique de longueur fixe
 * @param {string[]} parts - Parties à inclure (userId, itemId, ...)
 * @param {number} length - Longueur max
 */
function generateChannelId(parts, length = 64) {
  const raw = parts.filter(Boolean).sort().join('-'); // concat + tri pour cohérence
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    hash = (hash << 5) - hash + raw.charCodeAt(i);
    hash |= 0; // 32-bit integer
  }
  // Hex string et tronquer à length
  return Math.abs(hash).toString(16).slice(0, length);
}

export async function createOrGetChannel(
  client,
  currentUserId,
  otherUserId,
  itemId = '',
  itemTitle = ''
) {
  try {
    const channelId = generateChannelId([currentUserId, otherUserId, itemId], 64);
    console.log('🔄 Channel ID généré:', channelId);

    // Vérifier si le canal existe
    const existingChannel = client.channel('messaging', channelId);
    try {
      await existingChannel.watch();
      console.log('✅ Canal existant récupéré:', channelId);
      return existingChannel;
    } catch {
      console.log('⚠️ Canal non trouvé, création via backend...');
    }

    // Création via backend
    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData?.session?.access_token;
    if (!accessToken) throw new Error('No authentication token');

    const response = await fetch('http://localhost:3000/stream/create-channel', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        channelId,
        otherUserId,
        itemId,
        itemTitle,
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || 'Failed to create channel');
    }

    const { channelId: createdChannelId } = await response.json();

    const newChannel = client.channel('messaging', createdChannelId);
    await newChannel.watch();
    console.log('✅ Nouveau canal créé:', createdChannelId);
    return newChannel;

  } catch (error) {
    console.error('❌ Erreur création/récupération canal:', error);
    throw error;
  }
}
