import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthProvider';

const Friends = () => {
  const { user } = useAuth();
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    loadFriends();
    loadFriendRequests();
  }, []);

  const loadFriends = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_URL}/api/friends/list`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setFriends(data.data.friends || []);
      }
    } catch (error) {
      console.error('Error loading friends:', error);
    }
  };

  const loadFriendRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_URL}/api/friends/requests?type=received`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setFriendRequests(data.data.requests || []);
      }
    } catch (error) {
      console.error('Error loading friend requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const acceptFriendRequest = async (requestId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/friends/accept/${requestId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Reload both friends and requests
        loadFriends();
        loadFriendRequests();
      }
    } catch (error) {
      console.error('Error accepting friend request:', error);
    }
  };

  const rejectFriendRequest = async (requestId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/friends/reject/${requestId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        loadFriendRequests();
      }
    } catch (error) {
      console.error('Error rejecting friend request:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Bạn bè</h1>
      
      {/* Friend Requests */}
      {friendRequests.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Lời mời kết bạn ({friendRequests.length})</h2>
          <div className="space-y-4">
            {friendRequests.map((request) => (
              <div key={request._id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <img 
                    src={request.sender?.avatar ? `${API_URL}${request.sender.avatar}` : '/default-avatar.png'}
                    alt={request.sender?.name}
                    className="w-12 h-12 rounded-full object-cover"
                    onError={(e) => { e.target.src = '/default-avatar.png'; }}
                  />
                  <div>
                    <h3 className="font-medium">{request.sender?.name || request.sender?.username}</h3>
                    <p className="text-sm text-gray-500">@{request.sender?.username}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => acceptFriendRequest(request._id)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    Chấp nhận
                  </button>
                  <button
                    onClick={() => rejectFriendRequest(request._id)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                  >
                    Từ chối
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Friends List */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">
          Danh sách bạn bè ({friends.length})
        </h2>
        
        {friends.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">Chưa có bạn bè</h3>
            <p className="text-gray-500 mb-4">
              Hãy bắt đầu kết bạn để xem bài viết của họ!
            </p>
            <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
              Tìm bạn bè
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {friends.map((friend) => (
              <div key={friend._id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                <div className="text-center">
                  <img 
                    src={friend.avatar ? `${API_URL}${friend.avatar}` : '/default-avatar.png'}
                    alt={friend.name}
                    className="w-16 h-16 rounded-full object-cover mx-auto mb-3"
                    onError={(e) => { e.target.src = '/default-avatar.png'; }}
                  />
                  <h3 className="font-medium">{friend.name || friend.username}</h3>
                  <p className="text-sm text-gray-500">@{friend.username}</p>
                  <button className="mt-2 px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                    Xem trang cá nhân
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Friends;