import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const MapDisplay = ({ userLat, userLng, hostelLat, hostelLng, distance }) => {
  const hostelIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/447/447031.png',
    iconSize: [32, 32],
  });

  const userIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
    iconSize: [32, 32],
  });

  return (
    <div className="mt-4 p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-2">
        Your Location: {distance.toFixed(2)}km from Hostel
      </h3>
      <MapContainer
        center={[userLat, userLng]}
        zoom={15}
        style={{ height: '300px', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker position={[hostelLat, hostelLng]} icon={hostelIcon}>
          <Popup>Hostel Location</Popup>
        </Marker>
        <Marker position={[userLat, userLng]} icon={userIcon}>
          <Popup>Your Current Location</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default MapDisplay;