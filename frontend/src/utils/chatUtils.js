import { supabase } from '../lib/supabase';

/**
 * Génère un ID unique alphanumérique de longueur fixe
 */
function generateChannelId(parts, length = 64) {
  const raw = parts.filter(Boolean).sort().join('-');
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    hash = (hash << 5) - hash + raw.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(16).slice(0, length);
}

/**
 * Vérifie et ajoute les membres manquants à un canal
 */
async function ensureChannelMembers(channel, requiredMembers) {
  try {
    const currentMembers = Object.keys(channel.state.members);
    const missingMembers = requiredMembers.filter(id => !currentMembers.includes(id));
    
    if (missingMembers.length === 0) {
      console.log('✅ Tous les membres sont présents');
      return true;
    }
    
    console.log('⚠️ Membres manquants détectés:', missingMembers);
    console.log('   Membres actuels:', currentMembers);
    console.log('   Membres requis:', requiredMembers);
    
    // ✅ Vérifier si le canal est corrompu (membres = ['0', '1'])
    const isCorrupted = currentMembers.some(id => id === '0' || id === '1');
    
    if (isCorrupted) {
      console.log('🗑️ Canal corrompu détecté, suppression...');
      
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;
      
      if (!accessToken) {
        throw new Error('No authentication token');
      }

      await fetch(`https://obli-up.onrender.com/stream/delete-channel/${channel.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      
      console.log('✅ Canal corrompu supprimé, il sera recréé proprement');
      return false; // Indiquer qu'il faut recréer
    }
    
    // Appeler le backend pour ajouter les membres
    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData?.session?.access_token;
    
    if (!accessToken) {
      throw new Error('No authentication token');
    }

    console.log('🔄 Appel backend pour ajouter les membres...');

    const response = await fetch('https://obli-up.onrender.com/stream/add-members', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        channelId: channel.id,
        memberIds: missingMembers,
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      console.error('❌ Erreur backend ajout membres:', errData);
      throw new Error(errData.error || 'Failed to add members');
    }

    console.log('✅ Membres ajoutés avec succès');
    
    // Rafraîchir le canal pour voir les nouveaux membres
    await channel.watch();
    
    return true;
  } catch (error) {
    console.error('❌ Erreur ensureChannelMembers:', error);
    return false;
  }
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
    const requiredMembers = [currentUserId, otherUserId];
    
    console.log('🔄 Tentative création/récupération canal...');
    console.log('   Channel ID:', channelId);
    console.log('   Current User:', currentUserId);
    console.log('   Other User:', otherUserId);

    // ✅ ÉTAPE 1: Vérifier TOUS les canaux de l'utilisateur d'abord
    try {
      const existingChannels = await client.queryChannels(
        {
          type: 'messaging',
          members: { $in: [currentUserId] }
        },
        { last_message_at: -1 },
        { watch: true, state: true }
      );

      console.log('📋 Canaux existants:', existingChannels.length);

      // Chercher un canal avec les deux membres
      const matchingChannel = existingChannels.find(channel => {
        const memberIds = Object.keys(channel.state.members);
        return memberIds.includes(currentUserId) && memberIds.includes(otherUserId);
      });

      if (matchingChannel) {
        console.log('✅ Canal existant trouvé:', matchingChannel.id);
        
        // ✅ VÉRIFIER les membres même sur un canal existant
        await ensureChannelMembers(matchingChannel, requiredMembers);
        
        return matchingChannel;
      }
    } catch (queryError) {
      console.warn('⚠️ Erreur query canaux existants:', queryError);
    }

    // ✅ ÉTAPE 2: Essayer de watch le canal spécifique
    try {
      const specificChannel = client.channel('messaging', channelId);
      await specificChannel.watch();
      console.log('✅ Canal spécifique trouvé:', channelId);
      
      // ✅ VÉRIFIER ET AJOUTER les membres manquants
      const membersOk = await ensureChannelMembers(specificChannel, requiredMembers);
      
      if (membersOk === false) {
        // Canal corrompu supprimé, on continue pour le recréer
        console.log('🔄 Passage à la création d\'un nouveau canal...');
      } else if (!membersOk) {
        console.warn('⚠️ Impossible d\'ajouter tous les membres');
      } else {
        // Tout est OK, on retourne le canal
        return specificChannel;
      }
    } catch {
      console.log('⚠️ Canal spécifique non trouvé, création...');
    }

    // ✅ ÉTAPE 3: Création via backend
    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData?.session?.access_token;
    
    if (!accessToken) {
      throw new Error('No authentication token');
    }

    console.log('🔄 Appel backend pour création...');

    const response = await fetch('https://obli-up.onrender.com/stream/create-channel', {
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
      console.error('❌ Erreur backend:', errData);
      throw new Error(errData.error || 'Failed to create channel');
    }

    const { channelId: createdChannelId, existing } = await response.json();
    console.log(existing ? '✅ Canal récupéré' : '✅ Canal créé:', createdChannelId);

    // ✅ ÉTAPE 4: Watch avec retry
    let retries = 3;
    let newChannel;

    while (retries > 0) {
      try {
        newChannel = client.channel('messaging', createdChannelId);
        await newChannel.watch();
        console.log('✅ Canal watch réussi');
        break;
      } catch (watchError) {
        retries--;
        console.warn(`⚠️ Erreur watch (${3 - retries}/3):`, watchError.message);
        if (retries === 0) throw watchError;
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Vérifier les membres
    const members = Object.keys(newChannel.state.members);
    console.log('👥 Membres du canal:', members);

    if (!members.includes(currentUserId) || !members.includes(otherUserId)) {
      console.error('❌ PROBLÈME: Membres manquants après création!');
      console.error('   Attendu:', requiredMembers);
      console.error('   Trouvé:', members);
    }

    return newChannel;

  } catch (error) {
    console.error('❌ Erreur complète création/récupération canal:', error);
    throw error;
  }
}