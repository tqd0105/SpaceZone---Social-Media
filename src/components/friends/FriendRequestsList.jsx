import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import './FriendRequestsList.module.scss';
import { getFriendRequests, acceptFriendRequest, rejectFriendRequest, getFriends, removeFriend } from '../../services/friendService';
import { useRealTimeUser } from '../../hooks/useRealTimeUser';

const API_URL = import.meta.env.VITE_API_URL;
const defaultAvatar = `${API_URL}/uploads/avatar/default.png`;

// Component cho từng friend request
const FriendRequestCard = ({ request, onAccept, onReject }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const currentUser = useRealTimeUser(request.sender || request.user);

  const handleAccept = useCallback(async () => {
    if (isProcessing) return;

    try {
      setIsProcessing(true);
      await acceptFriendRequest(request._id || request.id);
      onAccept(request._id || request.id, currentUser?.username || request.sender?.username);
    } catch (error) {
      console.error('❌ Error accepting friend request:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [request, onAccept, currentUser, isProcessing]);

  const handleReject = useCallback(async () => {
    if (isProcessing) return;

    try {
      setIsProcessing(true);
      await rejectFriendRequest(request._id || request.id);
      onReject(request._id || request.id, currentUser?.username || request.sender?.username);
    } catch (error) {
      console.error('❌ Error rejecting friend request:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [request, onReject, currentUser, isProcessing]);

  const user = currentUser || request.sender || request.user;

  return (
    <div className="friend-request-card">
      <div className="friend-request-card__avatar">
        <img 
          src={user?.avatar ? `${API_URL}${user.avatar}` : defaultAvatar}
          alt={user?.username}
          onError={(e) => {
            e.target.src = defaultAvatar;
          }}
        />
      </div>
      
      <div className="friend-request-card__info">
        <h4 className="friend-request-card__username">
          {user?.username}
        </h4>
        {user?.fullName && (
          <p className="friend-request-card__fullname">
            {user?.fullName}
          </p>
        )}
        <p className="friend-request-card__time">
          {new Date(request.createdAt || request.requestedAt).toLocaleDateString('vi-VN')}
        </p>
      </div>

      <div className="friend-request-card__actions">
        <button
          className="friend-request-card__accept"
          onClick={handleAccept}
          disabled={isProcessing}
          title="Chấp nhận lời mời kết bạn"
        >
          {isProcessing ? '...' : '✓'}
          <span>Chấp nhận</span>
        </button>
        
        <button
          className="friend-request-card__reject"
          onClick={handleReject}
          disabled={isProcessing}
          title="Từ chối lời mời kết bạn"
        >
          {isProcessing ? '...' : '✕'}
          <span>Từ chối</span>
        </button>
      </div>
    </div>
  );
};

FriendRequestCard.propTypes = {
  request: PropTypes.object.isRequired,
  onAccept: PropTypes.func.isRequired,
  onReject: PropTypes.func.isRequired
};

// Component cho friend card trong danh sách bạn bè
const FriendCard = ({ friend, onRemove }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const currentUser = useRealTimeUser(friend);

  const handleRemoveFriend = useCallback(async () => {
    if (isProcessing) return;

    const confirm = window.confirm(`Bạn có chắc muốn xóa ${currentUser?.username || friend.username} khỏi danh sách bạn bè?`);
    if (!confirm) return;

    try {
      setIsProcessing(true);
      await removeFriend(friend._id || friend.id);
      onRemove(friend._id || friend.id, currentUser?.username || friend.username);
    } catch (error) {
      console.error('❌ Error removing friend:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [friend, onRemove, currentUser, isProcessing]);

  const user = currentUser || friend;

  return (
    <div className="friend-request-card">
      <div className="friend-request-card__avatar">
        <img 
          src={user?.avatar ? `${API_URL}${user.avatar}` : defaultAvatar}
          alt={user?.username}
          onError={(e) => {
            e.target.src = defaultAvatar;
          }}
        />
      </div>
      
      <div className="friend-request-card__info">
        <h4 className="friend-request-card__username">
          {user?.username}
        </h4>
        {user?.fullName && (
          <p className="friend-request-card__fullname">
            {user?.fullName}
          </p>
        )}
        <p className="friend-request-card__time">
          Bạn bè
        </p>
      </div>

      <div className="friend-request-card__actions">
        <button
          className="friend-request-card__reject"
          onClick={handleRemoveFriend}
          disabled={isProcessing}
          title="Xóa khỏi danh sách bạn bè"
        >
          {isProcessing ? '...' : '✕'}
          <span>Xóa bạn</span>
        </button>
      </div>
    </div>
  );
};

FriendCard.propTypes = {
  friend: PropTypes.object.isRequired,
  onRemove: PropTypes.func.isRequired
};

const FriendRequestsList = ({ isOpen, onClose, title = "Quản lý bạn bè" }) => {
  const [activeTab, setActiveTab] = useState('requests'); // 'requests' or 'friends'
  const [requests, setRequests] = useState([]);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load friends list
  const loadFriendsList = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getFriends({ limit: 50 });
      setFriends(response.data.friends || []);

      console.log(`👥 Loaded ${response.data.friends.length} friends`);

    } catch (error) {
      console.error('❌ Error loading friends list:', error);
      setError(error.error || 'Lỗi khi tải danh sách bạn bè');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load friend requests
  const loadFriendRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getFriendRequests({ type: 'received', limit: 50 });
      setRequests(response.data.requests || []);

      console.log(`📨 Loaded ${response.data.requests.length} friend requests`);

    } catch (error) {
      console.error('❌ Error loading friend requests:', error);
      setError(error.error || 'Lỗi khi tải danh sách lời mời kết bạn');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load data when modal opens or tab changes
  useEffect(() => {
    if (isOpen) {
      if (activeTab === 'requests') {
        loadFriendRequests();
      } else if (activeTab === 'friends') {
        loadFriendsList();
      }
    } else {
      setRequests([]);
      setFriends([]);
      setError(null);
    }
  }, [isOpen, activeTab, loadFriendRequests, loadFriendsList]);

  // Handle remove friend
  const handleRemoveFriend = useCallback((friendId, username) => {
    // Remove friend from list
    setFriends(prev => prev.filter(friend => (friend._id || friend.id) !== friendId));
    console.log(`💔 Removed friend ${username}`);
  }, []);

  // Handle accept friend request
  const handleAcceptRequest = useCallback((requestId, username) => {
    // Remove request from list
    setRequests(prev => prev.filter(req => (req._id || req.id) !== requestId));
    console.log(`✅ Accepted friend request from ${username}`);
  }, []);

  // Handle reject friend request  
  const handleRejectRequest = useCallback((requestId, username) => {
    // Remove request from list
    setRequests(prev => prev.filter(req => (req._id || req.id) !== requestId));
    console.log(`❌ Rejected friend request from ${username}`);
  }, []);

  // Handle modal close
  const handleClose = useCallback(() => {
    setRequests([]);
    setFriends([]);
    setError(null);
    setActiveTab('requests'); // Reset to default tab
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
    <div className="friend-requests-modal" onClick={handleBackdropClick}>
      <div className="friend-requests-modal__content">
        <div className="friend-requests-modal__header">
          <h3>{title}</h3>
          <button 
            className="friend-requests-modal__close"
            onClick={handleClose}
            aria-label="Đóng"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="friend-requests-modal__tabs">
          <button
            className={`friend-requests-modal__tab ${activeTab === 'requests' ? 'active' : ''}`}
            onClick={() => setActiveTab('requests')}
          >
            Lời mời kết bạn
          </button>
          <button
            className={`friend-requests-modal__tab ${activeTab === 'friends' ? 'active' : ''}`}
            onClick={() => setActiveTab('friends')}
          >
            Danh sách bạn bè
          </button>
        </div>

        <div className="friend-requests-modal__body">
          {loading && (
            <div className="friend-requests-modal__loading">
              <div className="friend-requests-modal__spinner"></div>
              <p>Đang tải lời mời kết bạn...</p>
            </div>
          )}

          {error && (
            <div className="friend-requests-modal__error">
              <p>❌ {error}</p>
              <button 
                className="friend-requests-modal__retry"
                onClick={loadFriendRequests}
              >
                Thử lại
              </button>
            </div>
          )}

          {!loading && !error && activeTab === 'requests' && requests.length === 0 && (
            <div className="friend-requests-modal__empty">
              <p>Bạn chưa có lời mời kết bạn nào</p>
              <p className="friend-requests-modal__hint">
                Các lời mời kết bạn sẽ hiển thị tại đây
              </p>
            </div>
          )}

          {!loading && !error && activeTab === 'friends' && friends.length === 0 && (
            <div className="friend-requests-modal__empty">
              <p>Bạn chưa có bạn bè nào</p>
              <p className="friend-requests-modal__hint">
                Danh sách bạn bè sẽ hiển thị tại đây
              </p>
            </div>
          )}

          {!loading && !error && activeTab === 'requests' && requests.length > 0 && (
            <div className="friend-requests-modal__list">
              <p className="friend-requests-modal__count">
                {requests.length} lời mời kết bạn
              </p>
              
              {requests.map(request => (
                <FriendRequestCard
                  key={request._id || request.id}
                  request={request}
                  onAccept={handleAcceptRequest}
                  onReject={handleRejectRequest}
                />
              ))}
            </div>
          )}

          {!loading && !error && activeTab === 'friends' && friends.length > 0 && (
            <div className="friend-requests-modal__list">
              <p className="friend-requests-modal__count">
                {friends.length} bạn bè
              </p>
              
              {friends.map(friend => (
                <FriendCard
                  key={friend._id || friend.id}
                  friend={friend}
                  onRemove={handleRemoveFriend}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

FriendRequestsList.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string
};

export default FriendRequestsList;