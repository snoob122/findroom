import { useState, useEffect } from 'react';
import axios from 'axios';
import { FiHeart, FiUser } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

interface RoommateMatch {
  user: {
    id: string;
    name: string;
    avatar?: string;
    university: string;
    major: string;
    bio: string;
    budget: {
      min: number;
      max: number;
    };
    interests: string[];
  };
  compatibilityScore: number;
  matchReasons: string[];
}

const RoommateFinder = () => {
  const { user } = useAuth();
  const [matches, setMatches] = useState<RoommateMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProfileSetup, setShowProfileSetup] = useState(false);

  useEffect(() => {
    if (user) {
      fetchMatches();
    }
  }, [user]);

  const fetchMatches = async () => {
    try {
      const response = await axios.get('/api/roommates/find');
      setMatches(response.data.matches);
    } catch (error: any) {
      if (error.response?.status === 400) {
        setShowProfileSetup(true);
      } else {
        toast.error('Không thể tải danh sách gợi ý');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(price);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 dark:bg-green-900/30';
    if (score >= 60) return 'bg-yellow-100 dark:bg-yellow-900/30';
    return 'bg-gray-100 dark:bg-gray-700';
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Đăng nhập để tìm bạn cùng phòng</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Bạn cần đăng nhập để sử dụng tính năng này
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (showProfileSetup) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto card p-8">
          <h2 className="text-2xl font-bold mb-4">Hoàn thiện hồ sơ tìm bạn cùng phòng</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Vui lòng hoàn thiện hồ sơ trong phần Cài đặt để sử dụng tính năng tìm bạn cùng phòng.
          </p>
          <a href="/profile" className="btn-primary inline-block">
            Đi tới cài đặt hồ sơ
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Tìm bạn cùng phòng</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Dựa trên thói quen, sở thích và ngân sách của bạn
          </p>
        </div>

        {matches.length === 0 ? (
          <div className="card p-12 text-center">
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Chưa tìm thấy bạn cùng phòng phù hợp. Hãy thử cập nhật hồ sơ của bạn!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matches.map((match) => (
              <div key={match.user.id} className="card overflow-hidden">
                {/* Avatar */}
                <div className="h-32 bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center relative">
                  {match.user.avatar ? (
                    <img
                      src={match.user.avatar}
                      alt={match.user.name}
                      className="w-24 h-24 rounded-full border-4 border-white"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full border-4 border-white bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <FiUser size={40} className="text-gray-400" />
                    </div>
                  )}
                  
                  {/* Compatibility Score */}
                  <div className={`absolute top-4 right-4 ${getScoreBgColor(match.compatibilityScore)} px-3 py-1 rounded-full`}>
                    <span className={`font-bold ${getScoreColor(match.compatibilityScore)}`}>
                      {match.compatibilityScore}%
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-1">{match.user.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {match.user.university} - {match.user.major}
                  </p>

                  {match.user.bio && (
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 line-clamp-2">
                      {match.user.bio}
                    </p>
                  )}

                  {/* Budget */}
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Ngân sách:</p>
                    <p className="font-semibold text-primary-600">
                      {formatPrice(match.user.budget.min)} - {formatPrice(match.user.budget.max)}
                    </p>
                  </div>

                  {/* Interests */}
                  {match.user.interests && match.user.interests.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Sở thích:</p>
                      <div className="flex flex-wrap gap-2">
                        {match.user.interests.slice(0, 3).map((interest, index) => (
                          <span
                            key={index}
                            className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded"
                          >
                            {interest}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Match Reasons */}
                  {match.matchReasons.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-medium mb-2">Lý do phù hợp:</p>
                      <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                        {match.matchReasons.slice(0, 2).map((reason, index) => (
                          <li key={index}>• {reason}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button className="flex-1 btn-primary text-sm">
                      Xem hồ sơ
                    </button>
                    <button className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                      <FiHeart />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RoommateFinder;

