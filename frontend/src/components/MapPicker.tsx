import { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { Icon, LatLng } from 'leaflet';
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

interface MapPickerProps {
  position: { lat: number; lng: number } | null;
  onPositionChange: (position: { lat: number; lng: number }) => void;
  onAddressChange?: (address: string) => void;
}

function LocationMarker({ position, onPositionChange }: { 
  position: { lat: number; lng: number } | null;
  onPositionChange: (position: { lat: number; lng: number }) => void;
}) {
  useMapEvents({
    click(e) {
      const newPosition = { lat: e.latlng.lat, lng: e.latlng.lng };
      onPositionChange(newPosition);
      
      // Reverse geocoding (get address from coordinates)
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${e.latlng.lat}&lon=${e.latlng.lng}`)
        .then(res => res.json())
        .then(data => {
          if (data.display_name) {
            // Trigger address update in parent component
            const event = new CustomEvent('addressFound', { detail: data.display_name });
            window.dispatchEvent(event);
          }
        })
        .catch(err => console.error('Geocoding error:', err));
    },
  });

  return position ? <Marker position={[position.lat, position.lng]} icon={DefaultIcon} /> : null;
}

const MapPicker = ({ position, onPositionChange, onAddressChange }: MapPickerProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);

  // Listen for address updates
  useState(() => {
    const handleAddressFound = (e: any) => {
      if (onAddressChange) {
        onAddressChange(e.detail);
      }
    };
    window.addEventListener('addressFound', handleAddressFound);
    return () => window.removeEventListener('addressFound', handleAddressFound);
  });

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setSearching(true);
    try {
      // Geocoding (get coordinates from address)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}, TP.HCM, Vietnam`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        onPositionChange({ lat: parseFloat(lat), lng: parseFloat(lon) });
        if (onAddressChange) {
          onAddressChange(data[0].display_name);
        }
      } else {
        alert('Không tìm thấy địa chỉ. Vui lòng thử lại!');
      }
    } catch (error) {
      console.error('Search error:', error);
      alert('Có lỗi xảy ra khi tìm kiếm địa chỉ');
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Tìm kiếm địa chỉ (vd: Quận 1, TP.HCM)..."
          className="input flex-1"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button
          type="button"
          onClick={handleSearch}
          disabled={searching}
          className="btn-primary whitespace-nowrap"
        >
          {searching ? 'Đang tìm...' : 'Tìm kiếm'}
        </button>
      </div>

      {/* Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-sm">
        <p className="text-blue-800 dark:text-blue-300">
          💡 <strong>Hướng dẫn:</strong> Click vào bản đồ để chọn vị trí chính xác của phòng trọ, 
          hoặc tìm kiếm địa chỉ ở ô trên.
        </p>
      </div>

      {/* Map */}
      <div className="h-96 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
        <MapContainer
          center={position ? [position.lat, position.lng] : [10.8231, 106.6297]} // TP.HCM
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker position={position} onPositionChange={onPositionChange} />
        </MapContainer>
      </div>

      {/* Selected Position Info */}
      {position && (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <p>📍 Vị trí đã chọn: {position.lat.toFixed(6)}, {position.lng.toFixed(6)}</p>
        </div>
      )}
    </div>
  );
};

export default MapPicker;

