import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../context/AuthProvider";
import shareWithFriends, {
  CloseBlack,
  ShareLink,
  shareThrough,
  NextDouble,
} from "../../assets/icons/main/main";
import styles from "./Main.module.scss";

function Share({ onClose, postId, postData }) {
  const { user } = useAuth();
  const [isCopied, setIsCopied] = useState(false);
  const [translateX, setTranslateX] = useState(0);
  const [maxTranslate, setMaxTranslate] = useState(0);
  const [friends, setFriends] = useState([]);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [isSharing, setIsSharing] = useState(false);
  const [shareMessage, setShareMessage] = useState('');
  const listRef = useRef(null);
  
  // Tạo link chia sẻ thực
  const shareUrl = `${window.location.origin}/post/${postId}`;
  const maxLength = 30;
  const displayUrl = shareUrl.length > maxLength 
    ? `${shareUrl.substring(0, maxLength)}...` 
    : shareUrl;

  useEffect(() => {
    if (listRef.current) {
      const listWidth = listRef.current.scrollWidth;
      const containerWidth = listRef.current.parentElement.offsetWidth;
      setMaxTranslate(listWidth - containerWidth);
    }
    
    // Load danh sách bạn bè
    loadFriends();
  }, []);

  // Load danh sách bạn bè từ API
  const loadFriends = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/friends/list`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // API trả về: { success: true, data: { friends: [...] } }
        if (data.success && data.data && data.data.friends) {
          setFriends(data.data.friends);
        } else {
          setFriends([]);
        }
      } else {
        console.error('Failed to load friends:', response.status);
        const errorText = await response.text();
        console.error('Error details:', errorText);
      }
    } catch (error) {
      console.error('Error loading friends:', error);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 3000);
  };

  const handleTranslate = (direction) => {
    if (listRef.current) {
      if (direction === "next" && translateX < maxTranslate) {
        setTranslateX((prev) => Math.min(prev + 100, maxTranslate));
      } else if (direction === "prev" && translateX > 0) {
        setTranslateX((prev) => Math.max(prev - 100, 0));
      }
    }
  };

  // Toggle chọn bạn bè
  const toggleFriendSelection = (friendId) => {
    setSelectedFriends(prev => 
      prev.includes(friendId) 
        ? prev.filter(id => id !== friendId)
        : [...prev, friendId]
    );
  };

  // Chia sẻ với bạn bè qua chat
  const shareWithSelectedFriends = async () => {
    if (selectedFriends.length === 0) {
      alert('Vui lòng chọn ít nhất một bạn bè!');
      return;
    }

    setIsSharing(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      
      for (const friendId of selectedFriends) {
        console.log(`Creating conversation with friend: ${friendId}`);
        
        // Tạo conversation với friend
        const conversationResponse = await fetch(`${API_URL}/chat/conversations`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ recipientId: friendId })
        });

        console.log('Conversation response status:', conversationResponse.status);

        if (conversationResponse.ok) {
          const conversationData = await conversationResponse.json();
          console.log('Conversation created/found:', conversationData);
          
          // Lấy conversation object từ response
          const conversation = conversationData.conversation;
          
          // Gửi tin nhắn share
          const message = shareMessage || `${user?.name} đã chia sẻ một bài viết với bạn: ${shareUrl}`;
          
          console.log('Sending share message to conversation:', conversation._id);
          
          const messageResponse = await fetch(`${API_URL}/chat/conversations/${conversation._id}/messages`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
              content: message,
              type: 'share',
              sharedPost: {
                id: postId,
                title: postData?.title || 'Bài viết',
                content: postData?.content || '',
                author: postData?.author?.name || 'Unknown',
                url: shareUrl,
                image: postData?.image || null
              }
            })
          });
          
          console.log('Message response status:', messageResponse.status);
          
          if (messageResponse.ok) {
            const sentMessage = await messageResponse.json();
            console.log('Message sent successfully:', sentMessage);
          } else {
            const errorText = await messageResponse.text();
            console.error('Failed to send message:', errorText);
          }
        } else {
          const errorText = await conversationResponse.text();
          console.error('Failed to create conversation:', errorText);
        }
      }
      
      alert('Chia sẻ thành công!');
      onClose();
    } catch (error) {
      console.error('Error sharing:', error);
      alert('Có lỗi khi chia sẻ!');
    } finally {
      setIsSharing(false);
    }
  };

  // Chia sẻ qua social media
  const handleSocialShare = (platform) => {
    const text = `Check out this post: ${postData?.title || 'Post'} - ${shareUrl}`;
    const encodedText = encodeURIComponent(text);
    const encodedUrl = encodeURIComponent(shareUrl);
    
    let shareUrlForPlatform = '';
    
    switch (platform) {
      case 'facebook':
        shareUrlForPlatform = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'twitter':
        shareUrlForPlatform = `https://twitter.com/intent/tweet?text=${encodedText}`;
        break;
      case 'telegram':
        shareUrlForPlatform = `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;
        break;
      case 'whatsapp':
        shareUrlForPlatform = `https://wa.me/?text=${encodedText}`;
        break;
      default:
        return;
    }
    
    window.open(shareUrlForPlatform, '_blank', 'width=600,height=400');
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center m_flex-row z-50 ">
      <div
        className="absolute inset-0 bg-black opacity-50 z-10"
        onClick={onClose}
      ></div>
      <div className="relative top-0 left-0 w-[600px] max-h-[80vh] m_w-full bg-white p-4  z-10 rounded-xl shadow-xl animate__animated animate__bounceIn">
        <div className="flex-row-center m_flex-row w-full">
          <h3 className="text-lg font-bold">Chia sẽ ngay</h3>
        </div>
        <div
          className="absolute top-1 right-1 cursor-pointer hover:bg-gray-300 rounded-full p-4 "
          onClick={onClose}
        >
          <img src={CloseBlack} width={15} height={15} alt="" />
        </div>
        <div>
          <button className="bg-black text-white shadow-xl hover:bg-gray-800 my-2">
            Tạo bài đăng
          </button>
        </div>

        <div className="h-[1px] w-full bg-gray-200 my-2"></div>

        <div className=" relative flex flex-col items-start justify-start m_flex-col gap-2 w-full">
          <span className="text-base font-bold">Chia sẽ với bạn bè</span>
          
          {/* Message input */}
          <textarea
            placeholder="Thêm lời nhắn (tùy chọn)..."
            value={shareMessage}
            onChange={(e) => setShareMessage(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg resize-none"
            rows={2}
          />
          
          <div className="flex justify-start items-start m_flex-row gap-2 w-full overflow-scroll relative">
            <div
              ref={listRef}
              className="flex justify-start items-start m_flex-row gap-2 transition-transform duration-300"
              style={{ transform: `translateX(-${translateX}px)` }}
            >
              {friends.length > 0 ? friends.map((friend) => {
                const isSelected = selectedFriends.includes(friend._id);
                // API trả về có thể có fullName hoặc username
                const friendName = friend.fullName || friend.username || friend.name || 'Unknown';
                const friendAvatar = friend.avatar;
                
                return (
                  <div
                    className={`flex flex-col gap-2 px-5 py-4 m_px-3 rounded-lg cursor-pointer min-h-[120px] transition-colors ${
                      isSelected ? 'bg-blue-100 border-2 border-blue-500' : 'hover:bg-gray-200'
                    }`}
                    key={friend._id}
                    onClick={() => toggleFriendSelection(friend._id)}
                  >
                    <img
                      src={friendAvatar ? `${import.meta.env.VITE_API_URL}${friendAvatar}` : '/default-avatar.png'}
                      className="max-w-[50px] max-h-[50px] rounded-full object-cover"
                      alt={friendName}
                      onError={(e) => {
                        e.target.src = '/default-avatar.png';
                      }}
                    />
                    <span className={`${styles.text_ellipsis_2Line} text-xs font-medium`}>
                      {friendName}
                    </span>
                    {isSelected && (
                      <div className="text-blue-500 text-xs">✓ Đã chọn</div>
                    )}
                  </div>
                );
              }) : (
                <div className="text-gray-500 p-4">
                  Không có bạn bè nào
                </div>
              )}
            </div>
            {translateX > 0 && (
              <div
                className="absolute top-1/2 left-0 m_hidden cursor-pointer"
                onClick={() => handleTranslate("prev")}
              >
                <img
                  src={NextDouble}
                  width={20}
                  height={20}
                  alt="previous"
                  className="rotate-180"
                />
              </div>
            )}
            {translateX < maxTranslate && (
              <div
                className="absolute top-1/2 right-0 m_hidden cursor-pointer"
                onClick={() => handleTranslate("next")}
              >
                <img src={NextDouble} width={20} height={20} alt="next" />
              </div>
            )}
          </div>
          
          {/* Share button */}
          {selectedFriends.length > 0 && (
            <button
              onClick={shareWithSelectedFriends}
              disabled={isSharing}
              className="mt-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
            >
              {isSharing ? 'Đang chia sẻ...' : `Chia sẻ với ${selectedFriends.length} bạn`}
            </button>
          )}
        </div>

        <div className="h-[1px] w-full bg-gray-200 my-2"></div>

        <div>
          <span className="flex-row-start text-base font-bold">
            Chia sẽ qua
          </span>
          <div>
            <div className="relative gap-2 my-4 l_hidden t_hidden">
              <input
                type="text"
                value={displayUrl}
                readOnly
                className="w-full bg-gray-100 p-4 rounded-lg truncate cursor-pointer"
                onClick={() => navigator.clipboard.writeText(shareUrl)}
              />
              <div
                className=" absolute flex-row-center gap-2 top-1/2 -translate-y-1/2 right-2 border-2 border-gray-800 hover:bg-gray-200 outline-none p-2 rounded-lg cursor-pointer"
                onClick={handleCopy}
              >
                <img src={ShareLink} width={20} height={20} alt="" />
                <span>{isCopied ? "Đã sao chép" : "Sao chép"}</span>
              </div>
            </div>
            <div className="relative gap-2 my-4 m_hidden">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="w-full bg-gray-100 p-4 rounded-lg truncate cursor-pointer"
                onClick={() => navigator.clipboard.writeText(shareUrl)}
              />
              <div
                className=" absolute flex-row-center gap-2 top-1/2 -translate-y-1/2 right-2 border-2 border-gray-800 hover:bg-gray-200 outline-none p-2 rounded-lg cursor-pointer"
                onClick={handleCopy}
              >
                <img src={ShareLink} width={20} height={20} alt="" />
                <span>{isCopied ? "Đã sao chép" : "Sao chép"}</span>
              </div>
            </div>
            <div className="flex-row-between ">
              {shareThrough.map((item, index) => {
                let platform = '';
                if (item.name.toLowerCase().includes('facebook')) platform = 'facebook';
                else if (item.name.toLowerCase().includes('twitter')) platform = 'twitter';  
                else if (item.name.toLowerCase().includes('telegram')) platform = 'telegram';
                else if (item.name.toLowerCase().includes('whatsapp')) platform = 'whatsapp';
                
                return (
                  <div
                    className="flex-column-center m_flex-row m_px-4 gap-2 hover:bg-gray-200 py-4 px-6 rounded-lg cursor-pointer"
                    key={index}
                    onClick={() => platform ? handleSocialShare(platform) : null}
                  >
                    <img src={item.src} width={45} height={45} alt="" />
                    <span className="text-xs  whitespace-nowrap">
                      {item.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Share;
