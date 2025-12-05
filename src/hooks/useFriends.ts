'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export interface Friend {
  id: string;
  username: string;
  avatar_url: string | null;
  status: 'accepted' | 'pending' | 'blocked';
  created_at: string;
  is_incoming: boolean; // true si es una solicitud que recibimos
}

export interface FriendRequest {
  id: string;
  user_id: string;
  friend_id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'blocked';
  created_at: string;
  username: string;
  avatar_url: string | null;
  is_incoming: boolean;
}

export type FriendshipStatus = 'none' | 'pending_sent' | 'pending_received' | 'friends' | 'blocked';

export function useFriends(userId?: string) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar amigos y solicitudes
  const loadFriendsData = useCallback(async () => {
    if (!userId) {
      setFriends([]);
      setFriendRequests([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Cargar amistades (tanto enviadas como recibidas)
      const { data: friendshipsData, error: friendshipsError } = await supabase
        .from('friendships')
        .select('*')
        .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
        .in('status', ['accepted', 'pending']);

      if (friendshipsError) throw friendshipsError;

      // Obtener IDs únicos de todos los usuarios relacionados
      const userIds = new Set<string>();
      friendshipsData.forEach(friendship => {
        userIds.add(friendship.user_id);
        userIds.add(friendship.friend_id);
      });
      userIds.delete(userId); // Remover el usuario actual

      // Cargar perfiles de todos los usuarios
      const { data: profiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('id, username, avatar_url')
        .in('id', Array.from(userIds));

      if (profilesError) throw profilesError;

      // Crear mapa de perfiles
      const profilesMap = new Map(profiles.map(p => [p.id, p]));

      // Procesar amigos (status = 'accepted')
      const friendsList: Friend[] = friendshipsData
        .filter(f => f.status === 'accepted')
        .map(friendship => {
          const friendId = friendship.user_id === userId ? friendship.friend_id : friendship.user_id;
          const profile = profilesMap.get(friendId);
          
          if (!profile) return null;

          return {
            id: friendId,
            username: profile.username,
            avatar_url: profile.avatar_url,
            status: 'accepted' as const,
            created_at: friendship.created_at,
            is_incoming: friendship.friend_id === userId
          };
        })
        .filter(friend => friend !== null) as Friend[];

      // Procesar solicitudes pendientes
      const requestsList: FriendRequest[] = friendshipsData
        .filter(f => f.status === 'pending')
        .map(friendship => {
          const isIncoming = friendship.friend_id === userId;
          const otherUserId = isIncoming ? friendship.user_id : friendship.friend_id;
          const profile = profilesMap.get(otherUserId);
          
          if (!profile) return null;

          return {
            id: friendship.id,
            user_id: friendship.user_id,
            friend_id: friendship.friend_id,
            status: 'pending' as const,
            created_at: friendship.created_at,
            username: profile.username,
            avatar_url: profile.avatar_url,
            is_incoming: isIncoming
          };
        })
        .filter(request => request !== null) as FriendRequest[];

      setFriends(friendsList);
      setFriendRequests(requestsList);

    } catch (error) {
      console.error('Error loading friends data:', error);
      setError('Error loading friends data');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Obtener estado de amistad con un usuario específico
  const getFriendshipStatus = useCallback(async (targetUserId: string): Promise<FriendshipStatus> => {
    if (!userId || userId === targetUserId) return 'none';

    try {
      const { data, error } = await supabase
        .from('friendships')
        .select('*')
        .or(`and(user_id.eq.${userId},friend_id.eq.${targetUserId}),and(user_id.eq.${targetUserId},friend_id.eq.${userId})`)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      if (!data) return 'none';

      if (data.status === 'accepted') return 'friends';
      if (data.status === 'blocked') return 'blocked';
      if (data.status === 'pending') {
        return data.user_id === userId ? 'pending_sent' : 'pending_received';
      }

      return 'none';
    } catch (error) {
      console.error('Error getting friendship status:', error);
      return 'none';
    }
  }, [userId]);

  // Enviar solicitud de amistad
  const sendFriendRequest = useCallback(async (targetUserId: string) => {
    if (!userId) throw new Error('User not authenticated');
    if (userId === targetUserId) throw new Error('Cannot add yourself');

    // Verificar si ya existe una relación
    const status = await getFriendshipStatus(targetUserId);
    if (status !== 'none') {
      throw new Error(`Already ${status}`);
    }

    const { error } = await supabase
      .from('friendships')
      .insert({
        user_id: userId,
        friend_id: targetUserId,
        status: 'pending'
      });

    if (error) throw error;

    // Recargar datos
    await loadFriendsData();
  }, [userId, getFriendshipStatus, loadFriendsData]);

  // Aceptar solicitud de amistad
  const acceptFriendRequest = useCallback(async (requestId: string) => {
    const { error } = await supabase
      .from('friendships')
      .update({ status: 'accepted' })
      .eq('id', requestId);

    if (error) throw error;

    // Recargar datos
    await loadFriendsData();
  }, [loadFriendsData]);

  // Rechazar solicitud de amistad
  const rejectFriendRequest = useCallback(async (requestId: string) => {
    const { error } = await supabase
      .from('friendships')
      .delete()
      .eq('id', requestId);

    if (error) throw error;

    // Recargar datos
    await loadFriendsData();
  }, [loadFriendsData]);

  // Eliminar amigo
  const removeFriend = useCallback(async (friendId: string) => {
    if (!userId) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('friendships')
      .delete()
      .or(`and(user_id.eq.${userId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${userId})`);

    if (error) throw error;

    // Recargar datos
    await loadFriendsData();
  }, [userId, loadFriendsData]);

  // Buscar usuario por username
  const searchUser = useCallback(async (username: string) => {
    if (!username.trim()) return null;

    const { data, error } = await supabase
      .from('user_profiles')
      .select('id, username, avatar_url')
      .eq('username', username.trim())
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  }, []);

  useEffect(() => {
    loadFriendsData();
  }, [loadFriendsData]);

  return {
    friends,
    friendRequests,
    loading,
    error,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
    getFriendshipStatus,
    searchUser,
    refreshFriends: loadFriendsData
  };
}
