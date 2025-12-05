'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSocialAuth } from '@/contexts/SocialAuthContext';
import { useFriends } from '@/hooks/useFriends';
import { Users, Search, UserPlus, ArrowLeft, Check, X, Trash2, User } from 'lucide-react';

type TabType = 'friends' | 'requests' | 'search';

export default function FriendsPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { user } = useSocialAuth();
  const {
    friends,
    friendRequests,
    loading,
    error,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
    searchUser
  } = useFriends(user?.id);

  const [activeTab, setActiveTab] = useState<TabType>('friends');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<any>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Redirigir si no está autenticado
  if (!user) {
    router.push('/');
    return null;
  }

  const handleBackToGame = () => {
    router.push('/');
  };

  const handleViewProfile = (username: string) => {
    router.push(`/profile?u=${username}`);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setSearchLoading(true);
    setSearchError(null);
    setSearchResult(null);

    try {
      const result = await searchUser(searchQuery.trim());
      if (!result) {
        setSearchError(t.userNotFoundSearch);
      } else if (result.id === user.id) {
        setSearchError(t.cannotAddYourself);
      } else {
        setSearchResult(result);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchError(t.errorLoadingProfile);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSendRequest = async (targetUserId: string) => {
    setActionLoading(targetUserId);
    try {
      await sendFriendRequest(targetUserId);
      setSearchResult(null);
      setSearchQuery('');
      // Mostrar mensaje de éxito (podrías usar un toast aquí)
    } catch (error: any) {
      console.error('Send request error:', error);
      if (error.message.includes('Already')) {
        setSearchError(t.alreadyFriends);
      } else {
        setSearchError('Error sending request');
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    setActionLoading(requestId);
    try {
      await acceptFriendRequest(requestId);
    } catch (error) {
      console.error('Accept request error:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    setActionLoading(requestId);
    try {
      await rejectFriendRequest(requestId);
    } catch (error) {
      console.error('Reject request error:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveFriend = async (friendId: string) => {
    if (!confirm(t.removeFriend + '?')) return;
    
    setActionLoading(friendId);
    try {
      await removeFriend(friendId);
    } catch (error) {
      console.error('Remove friend error:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const incomingRequests = friendRequests.filter(req => req.is_incoming);
  const outgoingRequests = friendRequests.filter(req => !req.is_incoming);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="app-container text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">{t.loadingProfile}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="app-container text-center">
          <div className="text-red-400 text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-white mb-2">{error}</h1>
          <button
            onClick={handleBackToGame}
            className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            {t.profileBackToGame}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container min-h-screen">
      {/* Botón para volver */}
      <div className="mb-6">
        <button
          onClick={handleBackToGame}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <ArrowLeft size={16} />
          {t.profileBackToGame}
        </button>
      </div>

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-2 flex items-center justify-center gap-3">
          <img
            src="/icons/social/friends.png"
            alt="Friends"
            className="w-8 h-8"
          />
          {t.friendsSystem}
        </h1>
        <p className="text-white/60">{t.myFriends}</p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center mb-8">
        <div className="bg-blue-900/50 rounded-lg p-1 border border-blue-500/30">
          <button
            onClick={() => setActiveTab('friends')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-200 ${
              activeTab === 'friends'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-white/70 hover:text-white hover:bg-blue-800/50'
            }`}
          >
            <Users size={20} />
            {t.myFriends} ({friends.length})
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-200 ${
              activeTab === 'requests'
                ? 'bg-yellow-600 text-white shadow-lg'
                : 'text-white/70 hover:text-white hover:bg-blue-800/50'
            }`}
          >
            <UserPlus size={20} />
            {t.friendRequests} ({incomingRequests.length})
          </button>
          <button
            onClick={() => setActiveTab('search')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-200 ${
              activeTab === 'search'
                ? 'bg-green-600 text-white shadow-lg'
                : 'text-white/70 hover:text-white hover:bg-blue-800/50'
            }`}
          >
            <Search size={20} />
            {t.searchFriends}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="bg-blue-900/30 rounded-lg border border-blue-500/30 min-h-[400px]">
        
        {/* Tab: Mis Amigos */}
        {activeTab === 'friends' && (
          <div className="p-6">
            <h2 className="text-xl font-bold text-white mb-4">{t.myFriends}</h2>
            {friends.length === 0 ? (
              <div className="text-center py-12 text-white/60">
                <Users size={48} className="mx-auto mb-4 opacity-50" />
                <p>{t.noFriendsYet}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {friends.map((friend) => (
                  <div
                    key={friend.id}
                    className="flex items-center gap-4 p-4 bg-blue-800/30 rounded-lg hover:bg-blue-800/50 transition-colors"
                  >
                    {/* Avatar */}
                    {friend.avatar_url ? (
                      <img
                        src={friend.avatar_url}
                        alt={friend.username}
                        className="w-12 h-12 rounded-full border-2 border-blue-400/50"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center border-2 border-blue-400/50">
                        <User size={20} className="text-white" />
                      </div>
                    )}

                    {/* Info */}
                    <div className="flex-1">
                      <h3 className="text-white font-semibold">{friend.username}</h3>
                      <p className="text-white/60 text-sm">
                        {t.friends} • {new Date(friend.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewProfile(friend.username)}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
                      >
                        {t.viewMyProfile.replace('mi ', '')}
                      </button>
                      <button
                        onClick={() => handleRemoveFriend(friend.id)}
                        disabled={actionLoading === friend.id}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors disabled:opacity-50"
                      >
                        {actionLoading === friend.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                        ) : (
                          <Trash2 size={14} />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: Solicitudes */}
        {activeTab === 'requests' && (
          <div className="p-6">
            <h2 className="text-xl font-bold text-white mb-4">{t.friendRequests}</h2>
            
            {/* Solicitudes recibidas */}
            {incomingRequests.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-3">{t.incomingRequests}</h3>
                <div className="space-y-3">
                  {incomingRequests.map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center gap-4 p-4 bg-yellow-900/30 rounded-lg border border-yellow-500/30"
                    >
                      {/* Avatar */}
                      {request.avatar_url ? (
                        <img
                          src={request.avatar_url}
                          alt={request.username}
                          className="w-12 h-12 rounded-full border-2 border-yellow-400/50"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-yellow-600 flex items-center justify-center border-2 border-yellow-400/50">
                          <User size={20} className="text-white" />
                        </div>
                      )}

                      {/* Info */}
                      <div className="flex-1">
                        <h3 className="text-white font-semibold">{request.username}</h3>
                        <p className="text-yellow-200/60 text-sm">
                          {new Date(request.created_at).toLocaleDateString()}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAcceptRequest(request.id)}
                          disabled={actionLoading === request.id}
                          className="flex items-center gap-1 px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors disabled:opacity-50"
                        >
                          {actionLoading === request.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                          ) : (
                            <>
                              <Check size={14} />
                              {t.acceptRequest}
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleRejectRequest(request.id)}
                          disabled={actionLoading === request.id}
                          className="flex items-center gap-1 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors disabled:opacity-50"
                        >
                          <X size={14} />
                          {t.rejectRequest}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Solicitudes enviadas */}
            {outgoingRequests.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">{t.outgoingRequests}</h3>
                <div className="space-y-3">
                  {outgoingRequests.map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center gap-4 p-4 bg-blue-800/30 rounded-lg"
                    >
                      {/* Avatar */}
                      {request.avatar_url ? (
                        <img
                          src={request.avatar_url}
                          alt={request.username}
                          className="w-12 h-12 rounded-full border-2 border-blue-400/50"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center border-2 border-blue-400/50">
                          <User size={20} className="text-white" />
                        </div>
                      )}

                      {/* Info */}
                      <div className="flex-1">
                        <h3 className="text-white font-semibold">{request.username}</h3>
                        <p className="text-blue-200/60 text-sm">
                          {t.waitingForResponse} • {new Date(request.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {incomingRequests.length === 0 && outgoingRequests.length === 0 && (
              <div className="text-center py-12 text-white/60">
                <UserPlus size={48} className="mx-auto mb-4 opacity-50" />
                <p>{t.noRequestsYet}</p>
              </div>
            )}
          </div>
        )}

        {/* Tab: Buscar */}
        {activeTab === 'search' && (
          <div className="p-6">
            <h2 className="text-xl font-bold text-white mb-4">{t.searchFriends}</h2>
            
            {/* Buscador */}
            <div className="mb-6">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.searchByUsername}
                  className="flex-1 px-4 py-2 bg-blue-800/50 border border-blue-500/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-blue-400"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button
                  onClick={handleSearch}
                  disabled={searchLoading || !searchQuery.trim()}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {searchLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  ) : (
                    <Search size={20} />
                  )}
                </button>
              </div>
            </div>

            {/* Resultado de búsqueda */}
            {searchError && (
              <div className="mb-4 p-4 bg-red-900/30 border border-red-500/30 rounded-lg text-red-300">
                {searchError}
              </div>
            )}

            {searchResult && (
              <div className="bg-green-900/30 border border-green-500/30 rounded-lg p-4">
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  {searchResult.avatar_url ? (
                    <img
                      src={searchResult.avatar_url}
                      alt={searchResult.username}
                      className="w-12 h-12 rounded-full border-2 border-green-400/50"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center border-2 border-green-400/50">
                      <User size={20} className="text-white" />
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1">
                    <h3 className="text-white font-semibold">{searchResult.username}</h3>
                    <p className="text-green-200/60 text-sm">{t.userNotFoundSearch.replace('no encontrado', 'encontrado')}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleViewProfile(searchResult.username)}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
                    >
                      {t.viewMyProfile.replace('mi ', '')}
                    </button>
                    <button
                      onClick={() => handleSendRequest(searchResult.id)}
                      disabled={actionLoading === searchResult.id}
                      className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors disabled:opacity-50"
                    >
                      {actionLoading === searchResult.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      ) : (
                        t.sendRequest
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {!searchResult && !searchError && !searchLoading && (
              <div className="text-center py-12 text-white/60">
                <Search size={48} className="mx-auto mb-4 opacity-50" />
                <p>{t.searchByUsername}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
