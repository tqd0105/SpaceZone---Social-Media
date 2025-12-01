import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthProvider';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  Users, 
  Globe, 
  Lock, 
  MoreHorizontal, 
  UserPlus,
  Settings,
  TrendingUp,
  MessageSquare,
  Calendar
} from 'lucide-react';

function Groups() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('discover');
  const [myGroups, setMyGroups] = useState([]);
  const [suggestedGroups, setSuggestedGroups] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Mock data
  useEffect(() => {
    const mockMyGroups = [
      {
        id: 1,
        name: 'Space Enthusiasts Vietnam',
        description: 'Cộng đồng những người yêu thích khoa học vũ trụ',
        image: 'https://picsum.photos/300/200?random=1',
        members: 15420,
        privacy: 'public',
        role: 'admin',
        lastActivity: '2 giờ trước',
        newPosts: 5,
        category: 'science'
      },
      {
        id: 2,
        name: 'React Developers VN',
        description: 'Chia sẻ kiến thức và kinh nghiệm lập trình React',
        image: 'https://picsum.photos/300/200?random=2',
        members: 8930,
        privacy: 'public',
        role: 'member',
        lastActivity: '1 ngày trước',
        newPosts: 12,
        category: 'technology'
      },
      {
        id: 3,
        name: 'Photography Club',
        description: 'Nhóm dành cho những người đam mê nhiếp ảnh',
        image: 'https://picsum.photos/300/200?random=3',
        members: 3245,
        privacy: 'private',
        role: 'moderator',
        lastActivity: '5 giờ trước',
        newPosts: 3,
        category: 'arts'
      }
    ];

    const mockSuggestedGroups = [
      {
        id: 4,
        name: 'Startup Vietnam',
        description: 'Kết nối các startup và doanh nhân trẻ Việt Nam',
        image: 'https://picsum.photos/300/200?random=4',
        members: 12680,
        privacy: 'public',
        category: 'business',
        mutualFriends: 8
      },
      {
        id: 5,
        name: 'AI & Machine Learning',
        description: 'Thảo luận về trí tuệ nhân tạo và học máy',
        image: 'https://picsum.photos/300/200?random=5',
        members: 9420,
        privacy: 'public',
        category: 'technology',
        mutualFriends: 15
      },
      {
        id: 6,
        name: 'Travel Vietnam',
        description: 'Chia sẻ kinh nghiệm du lịch trong nước',
        image: 'https://picsum.photos/300/200?random=6',
        members: 25340,
        privacy: 'public',
        category: 'travel',
        mutualFriends: 5
      }
    ];

    setMyGroups(mockMyGroups);
    setSuggestedGroups(mockSuggestedGroups);
  }, []);

  const categories = [
    { id: 'all', label: 'Tất cả', icon: '🌐' },
    { id: 'technology', label: 'Công nghệ', icon: '💻' },
    { id: 'science', label: 'Khoa học', icon: '🔬' },
    { id: 'arts', label: 'Nghệ thuật', icon: '🎨' },
    { id: 'business', label: 'Kinh doanh', icon: '💼' },
    { id: 'travel', label: 'Du lịch', icon: '✈️' }
  ];

  const tabs = [
    { id: 'discover', label: 'Khám phá', icon: <TrendingUp className="w-5 h-5" /> },
    { id: 'my-groups', label: 'Nhóm của tôi', icon: <Users className="w-5 h-5" /> },
    { id: 'create', label: 'Tạo nhóm', icon: <Plus className="w-5 h-5" /> }
  ];

  const filteredSuggestedGroups = selectedCategory === 'all' 
    ? suggestedGroups 
    : suggestedGroups.filter(group => group.category === selectedCategory);

  const filteredMyGroups = searchTerm
    ? myGroups.filter(group => 
        group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : myGroups;

  const joinGroup = (groupId) => {
    console.log('Joining group:', groupId);
    // API call to join group
  };

  const createGroup = (e) => {
    e.preventDefault();
    console.log('Creating new group');
    // API call to create group
  };

  return (
    <div className="min-h-screen bg-gray-50 py-5">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        {/* <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Nhóm</h1>
          <p className="text-gray-600">Kết nối và chia sẻ với những người có cùng sở thích</p>
        </div> */}

        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="hidden lg:block w-80 space-y-4">
          <h1 className="text-3xl font-bold text-gray-800  bg-white rounded-lg p-2 shadow-xl">NHÓM </h1>

            {/* Navigation Tabs */}
            <div className="bg-white rounded-lg p-4 shadow-md">
              <h2 className="text-xl font-bold text-gray-800 mb-4">MENU</h2>
              <div className="space-y-4">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 p-6 rounded-lg transition-colors ${
                      activeTab === tab.id 
                        ? 'bg-blue-500 text-white' 
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    {tab.icon}
                    <span className="font-bold text-md">{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Categories for Discovery */}
            {activeTab === 'discover' && (
              <div className="bg-white rounded-lg p-4 shadow-md">
                <h3 className="text-lg font-bold text-gray-800 mb-8">DANH MỤC</h3>
                <div className="space-y-1">
                  {categories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                        selectedCategory === category.id 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <span>{category.icon}</span>
                      <span className="text-sm font-bold">{category.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Stats */}
            <div className="bg-white rounded-lg p-4 shadow-md">
              <h3 className="text-lg font-bold text-gray-800 mb-4">THỐNG KÊ</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400 font-bold">Nhóm đã tham gia:</span>
                  <span className="font-semibold">{myGroups.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 font-bold">Bài viết mới:</span>
                  <span className="font-semibold">
                    {myGroups.reduce((total, group) => total + group.newPosts, 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 font-bold">Tổng thành viên:</span>
                  <span className="font-semibold">
                    {myGroups.reduce((total, group) => total + group.members, 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Mobile Tabs */}
            <div className="lg:hidden mb-4">
              <div className="flex overflow-x-auto gap-2 pb-2">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                      activeTab === tab.id 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {tab.icon}
                    <span className="text-sm font-medium">{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Search Bar for My Groups */}
            {activeTab === 'my-groups' && (
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm trong nhóm của bạn..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            {/* My Groups Content */}
            {activeTab === 'my-groups' && (
              <div className="space-y-4">
                {filteredMyGroups.map(group => (
                  <div key={group.id} className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-content gap-4">
                      <img 
                        src={group.image} 
                        alt={group.name}
                        className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="flex-1 flex flex-col justify-start">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-lg font-bold text-gray-800 hover:text-blue-600 cursor-pointer">
                              {group.name}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              {group.privacy === 'public' ? "🌐" : "🔒"
                              }
                              <span>{group.members.toLocaleString()} thành viên</span>
                              👉
                              <span className="capitalize">{group.role}</span>
                            </div>
                          </div>
                          <button className="p-2 hover:bg-gray-100 rounded-full">
                            <MoreHorizontal className="w-5 h-5 text-gray-500" />
                          </button>
                        </div>
                        <p className="text-gray-600 mb-3">{group.description}</p>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>🔵 {group.lastActivity}</span>
                            
                          </div>
                          <div className="flex items-center justify-center gap-2">
                            <div>
                              {group.newPosts > 0 && (
                              <span className="bg-blue-100 text-blue-700 px-3 py-3 rounded-full">
                                {group.newPosts}+
                              </span>
                            )}
                            </div>
                            <button className="flex items-center gap-1 px-3 py-3 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
                              <MessageSquare className="w-4 h-4" />
                              {/* <span className="text-sm">Thảo luận</span> */}
                            </button>
                            <button className="flex items-center gap-1 px-3 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors">
                              <Settings className="w-4 h-4" />
                              {/* <span className="text-sm">Quản lý</span> */}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {filteredMyGroups.length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">👥</div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                      {searchTerm ? 'Không tìm thấy nhóm nào' : 'Bạn chưa tham gia nhóm nào'}
                    </h3>
                    <p className="text-gray-500 mb-4">
                      {searchTerm 
                        ? 'Thử tìm kiếm với từ khóa khác' 
                        : 'Khám phá và tham gia các nhóm thú vị để kết nối với cộng đồng'
                      }
                    </p>
                    {!searchTerm && (
                      <button 
                        onClick={() => setActiveTab('discover')}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
                      >
                        Khám phá nhóm
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Discover Groups Content */}
            {activeTab === 'discover' && (
              <div>
                {/* Mobile Categories */}
                <div className="lg:hidden mb-4">
                  <div className="flex overflow-x-auto gap-2 pb-2">
                    {categories.map(category => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
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

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
                  {filteredSuggestedGroups.map(group => (
                    <div key={group.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                      <img 
                        src={group.image} 
                        alt={group.name}
                        className="w-full h-100 object-cover"
                      />
                      <div className="p-4">
                        <h3 className="text-lg font-bold text-gray-800 mb-2">{group.name}</h3>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{group.description}</p>
                        
                        <div className="flex flex-col items-center gap-2 text-sm text-gray-500 mb-3">
                          <div class="flex gap-1">
                            🌐
                            <span>{group.members.toLocaleString()} thành viên</span>
                          </div>
                          
                          {group.mutualFriends > 0 && (
                            <div class="flex gap-1">
                              <span>👥</span>
                              <span>{group.mutualFriends} bạn chung</span>
                            </div>
                          )}
                        </div>

                        <button 
                          onClick={() => joinGroup(group.id)}
                          className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg transition-colors"
                        >
                          <UserPlus className="w-4 h-4" />
                          <span>Tham gia nhóm</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredSuggestedGroups.length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                      Không có nhóm nào trong danh mục này
                    </h3>
                    <p className="text-gray-500">
                      Thử chọn danh mục khác hoặc tạo nhóm mới!
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Create Group Content */}
            {activeTab === 'create' && (
              <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-lg p-6 shadow-md">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Tạo nhóm mới</h2>
                  
                  <form onSubmit={createGroup} className="space-y-6">
                    {/* Group Cover */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ảnh bìa nhóm
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer">
                        <div className="text-4xl mb-2">📸</div>
                        <p className="text-gray-600">Nhấp để tải lên ảnh bìa</p>
                        <p className="text-sm text-gray-500">Khuyến nghị: 1200 x 630px</p>
                      </div>
                    </div>

                    {/* Group Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tên nhóm *
                      </label>
                      <input
                        type="text"
                        placeholder="Nhập tên nhóm..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    {/* Group Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mô tả nhóm *
                      </label>
                      <textarea
                        rows="4"
                        placeholder="Mô tả về nhóm của bạn..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    {/* Privacy Settings */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quyền riêng tư
                      </label>
                      <div className="space-y-3">
                        <label className="flex items-center justify-center gap-3 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                          <input type="radio" name="privacy" value="public" defaultChecked />
                          🌐
                          <div>
                            <div className="font-medium">Công khai</div>
                            <div className="text-sm text-gray-500">Mọi người đều có thể tìm thấy và tham gia</div>
                          </div>
                        </label>
                        <label className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                          <input type="radio" name="privacy" value="private" />
                          🔒
                          <div>
                            <div className="font-medium">Riêng tư</div>
                            <div className="text-sm text-gray-500">Chỉ thành viên trong nhóm mới thấy bài viết</div>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* Category */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Danh mục
                      </label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        {categories.filter(cat => cat.id !== 'all').map(category => (
                          <option key={category.id} value={category.id}>
                            {category.icon} {category.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Submit Button */}
                    <div className="flex gap-3">
                      <button
                        type="submit"
                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-medium transition-colors"
                      >
                        Tạo nhóm
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab('my-groups')}
                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Hủy
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Groups;