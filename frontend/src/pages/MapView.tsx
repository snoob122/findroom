import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon } from 'leaflet';
import axios from 'axios';
import { FiMapPin, FiDollarSign } from 'react-icons/fi';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = new Icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

interface Listing {
  _id: string;
  title: string;
  price: number;
  location: {
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  images: string[];
}

const MapView = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [dataLayer, setDataLayer] = useState<'price' | 'security' | 'amenities' | 'flood'>('price');
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    roomType: ''
  });

  useEffect(() => {
    fetchListings();
  }, [filters]);

  const fetchListings = async () => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await axios.get(`/api/maps/listings?${params.toString()}`);
      setListings(response.data.listings);
    } catch (error) {
      console.error('Failed to fetch listings:', error);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="h-[calc(100vh-4rem)] relative">
      {/* Filters Sidebar */}
      <div className="absolute top-4 left-4 z-[1000] bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 w-80">
        <h2 className="text-xl font-bold mb-4">Bộ lọc</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Lớp dữ liệu</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setDataLayer('price')}
                className={`p-2 rounded text-sm ${
                  dataLayer === 'price'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700'
                }`}
              >
                💰 Giá thuê
              </button>
              <button
                onClick={() => setDataLayer('security')}
                className={`p-2 rounded text-sm ${
                  dataLayer === 'security'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700'
                }`}
              >
                🛡️ An ninh
              </button>
              <button
                onClick={() => setDataLayer('amenities')}
                className={`p-2 rounded text-sm ${
                  dataLayer === 'amenities'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700'
                }`}
              >
                🏪 Tiện ích
              </button>
              <button
                onClick={() => setDataLayer('flood')}
                className={`p-2 rounded text-sm ${
                  dataLayer === 'flood'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700'
                }`}
              >
                🌊 Ngập lụt
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Khoảng giá</label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Tối thiểu"
                className="input text-sm"
                value={filters.minPrice}
                onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
              />
              <input
                type="number"
                placeholder="Tối đa"
                className="input text-sm"
                value={filters.maxPrice}
                onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Loại phòng</label>
            <select
              className="input text-sm"
              value={filters.roomType}
              onChange={(e) => setFilters({ ...filters, roomType: e.target.value })}
            >
              <option value="">Tất cả</option>
              <option value="single">Phòng đơn</option>
              <option value="shared">Phòng ghép</option>
              <option value="apartment">Căn hộ</option>
              <option value="house">Nhà nguyên căn</option>
            </select>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-bold mb-2">Chú thích</h3>
          {dataLayer === 'price' && (
            <div className="space-y-1 text-xs">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
                <span>Giá thấp (&lt; 2tr)</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-yellow-500 rounded-full mr-2"></div>
                <span>Giá trung bình (2-4tr)</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
                <span>Giá cao (&gt; 4tr)</span>
              </div>
            </div>
          )}
          {dataLayer === 'security' && (
            <div className="space-y-1 text-xs">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
                <span>An toàn</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-yellow-500 rounded-full mr-2"></div>
                <span>Trung bình</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
                <span>Cần cẩn trọng</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Map */}
      <MapContainer
        center={[10.8231, 106.6297]} // TP.HCM coordinates
        zoom={13}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {listings.map((listing) => (
          listing.location.coordinates && (
            <Marker
              key={listing._id}
              position={[listing.location.coordinates.lat, listing.location.coordinates.lng]}
              icon={DefaultIcon}
            >
              <Popup>
                <div className="w-64">
                  {listing.images[0] && (
                    <img
                      src={listing.images[0]}
                      alt={listing.title}
                      className="w-full h-32 object-cover rounded mb-2"
                    />
                  )}
                  <h3 className="font-bold text-sm mb-1">{listing.title}</h3>
                  <p className="text-primary-600 font-bold">{formatPrice(listing.price)}/tháng</p>
                  <p className="text-xs text-gray-600 mt-1">{listing.location.address}</p>
                  <a
                    href={`/listings/${listing._id}`}
                    className="block mt-2 text-xs text-primary-600 hover:underline"
                  >
                    Xem chi tiết →
                  </a>
                </div>
              </Popup>
            </Marker>
          )
        ))}
      </MapContainer>
    </div>
  );
};

export default MapView;

