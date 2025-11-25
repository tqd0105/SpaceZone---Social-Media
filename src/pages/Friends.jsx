import { useState, useEffect } from 'react';
import './Friends.module.scss';
import { 
  FriendsList, 
  FriendRequests, 
  AddFriendButton,
  UserSearchModal 
} from '../components/friends';
import { getFriendSuggestions } from '../services/friendService';
import SimpleSearchBar from '../components/common/SimpleSearchBar';

const Friends = () => {
  const [activeTab, setActiveTab] = useState('list'); // list, requests, suggestions
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearchModal, setShowSearchModal] = useState(false);

  console.log('👥 Friends page rendered');

  // Load friend suggestions
  const loadSuggestions = async () => {
    try {
      setLoadingSuggestions(true);
      console.log('🎯 Loading friend suggestions...');
      
      const response = await getFriendSuggestions(10);
      setSuggestions(response.data.suggestions || []);
      
      console.log(`✅ Loaded ${response.data.suggestions.length} friend suggestions`);
    } catch (error) {
      console.error('❌ Error loading friend suggestions:', error);
      setSuggestions([]);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  // Load suggestions when suggestions tab is active
  useEffect(() => {
    if (activeTab === 'suggestions') {
      loadSuggestions();
    }
  }, [activeTab]);

  // Handle friend selection (to start chat)
  const handleFriendSelect = (friend) => {
    console.log(`👤 Friend selected for chat:`, friend);
    // This will integrate with chat system later
    alert(`Bắt đầu chat với ${friend.username}! (Tính năng này sẽ được tích hợp sau)`);
  };

  // Handle friend request updates
  const handleRequestUpdate = (action, request) => {
    console.log(`📨 Friend request ${action}:`, request);
    
    if (action === 'accepted') {
      // Refresh suggestions to remove the user from suggestions
      if (activeTab === 'suggestions') {
        loadSuggestions();
      }
    }
  };

  // Handle friend request sent
  const handleRequestSent = (userId, username) => {
    console.log(`📤 Friend request sent to ${username}`);
    
    // Remove from suggestions if currently showing
    setSuggestions(prev => prev.filter(user => user._id !== userId));
  };

  return (
    <div className="friends-page">
      <div className="friends-page__header">
        <h1>Bạn bè</h1>
        
        <div className="friends-page__search">
          <SimpleSearchBar
            placeholder="Tìm kiếm bạn bè..."
            onSearch={setSearchTerm}
            value={searchTerm}
            debounceMs={500}
          />
          
          <button 
            className="friends-page__search-users-btn"
            onClick={() => setShowSearchModal(true)}
            title="Tìm người dùng để kết bạn"
          >
            Tìm bạn mới
          </button>
        </div>

        <div className="friends-page__tabs">
          <button
            className={`friends-page__tab ${activeTab === 'list' ? 'friends-page__tab--active' : ''}`}
            onClick={() => setActiveTab('list')}
          >
            Danh sách bạn bè
          </button>
          <button
            className={`friends-page__tab ${activeTab === 'requests' ? 'friends-page__tab--active' : ''}`}
            onClick={() => setActiveTab('requests')}
          >
            Lời mời kết bạn
          </button>
          <button
            className={`friends-page__tab ${activeTab === 'suggestions' ? 'friends-page__tab--active' : ''}`}
            onClick={() => setActiveTab('suggestions')}
          >
            Gợi ý kết bạn
          </button>
        </div>
      </div>

      <div className="friends-page__content">
        {/* Friends List Tab */}
        {activeTab === 'list' && (
          <FriendsList
            onFriendSelect={handleFriendSelect}
            showRemoveButton={true}
            searchable={false} // Using parent search
          />
        )}

        {/* Friend Requests Tab */}
        {activeTab === 'requests' && (
          <FriendRequests
            initialType="both"
            onRequestUpdate={handleRequestUpdate}
          />
        )}

        {/* Friend Suggestions Tab */}
        {activeTab === 'suggestions' && (
          <div className="friends-page__suggestions">
            {loadingSuggestions ? (
              <div className="friends-page__loading">
                <div className="friends-page__spinner"></div>
                <p>Đang tìm gợi ý...</p>
              </div>
            ) : suggestions.length === 0 ? (
              <div className="friends-page__empty">
                <p>Không có gợi ý kết bạn nào</p>
              </div>
            ) : (
              <div className="friends-page__suggestions-grid">
                {suggestions.map(user => (
                  <div key={user._id} className="friends-page__suggestion-card">
                    <div className="friends-page__suggestion-avatar">
                      <img 
                        src={user.profilePicture || '/images/default-avatar.png'}
                        alt={user.username}
                        onError={(e) => {
                          e.target.src = '/images/default-avatar.png';
                        }}
                      />
                    </div>
                    
                    <div className="friends-page__suggestion-info">
                      <h4 className="friends-page__suggestion-name">
                        {user.username}
                      </h4>
                      {user.fullName && (
                        <p className="friends-page__suggestion-full-name">
                          {user.fullName}
                        </p>
                      )}
                      {user.mutualFriends > 0 && (
                        <p className="friends-page__mutual-friends">
                          {user.mutualFriends} bạn chung
                        </p>
                      )}
                    </div>

                    <div className="friends-page__suggestion-actions">
                      <AddFriendButton
                        userId={user._id}
                        username={user.username}
                        onRequestSent={handleRequestSent}
                        size="small"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* User Search Modal */}
      <UserSearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        onFriendRequestSent={(userId, username) => {
          console.log(`📤 Friend request sent to ${username} from search`);
          // Could refresh suggestions or show success message
        }}
      />
    </div>
  );
};

export default Friends;