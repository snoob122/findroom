import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { FiHeart, FiMapPin, FiHome } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

interface Listing {
  _id: string;
  title: string;
  price: number;
  location: {
    address: string;
    city: string;
    district: string;
  };
  roomDetails: {
    area: number;
    roomType: string;
  };
  images: string[];
  landlord: {
    name: string;
    verifiedBadge: boolean;
  };
}

const Listings = () => {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    minPrice: '',
    maxPrice: '',
    roomType: '',
    city: '',
    district: ''
  });

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await axios.get(`/api/listings?${params.toString()}`);
      setListings(response.data.listings);
    } catch (error) {
      toast.error('Không thể tải danh sách phòng');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchListings();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Danh sách phòng trọ</h1>

      {/* Filters */}
      <div className="card p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <input
            type="text"
            placeholder="Tìm kiếm..."
            className="input"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
          
          <input
            type="number"
            placeholder="Giá tối thiểu"
            className="input"
            value={filters.minPrice}
            onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
          />
          
          <input
            type="number"
            placeholder="Giá tối đa"
            className="input"
            value={filters.maxPrice}
            onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
          />
          
          <select
            className="input"
            value={filters.roomType}
            onChange={(e) => setFilters({ ...filters, roomType: e.target.value })}
          >
            <option value="">Loại phòng</option>
            <option value="single">Phòng đơn</option>
            <option value="shared">Phòng ghép</option>
            <option value="apartment">Căn hộ</option>
            <option value="house">Nhà nguyên căn</option>
          </select>
          
          <input
            type="text"
            placeholder="Thành phố"
            className="input"
            value={filters.city}
            onChange={(e) => setFilters({ ...filters, city: e.target.value })}
          />
          
          <button onClick={handleSearch} className="btn-primary">
            Tìm kiếm
          </button>
        </div>
      </div>

      {/* Listings Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <Link
              key={listing._id}
              to={`/listings/${listing._id}`}
              className="card overflow-hidden group"
            >
              {/* Image */}
              <div className="relative h-48 bg-gray-200 dark:bg-gray-700 overflow-hidden">
                {listing.images[0] ? (
                  <img
                    src={listing.images[0]}
                    alt={listing.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FiHome size={48} className="text-gray-400" />
                  </div>
                )}
                
                {/* Save Button */}
                {user && (
                  <button
                    className="absolute top-4 right-4 p-2 bg-white dark:bg-gray-800 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={(e) => {
                      e.preventDefault();
                      // TODO: Implement save functionality
                    }}
                  >
                    <FiHeart />
                  </button>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2 line-clamp-2">
                  {listing.title}
                </h3>
                
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <FiMapPin className="mr-1" size={14} />
                  {listing.location.district}, {listing.location.city}
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-primary-600 font-bold text-xl">
                    {formatPrice(listing.price)}/tháng
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {listing.roomDetails.area}m²
                  </div>
                </div>

                {listing.landlord.verifiedBadge && (
                  <div className="mt-2 inline-flex items-center text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-1 rounded">
                    ✓ Chủ trọ uy tín
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      {!loading && listings.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Không tìm thấy phòng trọ phù hợp
          </p>
        </div>
      )}
    </div>
  );
};

export default Listings;

