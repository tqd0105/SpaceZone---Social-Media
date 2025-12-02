import { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import "./FriendRequestsList.module.scss";
import friendRequest from "../../assets/icons/main/friend-request.png";
import {
  getFriendRequests,
  acceptFriendRequest,
  rejectFriendRequest,
  getFriends,
  removeFriend,
} from "../../services/friendService";
import { useRealTimeUser } from "../../hooks/useRealTimeUser";
import { useChat } from "../../hooks/useChat";
import { startChatWithFriend } from "../../utils/friendChatIntegration";
import twoPeople from "../../assets/icons/main/two-people.png";
import UserSearchModal from "./UserSearchModal";
import Chat from "../../assets/icons/main/chat.png";

const API_URL = import.meta.env.VITE_API_URL;
const defaultAvatar = `${API_URL}/uploads/avatar/default.png`;

// Component cho từng friend request
const FriendRequestCard = ({ request, onAccept, onReject }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Debug log để kiểm tra dữ liệu
  console.log("🔍 FriendRequestCard - Request data:", request);

  const handleAccept = useCallback(async () => {
    if (isProcessing) return;

    try {
      setIsProcessing(true);
      await acceptFriendRequest(request._id || request.id);
      onAccept(
        request._id || request.id,
        request.sender?.username || request.sender?.name
      );
    } catch (error) {
      console.error("❌ Error accepting friend request:", error);
    } finally {
      setIsProcessing(false);
    }
  }, [request, onAccept, isProcessing]);

  const handleReject = useCallback(async () => {
    if (isProcessing) return;

    try {
      setIsProcessing(true);
      await rejectFriendRequest(request._id || request.id);
      onReject(
        request._id || request.id,
        request.sender?.username || request.sender?.name
      );
    } catch (error) {
      console.error("❌ Error rejecting friend request:", error);
    } finally {
      setIsProcessing(false);
    }
  }, [request, onReject, isProcessing]);

  // Lấy thông tin người gửi trực tiếp từ request.sender
  const sender = request.sender || request.user;
  
  // Tạo tên hiển thị với fallback logic
  const displayName = sender?.name || sender?.username || "Unknown User";
  const displayUsername = sender?.username;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex flex-col items-center gap-3">
        <div className="flex justify-center items-center gap-4">
          <div className="relative">
            <img
              src={sender?.avatar ? `${API_URL}${sender.avatar}` : defaultAvatar}
              alt={displayName}
              className="w-12 h-12 rounded-full object-cover border-2 border-gray-100"
              onError={(e) => {
                e.target.src = defaultAvatar;
              }}
            />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-base text-gray-900 truncate">
              {displayName}
            </h4>
            {displayUsername && (
              <p className="text-sm font-bold text-gray-400 truncate">
                @{displayUsername}
              </p>
            )}
            <p className="text-xs text-gray-400">
              🕛{new Date(
                request.createdAt || request.requestedAt
              ).toLocaleDateString("vi-VN")}
            </p>
          </div>
        </div>
        <div className="flex justify-center items-center w-full gap-2 mt-2">
          <button
            className="bg-blue-500 w-full hover:bg-blue-600 text-white px-3 py-3 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-1"
            onClick={handleAccept}
            disabled={isProcessing}
            title="Chấp nhận lời mời kết bạn"
          >
            {isProcessing ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
            <span className="hidden sm:inline">Chấp nhận</span>
          </button>

          <button
            className="bg-gray-500 w-full hover:bg-gray-600 text-white px-3 py-3 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-1"
            onClick={handleReject}
            disabled={isProcessing}
            title="Từ chối lời mời kết bạn"
          >
            {isProcessing ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg
                className="w-4 h-4"
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
            )}
            <span className="hidden sm:inline">Từ chối</span>
          </button>
        </div>
      </div>
    </div>
  );
};

FriendRequestCard.propTypes = {
  request: PropTypes.object.isRequired,
  onAccept: PropTypes.func.isRequired,
  onReject: PropTypes.func.isRequired,
};

