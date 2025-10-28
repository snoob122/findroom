import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { FiMapPin, FiHome, FiUsers, FiDollarSign, FiCheck, FiHeart } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface Listing {
  _id: string;
  title: string;
  description: string;
  price: number;
  deposit: number;
  location: {
    address: string;
    city: string;
    district: string;
  };
  roomDetails: {
    area: number;
    capacity: number;
    bedrooms: number;
    bathrooms: number;
    roomType: string;
  };
  amenities: string[];
  images: string[];
  landlord: {
    name: string;
    phone: string;
    email: string;
    verifiedBadge: boolean;
  };
  rules: string;
}

const ListingDetail = () => {
  const { id } = useParams();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    fetchListing();
  }, [id]);

  const fetchListing = async () => {
    try {
      const response = await axios.get(`/api/listings/${id}`);
      setListing(response.data.listing);
    } catch (error) {
      toast.error('Không thể tải thông tin phòng');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-xl text-gray-600 dark:text-gray-400">Không tìm thấy phòng</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Images */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-xl overflow-hidden">
          {listing.images[selectedImage] ? (
            <img
              src={listing.images[selectedImage]}
              alt={listing.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <FiHome size={64} className="text-gray-400" />
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2">
          {listing.images.slice(0, 6).map((image, index) => (
            <div
              key={index}
              className={`h-32 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden cursor-pointer ${
                selectedImage === index ? 'ring-2 ring-primary-600' : ''
              }`}
              onClick={() => setSelectedImage(index)}
            >
              <img src={image} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-4">{listing.title}</h1>
            
            <div className="flex items-center text-gray-600 dark:text-gray-400 mb-4">
              <FiMapPin className="mr-2" />
              {listing.location.address}, {listing.location.district}, {listing.location.city}
            </div>

            <div className="flex gap-4 text-lg">
              <div className="flex items-center">
                <FiHome className="mr-2" />
                {listing.roomDetails.area}m²
              </div>
              <div className="flex items-center">
                <FiUsers className="mr-2" />
                {listing.roomDetails.capacity} người
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-2xl font-bold mb-4">Mô tả</h2>
            <p className="whitespace-pre-line text-gray-700 dark:text-gray-300">
              {listing.description}
            </p>
          </div>

          <div className="card p-6">
            <h2 className="text-2xl font-bold mb-4">Tiện nghi</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {listing.amenities.map((amenity, index) => (
                <div key={index} className="flex items-center">
                  <FiCheck className="text-green-500 mr-2" />
                  {amenity}
                </div>
              ))}
            </div>
          </div>

          {listing.rules && (
            <div className="card p-6">
              <h2 className="text-2xl font-bold mb-4">Nội quy</h2>
              <p className="whitespace-pre-line text-gray-700 dark:text-gray-300">
                {listing.rules}
              </p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="card p-6 sticky top-20">
            <div className="text-3xl font-bold text-primary-600 mb-4">
              {formatPrice(listing.price)}/tháng
            </div>

            {listing.deposit > 0 && (
              <div className="text-gray-600 dark:text-gray-400 mb-6">
                Đặt cọc: {formatPrice(listing.deposit)}
              </div>
            )}

            <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mb-6">
              <h3 className="font-bold mb-3">Thông tin chủ trọ</h3>
              <div className="space-y-2">
                <p className="flex items-center">
                  <span className="font-medium mr-2">{listing.landlord.name}</span>
                  {listing.landlord.verifiedBadge && (
                    <span className="text-green-500 text-xs">✓ Uy tín</span>
                  )}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  📞 {listing.landlord.phone}
                </p>
              </div>
            </div>

            <button className="w-full btn-primary mb-3">
              Liên hệ chủ trọ
            </button>
            
            <button className="w-full btn-outline flex items-center justify-center">
              <FiHeart className="mr-2" />
              Lưu tin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingDetail;

