import { useState, useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import './UserSearchModal.module.scss';
import { searchUsers } from '../../services/userService';
import { AddFriendButton } from './index';
import SimpleSearchBar from '../common/SimpleSearchBar';
import { useRealTimeUser } from '../../hooks/useRealTimeUser';

const API_URL = import.meta.env.VITE_API_URL;
const defaultAvatar = `${API_URL}/uploads/avatar/default.png`;

// Get current user ID from localStorage
const getCurrentUserId = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.id;
  } catch (error) {
    console.error('Error getting current user ID:', error);
    return null;
  }
};

// Component con để handle real-time avatar
const UserSearchCard = ({ user, onFriendRequestSent, showChatButton, onStartChat }) => {
  const currentUser = useRealTimeUser(user);
  
  return (
    <div className="user-search-modal__user-card">
      <div className="user-search-modal__user-avatar">
        <img 
          src={currentUser?.avatar ? `${API_URL}${currentUser.avatar}` : defaultAvatar}
          alt={currentUser?.username || user.username}
          onError={(e) => {
            e.target.src = defaultAvatar;
          }}
        />
      </div>
      
      <div className="user-search-modal__user-info">
        <h4 className="user-search-modal__user-username">
          {currentUser?.username || user.username}
        </h4>
        {(currentUser?.fullName || user.fullName) && (
          <p className="user-search-modal__user-fullname">
            {currentUser?.fullName || user.fullName}
          </p>
        )}
      </div>

      <div className="user-search-modal__user-actions">
        <AddFriendButton
          userId={user._id}
          username={currentUser?.username || user.username}
          onRequestSent={onFriendRequestSent}
          size="small"
        />
        
        {showChatButton && (
          <button
            className="user-search-modal__chat-btn"
            onClick={(e) => {
              e.stopPropagation();
              onStartChat(currentUser || user);
            }}
            title={`Nhắn tin với ${currentUser?.username || user.username}`}
          >
            💬
          </button>
        )}
      </div>
    </div>
  );
};

const UserSearchModal = ({ 
  isOpen, 
  onClose, 
  onFriendRequestSent = () => {},
  title = "Tìm kiếm bạn bè",
  showChatButton = false,
  onStartChat = () => {}
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const onStartChatRef = useRef(onStartChat);
  const onFriendRequestSentRef = useRef(onFriendRequestSent);

  // Keep refs updated
  useEffect(() => {
    onStartChatRef.current = onStartChat;
    onFriendRequestSentRef.current = onFriendRequestSent;
  }, [onStartChat, onFriendRequestSent]);

  // Search users with debouncing
  const performSearch = useCallback(async (query) => {
    if (!query || query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await searchUsers(query);
      const currentUserId = getCurrentUserId();
      
      // Filter out current user from results
      const filteredUsers = (response.users || []).filter(user => user._id !== currentUserId);
      setSearchResults(filteredUsers);

    } catch (error) {
      console.error('❌ Search error:', error);
      setError(error.error || 'Lỗi khi tìm kiếm người dùng');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle search input change
  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
    performSearch(query);
  }, [performSearch]);

  // Reset search when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setSearchResults([]);
      setError(null);
    }
  }, [isOpen]);

  // Handle friend request sent - stable function
  const handleFriendRequestSent = useCallback((userId, username) => {
    // Remove user from search results
    setSearchResults(prev => prev.filter(user => user._id !== userId));
    
    // Notify parent component
    onFriendRequestSentRef.current(userId, username);
  }, []); // Empty dependencies - stable function

  // Handle modal close
  const handleClose = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);
    setError(null);
    onClose();
  }, [onClose]);

  // Handle backdrop click
  const handleBackdropClick = useCallback((e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  }, [handleClose]); 

  if (!isOpen) return null;

  return (
    <div className="user-search-modal" onClick={handleBackdropClick}>
      <div className="user-search-modal__content">
        <div className="user-search-modal__header">
          <h3>{title}</h3>
          <button 
            className="user-search-modal__close"
            onClick={handleClose}
            aria-label="Đóng"
          >
            ✕
          </button>
        </div>

        <div className="user-search-modal__search">
          <SimpleSearchBar
            placeholder="Tìm kiếm theo tên hoặc username..."
            onSearch={handleSearch}
            value={searchQuery}
            debounceMs={500}
            autoFocus
          />
        </div>

        <div className="user-search-modal__body">
          {loading && (
            <div className="user-search-modal__loading">
              <div className="user-search-modal__spinner"></div>
              <p>Đang tìm kiếm...</p>
            </div>
          )}

          {error && (
            <div className="user-search-modal__error">
              <p>❌ {error}</p>
            </div>
          )}

          {!loading && !error && searchQuery.trim().length > 0 && searchResults.length === 0 && (
            <div className="user-search-modal__empty">
              <p>Không tìm thấy người dùng nào với từ khóa &quot;{searchQuery}&quot;</p>
              <p className="user-search-modal__hint">
                Hãy thử tìm kiếm bằng tên đầy đủ hoặc username
              </p>
            </div>
          )}

          {!loading && !error && searchQuery.trim().length === 0 && (
            <div className="user-search-modal__initial">
              <p>Nhập tên hoặc username để tìm kiếm người dùng</p>
              <p className="user-search-modal__hint">
                Ít nhất 2 ký tự để bắt đầu tìm kiếm
              </p>
            </div>
          )}

          {!loading && !error && searchResults.length > 0 && (
            <div className="user-search-modal__results">
              <p className="user-search-modal__results-count">
                Tìm thấy {searchResults.length} kết quả
              </p>
              
              <div className="user-search-modal__results-list">
                {searchResults.map(user => (
                  <UserSearchCard
                    key={user._id}
                    user={user}
                    onFriendRequestSent={handleFriendRequestSent}
                    showChatButton={showChatButton}
                    onStartChat={onStartChatRef.current}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

UserSearchModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onFriendRequestSent: PropTypes.func,
  title: PropTypes.string,
  showChatButton: PropTypes.bool,
  onStartChat: PropTypes.func
};

export default UserSearchModal;