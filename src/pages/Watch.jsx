import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthProvider';
import { Play, Pause, Volume, VolumeX, MoreHorizontal, Heart, MessageCircle, Share, Bookmark } from 'lucide-react';

function Watch() {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('for-you');
  const [videos, setVideos] = useState([]);
  const [playingVideo, setPlayingVideo] = useState(null);
  const [mutedVideos, setMutedVideos] = useState(new Set());
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);

  // Mock data cho videos
  useEffect(() => {
    const mockVideos = [
      {
        id: 1,
        title: 'FPT vs FW | ONE vs PSG | QUARTER FINALS | AIC 2025 (30/11)',
        creator: 'Garena Liên Quân Mobile',
        avatar: `${import.meta.env.VITE_API_URL}/uploads/avatar/default.png`,
        thumbnail: 'https://i.ytimg.com/vi/DDcZMK1GC78/hq720.jpg?v=692bd81b&sqp=-oaymwEnCNAFEJQDSFryq4qpAxkIARUAAIhCGAHYAQHiAQoIGBACGAY4AUAB&rs=AOn4CLAgOrTjkYuuXe1Hp36f2f5wXT0fNg',
        videoUrl: 'https://www.youtube.com/watch?v=H6pzruub5hc',
        duration: '15:30',
        views: '2.5M',
        likes: '150K',
        comments: '12K',
        shares: '5.2K',
        description: 'FPT vs FW | ONE vs PSG | QUARTER FINALS | AIC 2025 (30/11)',
        category: 'esports'
      },
      {
        id: 2,
        title: '2 Ngày 1 Đêm Việt Nam | Tập 1: Trường Giang chơi chiêu, Kiều Minh Tuấn rớt hết "sĩ diện" vì miếng ăn',
        creator: 'ĐÔNG TÂY PROMOTION OFFICIAL',
        avatar: `${import.meta.env.VITE_API_URL}/uploads/avatar/default.png`,
        thumbnail: 'https://i.ytimg.com/vi/T6uymZbt4eA/hq720.jpg?sqp=-oaymwEnCNAFEJQDSFryq4qpAxkIARUAAIhCGAHYAQHiAQoIGBACGAY4AUAB&rs=AOn4CLAs438neH8mjLCZOkNE5s60lRkhKg',
        videoUrl: 'https://www.youtube.com/watch?v=T6uymZbt4eA&pp=ygUYMiBuZ2F5IDEgZGVtIHRhcCAxIG11YSAx',
        duration: '8:45',
        views: '5.1M',
        likes: '320K',
        comments: '25K',
        shares: '15.8K',
        description: '2 Ngày 1 Đêm Việt Nam | Tập 1 FULL: Trường Giang chơi chiêu, Kiều Minh Tuấn rớt hết sĩ diện vì miếng ăn Tập đầu tiên của #2Ngay1DemVietNam đã chính thức lên sóng. Điểm đến cho chuyến đi đầu tiên Tự Do Tự Lo #2Ngay1Dem chính là Hà Tiên - một thành phố ven biển được ví như thiên đường nơi hạ giới thuộc tỉnh Kiên Giang. Cùng xem màn chạm trán đầu tiên của các thành viên trong biệt đội 2N1Đ sẽ lầy lội thế nào nhé!',
        category: 'entertainment'
      },
      {
        id: 3,
        title: '🔴Trực tiếp: Thái Lan - Việt Nam | Chung kết lượt về ASEAN Mitsubishi Electric Cup™ 2024',
        creator: 'BÓNG ĐÁ VIỆT NAM',
        avatar: `${import.meta.env.VITE_API_URL}/uploads/avatar/default.png`,
        thumbnail: 'https://i.ytimg.com/vi/MpmqnBpXHTA/hq720.jpg?sqp=-oaymwEnCNAFEJQDSFryq4qpAxkIARUAAIhCGAHYAQHiAQoIGBACGAY4AUAB&rs=AOn4CLCIsQLpz4KNT_r8mNN2xrAru-LqMA',
        videoUrl: 'https://www.youtube.com/watch?v=MpmqnBpXHTA&pp=ygUOdm4gdnMgdGhhaWxhbmQ%3D',
        duration: '22:15',
        views: '1.8M',
        likes: '95K',
        comments: '8.5K',
        shares: '3.2K',
        description: '🔴Trực tiếp: Thái Lan - Việt Nam | Chung kết lượt về ASEAN Mitsubishi Electric Cup™ 2024',
        category: 'lifestyle'
      }
    ];
    setVideos(mockVideos);
  }, []);

  const categories = [
    { id: 'for-you', label: 'Dành cho bạn', icon: '🎯' },
    { id: 'trending', label: 'Xu hướng', icon: '🔥' },
    { id: 'education', label: 'Giáo dục', icon: '📚' },
    { id: 'entertainment', label: 'Giải trí', icon: '🎭' },
    { id: 'lifestyle', label: 'Lối sống', icon: '✨' },
    { id: 'sports', label: 'Thể thao', icon: '⚽' },
    { id: 'music', label: 'Âm nhạc', icon: '🎵' }
  ];

  const handlePlayPause = (videoId) => {
    const video = videos.find(v => v.id === videoId);
    setSelectedVideo(video);
    setShowVideoModal(true);
    setPlayingVideo(videoId);
  };

  const closeVideoModal = () => {
    setShowVideoModal(false);
    setSelectedVideo(null);
    setPlayingVideo(null);
  };

  const getYouTubeEmbedUrl = (url) => {
    const videoId = url.split('v=')[1]?.split('&')[0];
    return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
  };

  const toggleMute = (videoId) => {
    const newMutedVideos = new Set(mutedVideos);
    if (newMutedVideos.has(videoId)) {
      newMutedVideos.delete(videoId);
    } else {
      newMutedVideos.add(videoId);
    }
    setMutedVideos(newMutedVideos);
  };

  const filteredVideos = selectedCategory === 'for-you' || selectedCategory === 'trending' 
    ? videos 
    : videos.filter(video => video.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-50 md:py-8 pb-24 ">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        {/* <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Watch</h1>
          <p className="text-gray-600">Khám phá những video thú vị từ cộng đồng SpaceZone</p>
        </div> */}

        <div className="flex gap-6">
          {/* Sidebar Categories */}
          <div className="hidden lg:block w-80 bg-white rounded-lg p-4 h-fit shadow-md h-[calc(100vh-5rem)] sticky top-20">
            <h2 className="text-xl font-bold text-gray-800 mb-3">Watch Video</h2>
            <div className="space-y-2">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    selectedCategory === category.id 
                      ? 'bg-blue-500 text-white' 
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <span className="text-xl">{category.icon}</span>
                  <span className="font-medium">{category.label}</span>
                </button>
              ))}
            </div>

            {/* Stats */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <h3 className="font-bold text-lg text-gray-800 mb-2">THỐNG KÊ</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <div className='font-bold p-1'><span className='font-bold text-gray-400'>Tổng video:</span> {videos.length}</div>
                <div className='font-bold p-1'><span className='font-bold text-gray-400'>Đang phát:</span> {playingVideo ? 1 : 0}</div>
                <div className='font-bold p-1'><span className='font-bold text-gray-400'>Danh mục:</span> {categories.length}</div>
              </div>
            </div>
          </div>

          {/* Video Feed */}
          <div className="flex-1">
            {/* Mobile Categories */}
            <div className="lg:hidden mb-4">
              <div className="flex overflow-x-auto gap-2 pb-2">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex w-full my-2 items-center gap-2 md:px-4 md:py-2 rounded-full whitespace-nowrap transition-colors ${
                      selectedCategory === category.id 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span>{category.icon}</span>
                    <span className="text-sm font-medium">{category.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Videos Grid */}
            <div className="grid grid-cols-1 md:grid-cols-1 xl:grid-cols-1 gap-6">
              {filteredVideos.map(video => (
                <div key={video.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Video Thumbnail */}
                  <div className="relative  bg-gray-900">
                    <img 
                      src={video.thumbnail} 
                      alt={video.title}
                      className="w-full object-cover"
                    />
                    
                    {/* Video Controls Overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity" style={{display: "flex"}}>
                      <button
                        onClick={() => handlePlayPause(video.id)}
                        className="bg-white bg-opacity-20 backdrop-blur-sm rounded-full p-4 hover:bg-opacity-30 transition-colors"
                      >
                        {playingVideo === video.id ? (
                          <Pause className="w-8 h-8 text-white" />
                        ) : (
                          <Play className="w-8 h-8 text-white" />
                        )}
                      </button>
                    </div>

                    {/* Duration */}
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                      {video.duration}
                    </div>

                    {/* Volume Control */}
                    <button
                      onClick={() => toggleMute(video.id)}
                      className="absolute top-2 right-2 bg-black bg-opacity-70 text-white p-2 rounded-full hover:bg-opacity-90"
                    >
                      {mutedVideos.has(video.id) ? (
                        <VolumeX className="w-4 h-4" />
                      ) : (
                        <Volume className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Video Info */}
                  <div className="p-4">
                    {/* Creator Info */}
                    <div className="flex items-center text-center gap-3 mb-3" style={{display: "flex"}}>
                      <img 
                        src={video.avatar} 
                        alt={video.creator}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">{video.creator}</h3>
                        <p className="text-sm text-gray-600">{video.views} lượt xem</p>
                      </div>
                      <button className="p-1 hover:bg-gray-100 rounded-full">
                        <MoreHorizontal className="w-5 h-5 text-gray-500" />
                      </button>
                    </div>

                    {/* Video Title & Description */}
                    <h4 className="font-bold text-gray-800 mb-2 line-clamp-2">{video.title}</h4>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{video.description}</p>

                    {/* Interaction Buttons */}
                    <div className="flex items-center justify-between border-t border-gray-200 pt-3">
                      <div className="flex items-center gap-2" style={{display: "flex", justifyContent: "space-between"}} > 
                        <button className="flex items-center gap-1 text-gray-600 hover:text-red-500 transition-colors">
                          <Heart className="w-5 h-5" />
                          {/* <span className="text-sm">{video.likes}</span> */}
                        </button>
                        <button className="flex items-center gap-1 text-gray-600 hover:text-blue-500 transition-colors">
                          <MessageCircle className="w-5 h-5" />
                          {/* <span className="text-sm">{video.comments}</span> */}
                        </button>
                        <button className="flex items-center gap-1 text-gray-600 hover:text-green-500 transition-colors">
                          <Share className="w-5 h-5" />
                          {/* <span className="text-sm">{video.shares}</span> */}
                        </button>
                        <button className="text-gray-600 hover:text-blue-500 transition-colors">
                        <Bookmark className="w-5 h-5" />
                      </button>
                      </div>
                      
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {filteredVideos.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎬</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  Chưa có video nào trong danh mục này
                </h3>
                <p className="text-gray-500">
                  Hãy thử chọn danh mục khác hoặc quay lại sau để xem video mới!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Video Modal */}
      {showVideoModal && selectedVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={closeVideoModal}>
          <div className="bg-white rounded-lg p-4 max-w-4xl w-full mx-4 max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">{selectedVideo.title}</h2>
              <button 
                onClick={closeVideoModal}
                className="text-white hover:text-gray-900 text-2xl bg-red-600 font-bold rounded-full px-4 py-2 hover:bg-red-500 shadow-lg"
              >
                ×
              </button>
            </div>
            
            <div className="aspect-video mb-4">
              <iframe
                src={getYouTubeEmbedUrl(selectedVideo.videoUrl)}
                className="w-full h-full rounded-lg"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={selectedVideo.title}
              />
            </div>

            <div className="flex items-center gap-3 mb-3">
              <img 
                src={selectedVideo.avatar} 
                alt={selectedVideo.creator}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <h3 className="font-semibold text-gray-800">{selectedVideo.creator}</h3>
                <p className="text-sm text-gray-600">{selectedVideo.views} lượt xem</p>
              </div>
            </div>

            <p className="text-gray-700 mb-4">{selectedVideo.description}</p>

            <div className="flex items-center justify-between border-t border-gray-200 pt-3">
              <div className="flex items-center gap-4">
                <button className="flex items-center gap-2 text-gray-600 hover:text-red-500 transition-colors">
                  <Heart className="w-5 h-5" />
                  <span>{selectedVideo.likes}</span>
                </button>
                <button className="flex items-center gap-2 text-gray-600 hover:text-blue-500 transition-colors">
                  <MessageCircle className="w-5 h-5" />
                  <span>{selectedVideo.comments}</span>
                </button>
                <button className="flex items-center gap-2 text-gray-600 hover:text-green-500 transition-colors">
                  <Share className="w-5 h-5" />
                  <span>{selectedVideo.shares}</span>
                </button>
              </div>
              <button className="text-gray-600 hover:text-blue-500 transition-colors">
                <Bookmark className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Watch;