// Component cho friend card trong danh sách bạn bè
const FriendCard = ({ friend, onRemove, onRefreshList, onClose }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isChatting, setIsChatting] = useState(false);
  const { toggleChat, setActiveConversation, loadMessages } = useChat();

  const handleRemoveFriend = useCallback(async () => {
    if (isProcessing) return;

    const confirm = window.confirm(
      `Bạn có chắc muốn xóa ${
        friend?.username || friend?.name
      } khỏi danh sách bạn bè?`
    );
    if (!confirm) return;

    try {
      setIsProcessing(true);

      await removeFriend(friend._id || friend.id);
      onRemove(
        friend._id || friend.id,
        friend?.username || friend?.name
      );
    } catch (error) {
      console.error("❌ Error removing friend:", error);

      // Show error and ask if user wants to refresh the list
      const errorMessage =
        error.error || error.message || "Lỗi không xác định khi xóa bạn bè";
      const shouldRefresh = window.confirm(
        `Lỗi: ${errorMessage}\n\nCó thể danh sách bạn bè đã bị thay đổi. Bạn có muốn tải lại danh sách không?`
      );

      if (shouldRefresh && onRefreshList) {
        onRefreshList();
      }
    } finally {
      setIsProcessing(false);
    }
  }, [friend, onRemove, isProcessing, onRefreshList]);

  // Handle start chat
  const handleStartChat = useCallback(async () => {
    if (isChatting) return;

    try {
      setIsChatting(true);
      console.log('🚀 [FriendCard] Starting chat with friend:', friend);
      
      // Prepare chat context with actual functions
      const chatContext = { 
        setActiveConversation, 
        loadMessages 
      };
      
      await startChatWithFriend(
        friend,
        (conversation) => {
          console.log('\u2705 [FriendCard] Chat started successfully:', conversation);
          // Set active conversation immediately to show the specific conversation
          setActiveConversation(conversation._id);
          // Load messages for this conversation
          loadMessages(conversation._id);
          // Open chat window
          toggleChat();
          // Close the FriendRequestsList modal
          if (onClose) {
            console.log('\ud83d\udd12 [FriendCard] Closing FriendRequestsList modal');
            onClose();
          }
        },
        (error) => {
          console.error('❌ [FriendCard] Failed to start chat:', error);
          alert(error.message || 'Không thể tạo cuộc trò chuyện');
        },
        chatContext
      );
    } catch (error) {
      console.error('❌ [FriendCard] Error in chat creation:', error);
      alert('Có lỗi xảy ra khi tạo cuộc trò chuyện');
    } finally {
      setIsChatting(false);
    }
  }, [friend, isChatting, toggleChat, setActiveConversation, loadMessages, onClose]);

  const user = friend;

  // Sử dụng name nếu có, fallback về username
  const displayName = user?.name || user?.username || "Unknown User";
  const displayEmail = user?.email;
  const displayUsername = user?.username;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between gap-3">
        <div className="flex justify-center items-center gap-4">
          <div className="relative">
            <img
              src={user?.avatar ? `${API_URL}${user.avatar}` : defaultAvatar}
              alt={displayName}
              className="w-12 h-12 rounded-full object-cover border-2 border-gray-300"
              onError={(e) => {
                e.target.src = defaultAvatar;
              }}
            />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
          </div>

          <div className="flex-1 min-w-0 text-left">
            <div className="flex justify-start items-center gap-2">
              <h4 className="font-bold text-gray-900 truncate">{displayName}</h4>
            </div>
            {displayUsername && (
              <p className="text-sm text-gray-500 truncate">
                @{displayUsername}
              </p>
            )}
            {/* {displayEmail && (
              <p className="text-xs text-gray-400 truncate">
                {displayEmail}
              </p>
            )} */}
            <p className="text-xs text-green-600 font-medium">Bạn bè</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            className="bg-gray-200 hover:bg-gray-300 rounded-full text-white p-3 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            onClick={handleStartChat}
            disabled={isChatting || isProcessing}
            title="Nhắn tin với bạn bè"
          >
            {isChatting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <img src={Chat} width={16} alt="Chat" />
            )}
            {/* <span className="hidden sm:inline">Nhắn tin</span> */}
          </button>
          <button
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            onClick={handleRemoveFriend}
            disabled={isProcessing}
            title="Xóa khỏi danh sách bạn bè"
          >
            {isProcessing ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            )}
            <span className="hidden sm:inline">Xóa bạn</span>
          </button>
        </div>
      </div>
    </div>
  );
};

FriendCard.propTypes = {
  friend: PropTypes.object.isRequired,
  onRemove: PropTypes.func.isRequired,
  onRefreshList: PropTypes.func,
  onClose: PropTypes.func, // Add onClose prop
};

