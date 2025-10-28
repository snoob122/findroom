import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FiHeart, FiMessageCircle, FiEye, FiPlus } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';

interface BlogPost {
  _id: string;
  title: string;
  content: string;
  category: string;
  author: {
    name: string;
    avatar?: string;
  };
  likes: string[];
  comments: any[];
  views: number;
  createdAt: string;
  images: string[];
}

const Blog = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');

  const categories = [
    { value: '', label: 'Tất cả' },
    { value: 'tips', label: 'Mẹo hay' },
    { value: 'experience', label: 'Kinh nghiệm' },
    { value: 'checklist', label: 'Checklist xem phòng' },
    { value: 'scam-report', label: 'Cảnh báo lừa đảo' },
    { value: 'discussion', label: 'Thảo luận' }
  ];

  useEffect(() => {
    fetchPosts();
  }, [selectedCategory]);

  const fetchPosts = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedCategory) params.append('category', selectedCategory);

      const response = await axios.get(`/api/blogs?${params.toString()}`);
      setPosts(response.data.blogs);
    } catch (error) {
      console.error('Failed to fetch blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryBadgeColor = (category: string) => {
    const colors: Record<string, string> = {
      tips: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      experience: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      checklist: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      'scam-report': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      discussion: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    };
    return colors[category] || colors.discussion;
  };

  const getCategoryLabel = (category: string) => {
    const cat = categories.find(c => c.value === category);
    return cat?.label || category;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Blog & Cộng đồng</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Chia sẻ kinh nghiệm, mẹo hay và cảnh báo lừa đảo
          </p>
        </div>
        
        {user && (
          <Link to="/create-blog" className="btn-primary flex items-center">
            <FiPlus className="mr-2" />
            Viết bài
          </Link>
        )}
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {categories.map((category) => (
          <button
            key={category.value}
            onClick={() => setSelectedCategory(category.value)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
              selectedCategory === category.value
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>

      {/* Blog Posts */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link
              key={post._id}
              to={`/blog/${post._id}`}
              className="card overflow-hidden group"
            >
              {/* Image */}
              {post.images && post.images[0] && (
                <div className="h-48 bg-gray-200 dark:bg-gray-700 overflow-hidden">
                  <img
                    src={post.images[0]}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
              )}

              {/* Content */}
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-xs px-2 py-1 rounded ${getCategoryBadgeColor(post.category)}`}>
                    {getCategoryLabel(post.category)}
                  </span>
                </div>

                <h3 className="text-lg font-semibold mb-2 line-clamp-2">
                  {post.title}
                </h3>

                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                  {post.content.substring(0, 150)}...
                </p>

                {/* Author & Stats */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    {post.author.avatar ? (
                      <img
                        src={post.author.avatar}
                        alt={post.author.name}
                        className="w-6 h-6 rounded-full mr-2"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-600 mr-2"></div>
                    )}
                    <span className="text-gray-700 dark:text-gray-300">{post.author.name}</span>
                  </div>

                  <div className="flex items-center gap-3 text-gray-500">
                    <span className="flex items-center">
                      <FiHeart size={14} className="mr-1" />
                      {post.likes.length}
                    </span>
                    <span className="flex items-center">
                      <FiMessageCircle size={14} className="mr-1" />
                      {post.comments.length}
                    </span>
                    <span className="flex items-center">
                      <FiEye size={14} className="mr-1" />
                      {post.views}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {!loading && posts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Chưa có bài viết nào trong danh mục này
          </p>
        </div>
      )}
    </div>
  );
};

export default Blog;

