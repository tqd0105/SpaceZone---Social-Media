import { useState, useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import './UserSearchModal.module.scss';
import twoPeople from '../../assets/icons/main/two-people.png';
import Chat from '../../assets/icons/main/chat.png';
import { searchUsers } from '../../services/userService';
import { getFriends } from '../../services/friendService';
import { AddFriendButton } from './index';

const API_URL = import.meta.env.VITE_API_URL;
const defaultAvatar = `${API_URL}/uploads/avatar/default.png`;

// Get current user ID from localStorage
const getCurrentUserId = () => {
  try {
    // Try to get from token first
    const token = localStorage.getItem('token');
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('🔑 Token payload:', payload);
      if (payload.id) return payload.id;
    }
    
    // Fallback to user data in localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      console.log('👤 User from localStorage:', user);
      return user.id || user._id;
    }
    
    console.warn('⚠️ No user ID found');
    return null;
  } catch (error) {
    console.error('❌ Error getting current user ID:', error);
    return null;
  }
};

// Component con để handle real-time avatar
const UserSearchCard = ({ user, onFriendRequestSent, showChatButton, onStartChat }) => {
  const [showWarningModal, setShowWarningModal] = useState(false);
  
  // Kiểm tra có phải bạn bè không
  const checkFriendship = async () => {
    try {
      const response = await getFriends();
      const isFriend = response.data?.friends?.some(friend => 
        friend._id === user._id || 
        friend.sender?._id === user._id || 
        friend.receiver?._id === user._id
      );
      return isFriend;
    } catch (error) {
      console.error('Error checking friendship:', error);
      return false;
    }
  };
  
  const handleStartChat = async (e) => {
    e.stopPropagation();
    
    const isFriend = await checkFriendship();
    if (!isFriend) {
      setShowWarningModal(true);
      return;
    }
    
    onStartChat(user);
  };
  
  return (
    <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:shadow-md hover:bg-gray-50 transition-all duration-200 mb-2">
      {/* Avatar và thông tin user */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="relative flex-shrink-0">
          <img 
            src={user?.avatar ? `${API_URL}${user.avatar}` : defaultAvatar}
            alt={user.username}
            onError={(e) => {
              e.target.src = defaultAvatar;
            }}
            className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
          />
          <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
        </div>
        
        <div className="flex flex-col items-start min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-gray-900 truncate text-sm">
              {user.name || user.username}
            </h4>
            {/* {user.name && (
              <span className="text-base px-3 py-2 bg-blue-100 text-blue-700 rounded-full font-bold">
                @{user.username}
              </span>
            )} */}
          </div>
          {user.name && (
            <p className="text-sm font-extrabold text-gray-400 truncate mt-0.5">
              @{user.username}
            </p>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 ml-3">
        <AddFriendButton
          userId={user._id}
          username={user.username}
          onRequestSent={onFriendRequestSent}
          size="small"
        />
        
        {showChatButton && (
          <button
            className="py-2 px-2 flex items-center justify-center bg-gray-200 hover:bg-blue-100 rounded-full transition-colors duration-200"
            onClick={handleStartChat}
            title={`Nhắn tin với ${user.username}`}
          >
            <img src={Chat} width={25} alt="" />
          </button>
        )}
      </div>
      
      {/* Modal cảnh báo */}
      {showWarningModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]" onClick={(e) => {
          if (e.target === e.currentTarget) setShowWarningModal(false);
        }}>
          <div className="bg-white rounded-lg shadow-2xl max-w-sm w-full mx-4">
            <div className="flex items-center justify-between p-4 border-b">
              <h4 className="text-lg font-semibold text-amber-600">⚠️ Không thể nhắn tin</h4>
              <button 
                className="text-gray-400 hover:text-gray-600 transition-colors"
                onClick={() => setShowWarningModal(false)}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <p className="text-gray-700 mb-2">Bạn cần kết bạn với <strong>{user.username}</strong> trước khi có thể nhắn tin.</p>
              <p className="text-gray-600 text-sm">Hãy gửi lời mời kết bạn và chờ họ chấp nhận.</p>
            </div>
            <div className="flex justify-end p-4 border-t bg-gray-50">
              <button 
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors"
                onClick={() => setShowWarningModal(false)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

UserSearchCard.propTypes = {
  user: PropTypes.object.isRequired,
  onFriendRequestSent: PropTypes.func.isRequired,
  showChatButton: PropTypes.bool,
  onStartChat: PropTypes.func
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
  const [allUsers, setAllUsers] = useState([]); // Lưu tất cả kết quả từ API
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false); // Track if user has searched
  const onStartChatRef = useRef(onStartChat);
  const onFriendRequestSentRef = useRef(onFriendRequestSent);
  const searchTimeoutRef = useRef(null);

  // Keep refs updated
  useEffect(() => {
    onStartChatRef.current = onStartChat;
    onFriendRequestSentRef.current = onFriendRequestSent;
  }, [onStartChat, onFriendRequestSent]);

  // Search users from API
  const performSearch = useCallback(async (query) => {
    if (!query || query.trim().length < 2) {
      setAllUsers([]);
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setHasSearched(true);

      const response = await searchUsers(query);
      const currentUserId = getCurrentUserId();
      
      console.log('🔍 Search Debug Info:');
      console.log('- Current User ID:', currentUserId);
      console.log('- Search Response:', response);
      console.log('- Users found:', response.users?.length || 0);
      
      // Filter out current user from results
      const filteredUsers = (response.users || []).filter(user => user._id !== currentUserId);
      
      console.log('- Filtered Users Count:', filteredUsers.length);
      setAllUsers(filteredUsers);
      setSearchResults(filteredUsers);

    } catch (error) {
      console.error('❌ Search error:', error);
      setError(error.error || 'Lỗi khi tìm kiếm người dùng');
      setAllUsers([]);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Client-side filtering for real-time search
  const filterUsers = useCallback((query) => {
    if (!query || query.trim().length === 0) {
      setSearchResults(allUsers);
      return;
    }
    
    const searchLower = query.toLowerCase().trim();
    const filtered = allUsers.filter((user) => {
      const name = (user?.name || '').toLowerCase();
      const username = (user?.username || '').toLowerCase();
      return name.includes(searchLower) || username.includes(searchLower);
    });
    
    setSearchResults(filtered);
  }, [allUsers]);

  // Handle search input change with debouncing
  const handleSearchInputChange = useCallback((e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // If we have existing users, do immediate client-side filtering
    if (allUsers.length > 0) {
      filterUsers(query);
    }
    
    // Debounce API call
    searchTimeoutRef.current = setTimeout(() => {
      performSearch(query);
    }, 500);
  }, [performSearch, filterUsers, allUsers]);

  // Reset search when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setSearchResults([]);
      setAllUsers([]);
      setError(null);
      setHasSearched(false);
    } else {
      // Clear timeout when modal closes
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    }
  }, [isOpen]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

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
    setAllUsers([]);
    setError(null);
    setHasSearched(false);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={handleBackdropClick}>
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="bg-white text-black p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">{title}</h3>
            <button 
              className="text-black hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-200 hover:bg-opacity-20"
              onClick={handleClose}
              aria-label="Đóng"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-4 bg-gray-50 border-b">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              placeholder="Tìm kiếm theo tên hoặc username..."
              value={searchQuery}
              onChange={handleSearchInputChange}
              autoFocus
            />
            {searchQuery && (
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => {
                  setSearchQuery('');
                  setSearchResults(allUsers);
                  if (searchTimeoutRef.current) {
                    clearTimeout(searchTimeoutRef.current);
                  }
                }}
              >
                <svg
                  className="h-5 w-5 text-gray-400 hover:text-gray-600 cursor-pointer"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 max-h-[50vh] overflow-y-auto">
          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600 font-medium">Đang tìm kiếm...</p>
              <p className="text-gray-400 text-sm mt-1">Vui lòng chờ trong giây lát</p>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-red-600 font-medium mb-2">❌ {error}</p>
              <button
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
                onClick={() => performSearch(searchQuery)}
              >
                Thử lại
              </button>
            </div>
          )}

          {!loading && !error && searchQuery.trim().length > 0 && searchResults.length === 0 && hasSearched && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <p className="text-gray-700 font-medium mb-2">Không tìm thấy kết quả</p>
              <p className="text-gray-500 text-sm text-center max-w-xs">
                Không có người dùng nào khớp với "{searchQuery}". Hãy thử tìm kiếm bằng tên đầy đủ hoặc username khác.
              </p>
            </div>
          )}

          {!loading && !error && searchQuery.trim().length === 0 && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <img src={twoPeople} alt="" />
              </div>
              <p className="text-gray-700 font-medium mb-2">Tìm kiếm bạn bè</p>
              <p className="text-gray-500 text-sm text-center max-w-xs">
                Nhập tên hoặc username để tìm kiếm người dùng. Cần ít nhất 2 ký tự để bắt đầu tìm kiếm.
              </p>
            </div>
          )}

          {!loading && !error && searchResults.length > 0 && (
            <div>
              {/* Results header */}
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700">
                    {searchQuery.trim() 
                      ? `${searchResults.length}/${allUsers.length} kết quả`
                      : `${searchResults.length} kết quả`
                    }
                  </span>
                </div>
                {searchQuery.trim() && (
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                    "{searchQuery}"
                  </span>
                )}
              </div>
              
              {/* Results list */}
              <div className="space-y-2">
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

// Inline CSS cho modal cảnh báo
const warningModalStyles = `
.warning-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
}

.warning-modal {
  background: white;
  border-radius: 12px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  animation: modalSlideIn 0.3s ease;
}

@keyframes modalSlideIn {
  from {
    transform: translateY(-30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.warning-modal__header {
  padding: 20px 20px 10px 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.warning-modal__header h4 {
  margin: 0;
  color: #e74c3c;
  font-size: 18px;
}

.warning-modal__close {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  padding: 5px;
  color: #666;
}

.warning-modal__close:hover {
  color: #000;
}

.warning-modal__body {
  padding: 20px;
}

.warning-modal__body p {
  margin: 0 0 10px 0;
  line-height: 1.5;
  color: #333;
}

.warning-modal__actions {
  padding: 10px 20px 20px 20px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.warning-modal__btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.warning-modal__btn--secondary {
  background: #6c757d;
  color: white;
}

.warning-modal__btn--secondary:hover {
  background: #5a6268;
}
`;

// Thêm styles vào document
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = warningModalStyles;
  document.head.appendChild(styleSheet);
}