const FriendRequestsList = ({ isOpen, onClose, title = "Quản lý bạn bè" }) => {
  const [activeTab, setActiveTab] = useState("requests"); // 'requests' or 'friends'
  const [requests, setRequests] = useState([]);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [showUserSearch, setShowUserSearch] = useState(false);

  // Load friends list with search support
  const loadFriendsList = useCallback(async (searchQuery = "") => {
    try {
      setLoading(true);
      setError(null);

      const params = { limit: 50 };
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      const response = await getFriends(params);
      setFriends(response.data.friends || []);
      
      console.log(`👥 Loaded ${response.data.friends?.length || 0} friends with search: "${searchQuery}"`);
    } catch (error) {
      console.error("❌ Error loading friends list:", error);
      setError(error.error || "Lỗi khi tải danh sách bạn bè");
    } finally {
      setLoading(false);
    }
  }, []);

  // Load friend requests  
  const loadFriendRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getFriendRequests({ type: "received", limit: 50 });
      console.log("🔍 Friend requests response:", response);
      console.log("📨 Raw requests data:", response.data.requests);
      
      // Debug: Check each request
      response.data.requests?.forEach((request, index) => {
        console.log(`📝 Request ${index}:`, {
          id: request._id,
          sender: request.sender,
          receiver: request.receiver,
          status: request.status,
          type: request.type
        });
      });
      
      setRequests(response.data.requests || []);
    } catch (error) {
      console.error("❌ Error loading friend requests:", error);
      setError(error.error || "Lỗi khi tải danh sách lời mời kết bạn");
    } finally {
      setLoading(false);
    }
  }, []);

  // Client-side filtering for friend requests (since API doesn't support search for requests)
  const filteredRequests = requests.filter((request) => {
    if (!searchTerm.trim()) return true;
    
    const user = request.sender || request.user;
    const name = (user?.name || "").toLowerCase();
    const username = (user?.username || "").toLowerCase();
    const searchLower = searchTerm.toLowerCase().trim();
    
    return name.includes(searchLower) || username.includes(searchLower);
  });

  // For friends, we use server-side search, so no client-side filtering needed
  const filteredFriends = friends;

  // Handle search with debouncing for friends
  const handleSearch = useCallback((searchQuery) => {
    setSearchTerm(searchQuery);

    // Clear existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // For friend requests, we do client-side filtering (immediate)
    // For friends, we do server-side search with debounce
    if (activeTab === "friends") {
      const timeout = setTimeout(() => {
        loadFriendsList(searchQuery);
      }, 500); // 500ms debounce
      
      setSearchTimeout(timeout);
    }
  }, [activeTab, loadFriendsList, searchTimeout]);

  // Load data when modal opens or tab changes
  useEffect(() => {
    if (isOpen) {
      if (activeTab === "requests") {
        loadFriendRequests();
      } else if (activeTab === "friends") {
        loadFriendsList(searchTerm); // Load with current search term
      }
    } else {
      setRequests([]);
      setFriends([]);
      setError(null);
      setSearchTerm("");
      if (searchTimeout) {
        clearTimeout(searchTimeout);
        setSearchTimeout(null);
      }
    }
  }, [isOpen, activeTab, loadFriendRequests, loadFriendsList]);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  // Handle remove friend
  const handleRemoveFriend = useCallback((friendId, username) => {
    // Remove friend from list
    setFriends((prev) =>
      prev.filter((friend) => (friend._id || friend.id) !== friendId)
    );
  }, []);

  // Handle refresh friends list
  const handleRefreshFriendsList = useCallback(async () => {
    await loadFriendsList(searchTerm); // Reload with current search term
  }, [loadFriendsList, searchTerm]);

  // Handle accept friend request
  const handleAcceptRequest = useCallback((requestId, username) => {
    // Remove request from list
    setRequests((prev) =>
      prev.filter((req) => (req._id || req.id) !== requestId)
    );
  }, []);

  // Handle reject friend request
  const handleRejectRequest = useCallback((requestId, username) => {
    // Remove request from list
    setRequests((prev) =>
      prev.filter((req) => (req._id || req.id) !== requestId)
    );
  }, []);

  // Handle modal close
  const handleClose = useCallback(() => {
    setRequests([]);
    setFriends([]);
    setError(null);
    setSearchTerm(""); // Reset search term
    setActiveTab("requests"); // Reset to default tab
    if (searchTimeout) {
      clearTimeout(searchTimeout);
      setSearchTimeout(null);
    }
    onClose();
  }, [onClose, searchTimeout]);

  // Handle tab change - reset search when switching tabs
  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
    setSearchTerm(""); // Reset search when changing tabs
    if (searchTimeout) {
      clearTimeout(searchTimeout);
      setSearchTimeout(null);
    }
  }, [searchTimeout]);

  // Handle friend request sent from UserSearchModal
  const handleFriendRequestSent = useCallback((userId, username) => {
    console.log(`📤 Friend request sent to ${username}`);
    // Optionally reload friend requests if on that tab
    if (activeTab === "requests") {
      loadFriendRequests();
    }
  }, [activeTab, loadFriendRequests]);

  // Handle backdrop click
  const handleBackdropClick = useCallback(
    (e) => {
      if (e.target === e.currentTarget) {
        handleClose();
      }
    },
    [handleClose]
  );

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden transform transition-all duration-300 scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-white text-black p-4 ">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold uppercase text-center">{title}</h3>
            <div className="flex items-center gap-2">
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                onClick={() => setShowUserSearch(true)}
                title="Tìm kiếm người dùng để kết bạn"
              >
                <svg
                  className="w-4 h-4"
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
                <span className="hidden sm:inline">Tìm bạn</span>
              </button>
              <button
                className="text-black hover:text-gray-200 transition-colors p-1 rounded-full hover:bg-white hover:bg-opacity-20"
                onClick={handleClose}
                aria-label="Đóng"
              >
                <svg
                  className="w-6 h-6"
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
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors rounded-none  ${
              activeTab === "requests"
                ? "text-blue-600 border-b-4 border-blue-600 bg-blue-50"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
            onClick={() => handleTabChange("requests")}
          >
            <span className="flex items-center justify-center font-bold gap-2">
              <img src={friendRequest} width={25} alt="Friend Requests" />
              Lời mời ({requests.length})
            </span>
          </button>
          <button
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors rounded-none  ${
              activeTab === "friends"
                ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
            onClick={() => handleTabChange("friends")}
          >
            <span className="flex items-center justify-center font-bold gap-2">
              <img src={twoPeople} width={25} alt="Friends" />
              Bạn bè ({friends.length})
            </span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 bg-gray-50 border-b border-gray-200">
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
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
              placeholder={activeTab === "requests" ? "Tìm kiếm lời mời kết bạn..." : "Tìm kiếm bạn bè..."}
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
            />
            {searchTerm && (
              <button
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => handleSearch("")}
              >
                <svg
                  className="h-5 w-5 text-gray-400 hover:text-gray-600"
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

        <div className="p-4 max-h-[60vh] overflow-y-auto">
          {loading && (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-gray-600">Đang tải...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <div className="text-red-600 mb-2">❌ {error}</div>
              <button
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                onClick={loadFriendRequests}
              >
                Thử lại
              </button>
            </div>
          )}

          {!loading &&
            !error &&
            activeTab === "requests" &&
            filteredRequests.length === 0 && (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">
                  {searchTerm ? "🔍" : "👥"}
                </div>
                <p className="text-gray-600 font-medium">
                  {searchTerm ? "Không tìm thấy kết quả" : "Chưa có lời mời kết bạn"}
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  {searchTerm 
                    ? `Không có lời mời nào khớp với "${searchTerm}"`
                    : "Các lời mời kết bạn sẽ hiển thị tại đây"
                  }
                </p>
              </div>
            )}

          {!loading &&
            !error &&
            activeTab === "friends" &&
            filteredFriends.length === 0 && (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">
                  {searchTerm ? "🔍" : "👤"}
                </div>
                <p className="text-gray-600 font-medium">
                  {searchTerm ? "Không tìm thấy kết quả" : "Chưa có bạn bè"}
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  {searchTerm 
                    ? `Không có bạn bè nào khớp với "${searchTerm}"`
                    : "Danh sách bạn bè sẽ hiển thị tại đây"
                  }
                </p>
              </div>
            )}

          {!loading &&
            !error &&
            activeTab === "requests" &&
            filteredRequests.length > 0 && (
              <div className="space-y-3">
                <div className="text-sm text-gray-500 font-medium px-1 flex justify-between items-center">
                  <span>
                    {searchTerm 
                      ? `${filteredRequests.length}/${requests.length} lời mời kết bạn`
                      : `${requests.length} lời mời kết bạn`
                    }
                  </span>
                  {searchTerm && (
                    <span className="text-blue-600 text-xs">
                      Kết quả cho "{searchTerm}"
                    </span>
                  )}
                </div>

                {filteredRequests.map((request) => (
                  <FriendRequestCard
                    key={request._id || request.id}
                    request={request}
                    onAccept={handleAcceptRequest}
                    onReject={handleRejectRequest}
                  />
                ))}
              </div>
            )}

          {!loading &&
            !error &&
            activeTab === "friends" &&
            filteredFriends.length > 0 && (
              <div className="space-y-3">
                <div className="text-sm text-gray-500 font-medium px-1 flex justify-between items-center">
                  <span>
                    {searchTerm 
                      ? `Tìm thấy ${filteredFriends.length} bạn bè`
                      : `${friends.length} bạn bè`
                    }
                  </span>
                  {searchTerm && (
                    <span className="text-blue-600 text-xs">
                      Kết quả cho "{searchTerm}"
                    </span>
                  )}
                </div>

                {filteredFriends.map((friend) => (
                  <FriendCard
                    key={friend._id || friend.id}
                    friend={friend}
                    onRemove={handleRemoveFriend}
                    onRefreshList={handleRefreshFriendsList}
                    onClose={handleClose}
                  />
                ))}
              </div>
            )}
        </div>
      </div>

      {/* User Search Modal */}
      <UserSearchModal
        isOpen={showUserSearch}
        onClose={() => setShowUserSearch(false)}
        onFriendRequestSent={handleFriendRequestSent}
        title="Tìm kiếm bạn bè"
      />
    </div>
  );
};

FriendRequestsList.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
};

export default FriendRequestsList;
