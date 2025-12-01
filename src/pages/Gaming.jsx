import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthProvider';
import rankingIcon from '../assets/icons/main/ranking.png';
import goldMedal from '../assets/icons/main/gold_medal.png';
import silverMedal from '../assets/icons/main/silver_medal.png';
import bronzeMedal from '../assets/icons/main/bronze_medal.png';
import { 
  Play, 
  Trophy, 
  Users, 
  Calendar, 
  Star, 
  Download,
  ExternalLink,
  Gamepad2,
  Medal,
  Zap,
  Clock,
  Target,
  Flame,
  Crown,
  Swords
} from 'lucide-react';

function Gaming() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('for-you');
  const [games, setGames] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);

  // Mock data
  useEffect(() => {
    const mockGames = [
      {
        id: 1,
        name: 'Space Conquest',
        ranking: 1,
        genre: 'Strategy',
        image: 'https://picsum.photos/400/600?random=10',
        rating: 4.8,
        downloads: '2.5M',
        price: 'Free',
        description: 'Chinh phục không gian trong game chiến thuật hấp dẫn',
        developer: 'SpaceZone Games',
        releaseDate: '2024-01-15',
        features: ['Multiplayer', 'Real-time', 'Action', 'Leaderboards'],
        screenshots: [
          'https://picsum.photos/800/450?random=11',
          'https://picsum.photos/800/450?random=12',
          'https://picsum.photos/800/450?random=13'
        ]
      },
      {
        id: 2,
        name: 'Cosmic Runner',
        ranking: 2,
        genre: 'Action',
        image: 'https://picsum.photos/400/600?random=14',
        rating: 4.6,
        downloads: '5.1M',
        price: '$4.99',
        description: 'Cuộc phiêu lưu vô tận trong vũ trụ bao la',
        developer: 'Stellar Studios',
        releaseDate: '2023-11-20',
        features: ['Single-player', 'Offline', 'Achievements', 'Leaderboards'],
        screenshots: [
          'https://picsum.photos/800/450?random=15',
          'https://picsum.photos/800/450?random=16'
        ]
      },
      {
        id: 3,
        name: 'Galaxy Defense',
        ranking: 3,
        genre: 'Tower Defense',
        image: 'https://picsum.photos/400/600?random=17',
        rating: 4.7,
        downloads: '3.8M',
        price: 'Free',
        description: 'Bảo vệ thiên hà khỏi các cuộc tấn công của người ngoài hành tinh',
        developer: 'Defense Corp',
        releaseDate: '2024-02-28',
        features: ['Strategy', 'Upgrades', 'Campaign', 'Leaderboards'],
        screenshots: [
          'https://picsum.photos/800/450?random=18',
          'https://picsum.photos/800/450?random=19',
          'https://picsum.photos/800/450?random=20'
        ]
      }
    ];

    const mockTournaments = [
      {
        id: 1,
        name: 'SpaceZone Championship',
        ranking: 1,
        game: 'Space Conquest',
        prize: '$10,000',
        participants: 2847,
        startDate: '2024-12-15',
        endDate: '2024-12-20',
        status: 'upcoming',
        image: 'https://picsum.photos/600/300?random=21',
        description: 'Giải đấu lớn nhất năm của SpaceZone Gaming'
      },
      {
        id: 2,
        name: 'Cosmic Speed Run',
        ranking: 2,
        game: 'Cosmic Runner',
        prize: '$5,000',
        participants: 1250,
        startDate: '2024-12-01',
        endDate: '2024-12-07',
        status: 'active',
        image: 'https://picsum.photos/600/300?random=22',
        description: 'Cuộc đua tốc độ căng thẳng'
      },
      {
        id: 3,
        name: 'Defense Masters',
        ranking: 3,
        game: 'Galaxy Defense',
        prize: '$3,000',
        participants: 892,
        startDate: '2024-11-20',
        endDate: '2024-11-25',
        status: 'completed',
        image: 'https://picsum.photos/600/300?random=23',
        description: 'Tìm ra cao thủ phòng thủ xuất sắc nhất'
      }
    ];

    const mockAchievements = [
      {
        id: 1,
        name: 'First Victory',
        description: 'Giành chiến thắng đầu tiên',
        icon: '🏆',
        earned: true,
        rarity: 'common',
        points: 100
      },
      {
        id: 2,
        name: 'Speed Demon',
        description: 'Hoàn thành level trong 30 giây',
        icon: '⚡',
        earned: true,
        rarity: 'rare',
        points: 500
      },
      {
        id: 3,
        name: 'Master Brain',
        description: 'Thắng 100 trận ranked',
        icon: '🧠',
        earned: false,
        rarity: 'legendary',
        points: 2000,
        progress: 73
      }
    ];

    const mockLeaderboard = [
      {
        id: 1,
        rank: 1,
        username: 'GalaxyMaster',
        score: 98750,
        avatar: `${import.meta.env.VITE_API_URL}/uploads/avatar/default.png`,
        level: 87,
        title: 'Grand Champion'
      },
      {
        id: 2,
        rank: 2,
        username: 'SpaceWarrior',
        score: 95320,
        avatar: `${import.meta.env.VITE_API_URL}/uploads/avatar/default.png`,
        level: 82,
        title: 'Silver Player'
      },
      {
        id: 3,
        rank: 3,
        username: 'CosmicHero',
        score: 92180,
        avatar: `${import.meta.env.VITE_API_URL}/uploads/avatar/default.png`,
        level: 78,
        title: 'Bronze Gamer'
      },
      {
        id: 4,
        rank: 4,
        username: user?.username || 'YourName',
        score: 88940,
        avatar: `${import.meta.env.VITE_API_URL}/uploads/avatar/default.png`,
        level: 75,
        title: 'Rising Star',
        isCurrentUser: true
      }
    ];

    setGames(mockGames);
    setTournaments(mockTournaments);
    setAchievements(mockAchievements);
    setLeaderboard(mockLeaderboard);
  }, [user]);

  const tabs = [
    { id: 'for-you', label: 'Dành cho bạn', icon: <Target className="w-5 h-5" /> },
    { id: 'games', label: 'Trò chơi', icon: <Gamepad2 className="w-5 h-5" /> },
    { id: 'tournaments', label: 'Giải đấu', icon: <Trophy className="w-5 h-5" /> },
    { id: 'leaderboard', label: 'Bảng xếp hạng', icon: <Medal className="w-5 h-5" /> },
    { id: 'achievements', label: 'Thành tích', icon: <Star className="w-5 h-5" /> }
  ];

  const getStatusBadge = (status) => {
    const statusConfig = {
      upcoming: { color: 'bg-blue-100 text-blue-700', text: 'Sắp diễn ra' },
      active: { color: 'bg-green-100 text-green-700', text: 'Đang diễn ra' },
      completed: { color: 'bg-gray-100 text-gray-700', text: 'Đã kết thúc' }
    };
    return statusConfig[status] || statusConfig.upcoming;
  };

  const getRarityColor = (rarity) => {
    const colors = {
      common: 'border-gray-400',
      rare: 'border-blue-400',
      epic: 'border-purple-400',
      legendary: 'border-yellow-400'
    };
    return colors[rarity] || colors.common;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-5">
      <div className="max-w-5xl mx-auto px-4 ">
        {/* Header */}
        <div className="bg-white mb-6 p-6 rounded-lg shadow-md flex flex-col justify-center items-center ">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2 ">
            <Gamepad2 className="w-8 h-8 text-blue-500" />
            GAMING
          </h1>
          <p className="text-gray-600">Khám phá thế giới game cùng cộng đồng SpaceZone</p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6 overflow-x-auto">
          <div className="flex justify-center gap-2 min-w-max">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center justify-center w-full gap-2 px-6 py-4 border-2 border-gray-400 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id 
                    ? 'bg-green-500 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* For You Tab */}
        {activeTab === 'for-you' && (
          <div className="space-y-8">
            {/* Featured Game */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-8 text-white">
              <div className="flex flex-col lg:flex-row items-center gap-6">
                <img 
                  src={games[0]?.image} 
                  alt="Featured Game"
                  className="w-32 h-48 rounded-lg object-cover"
                />
                <div className="flex-1 text-center lg:text-left">
                  <h2 className="text-3xl font-bold mb-2 uppercase ">Game of the Month</h2>
                  <h3 className="text-xl mb-4">{games[0]?.name}</h3>
                  <p className="text-lg mb-6">{games[0]?.description}</p>
                  <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                    <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors">
                      {/* <Play className="inline w-5 h-5 mr-2" /> */}
                      ▶️ Chơi ngay
                    </button>
                    <button className="border border-white text-black px-6 py-3 rounded-lg font-bold hover:bg-white hover:text-purple-600 transition-colors">
                      ℹ️ Tìm hiểu thêm
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <Gamepad2 className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-800">{games.length}</div>
                <div className="text-sm text-gray-600">Trò chơi</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-800">{tournaments.length}</div>
                <div className="text-sm text-gray-600">Giải đấu</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <Star className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-800">
                  {achievements.filter(a => a.earned).length}
                </div>
                <div className="text-sm text-gray-600">Thành tích</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <Users className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-800">2.8K</div>
                <div className="text-sm text-gray-600">Người chơi online</div>
              </div>
            </div>

            {/* Recent Tournaments */}
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Giải đấu nổi bật</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tournaments.slice(0, 3).map(tournament => {
                  const statusBadge = getStatusBadge(tournament.status);
                  return (
                    <div key={tournament.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                      <img 
                        src={tournament.image} 
                        alt={tournament.name}
                        className="w-full h-40 object-cover"
                      />
                      <div className="p-4">
                        <div className="flex items-center flex-col gap-1 justify-between mb-2">
                          <h3 className="text-base font-bold text-gray-800 uppercase">{tournament.name}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusBadge.color}`}>
                            {statusBadge.text}
                          </span>
                        </div>
                        <p className="text-gray-400 font-bold text-sm mb-3  truncate">{tournament.description}</p>
                        <div className="flex items-center justify-center gap-4 text-sm text-gray-500 mb-3">
                          <span>🏅 <strong>{tournament.prize}</strong></span>
                          <span>🧑‍🤝‍🧑 <strong>{tournament.participants}</strong> </span>
                        </div>
                        <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg transition-colors">
                          {tournament.status === 'upcoming' ? 'Đăng ký' : 'Xem chi tiết'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Games Tab */}
        {activeTab === 'games' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.map(game => (
              <div key={game.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <img 
                  src={game.image} 
                  alt={game.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <div className="flex flex-col items-center justify-between mb-2">
                    <h3 className="text-2xl font-bold text-gray-800 mb-1">{game.name}</h3>
                    <div className="text-right flex gap-4 ">
                      <div className="flex items-center gap-1 " >
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-md font-medium font-bold">{game.rating}</span>
                      </div>
                      <div className="text-md text-gray-400 font-bold">{game.downloads}</div>
                    </div>
                  </div>
                  <div className="text-md text-gray-500 mb-2">
                    {game.genre} • {game.developer}
                  </div>
                  <p className="text-green-600 font-bold text-sm mb-3 line-clamp-2 truncate">{game.description}</p>
                  
                  {/* Features */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {game.features.map(feature => (
                      <span key={feature} className="bg-gray-100 text-gray-700 text-md px-2 py-2 rounded">
                        {feature}
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                      <Play className="w-4 h-4" />
                      <span>{game.price === 'Free' ? 'Chơi ngay' : 'Mua ngay'}</span>
                    </button>
                    <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-4 rounded-lg transition-colors">
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tournaments Tab */}
        {activeTab === 'tournaments' && (
          <div className="space-y-6">
            {tournaments.map(tournament => {
              const statusBadge = getStatusBadge(tournament.status);
              return (
                <div key={tournament.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="md:flex">
                    <img 
                      src={tournament.image} 
                      alt={tournament.name}
                      className="w-full  md:w-80 bg-gray-100 p-3  object-cover"
                    />
                    <div className="p-6 flex-1">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-2xl font-bold text-gray-800 mb-1">{tournament.name}</h3>
                          <p className="text-gray-600">{tournament.description}</p>
                        </div>
                        <span className={`px-4 py-2 rounded-full text-md font-extrabold ${statusBadge.color}`}>
                          {statusBadge.text}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="flex flex-col items-center ">
                          <img src={rankingIcon} width={35} alt="" />
                          <div className="font-bold text-red-600">{tournament.ranking}</div>
                        </div>
                        <div>
                          <div className="text-2xl text-gray-500">🏅</div>
                          <div className="font-bold text-green-600">{tournament.prize}</div>
                        </div>
                        <div>
                          <div className="text-2xl text-gray-500">🤼</div>
                          <div className="font-bold">{tournament.participants.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-2xl text-gray-500">⏰</div>
                          <div className="font-bold text-sm">
                            {new Date(tournament.startDate).toLocaleDateString('vi-VN')}
                          </div>
                        </div>
                      </div>

                      <div className="flex  justify-center gap-3">
                        <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-4 rounded-lg w-full transition-colors">
                          {tournament.status === 'upcoming' ? 'Đăng ký tham gia' : 'Xem chi tiết'}
                        </button>
                        <button className="border border-gray-300 text-gray-700 px-6 py-4 rounded-lg w-full hover:bg-gray-50 transition-colors">
                          Chia sẻ
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Leaderboard Tab */}
        {activeTab === 'leaderboard' && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-extrabold text-green-600 uppercase mb-1">Bảng xếp hạng toàn server</h2>
              <p className="text-gray-400 font-bold text-base">Top game thủ xuất sắc nhất</p>
            </div>
            <div className="divide-y divide-gray-200">
              {leaderboard.map(player => (
                <div key={player.id} className={`p-6 flex items-center gap-4 ${player.isCurrentUser ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`}>
                  <div className="flex-shrink-0">
                    {player.rank === 1 && <img src={goldMedal} alt="Gold Medal" className="w-10 h-10" /> }
                    {player.rank === 2 && <img src={silverMedal} alt="Silver Medal" className="w-10 h-10" />}
                    {player.rank === 3 && <img src={bronzeMedal} alt="Bronze Medal" className="w-10 h-10" />}
                    {player.rank > 3 && (
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="font-bold text-gray-600">#{player.rank}</span>
                      </div>
                    )}
                  </div>

                  <img 
                    src={player.avatar} 
                    alt={player.username}
                    className="w-12 h-12 rounded-full object-cover"
                  />

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-800">{player.username}</h3>
                      {player.isCurrentUser && (
                        <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">Bạn</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">{player.title}</div>
                  </div>

                  <div className="text-right">
                    <div className="font-bold text-gray-800">{player.score.toLocaleString()}</div>
                    <div className="text-sm text-gray-500">Level {player.level}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Achievements Tab */}
        {activeTab === 'achievements' && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Thành tích của bạn</h2>
              <div className="bg-white rounded-lg p-4 shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Tiến độ tổng thể</span>
                  <span className="font-semibold">
                    {achievements.filter(a => a.earned).length}/{achievements.length}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: `${(achievements.filter(a => a.earned).length / achievements.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {achievements.map(achievement => (
                <div key={achievement.id} className={`bg-white rounded-lg shadow-lg p-6 border-1 ${getRarityColor(achievement.rarity)} ${achievement.earned ? 'opacity-100' : 'opacity-60'}`}>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="text-4xl border-2 rounded-full py-2 px-1 border-gray-400">{achievement.icon}</div>
                    <div>
                      <h3 className="font-bold text-lg uppercase text-gray-800">{achievement.name}</h3>
                      <p className="text-sm font-bold text-gray-400">{achievement.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="w-6 h-6 text-yellow-500" />
                      <span className="text-md font-bold">{achievement.points} điểm</span>
                    </div>
                    <span className={`text-xs px-4 py-2 rounded-full capitalize ${
                      achievement.rarity === 'legendary' ? 'bg-yellow-100 text-yellow-700' :
                      achievement.rarity === 'epic' ? 'bg-purple-100 text-purple-700' :
                      achievement.rarity === 'rare' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {achievement.rarity}
                    </span>
                  </div>

                  {!achievement.earned && achievement.progress && (
                    <div className="mt-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Tiến độ</span>
                        <span>{achievement.progress}/100</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${achievement.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {achievement.earned && (
                    <div className="bg-green-400 p-3 rounded-lg mt-3 flex justify-center w-full items-center gap-1 cursor-pointer text-gray-900 font-bold text-sm">
                      <Star className="w-4 h-4 fill-current " color='white'/>
                      <span>Đã đạt được</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Gaming;