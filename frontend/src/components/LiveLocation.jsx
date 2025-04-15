import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './leaflet.css';

// Leaflet icon configuration (Vite-compatible)
const DefaultIcon = new L.Icon({
  iconUrl: new URL('leaflet/dist/images/marker-icon.png', import.meta.url).href,
  iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).href,
  shadowUrl: new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).href,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const LiveLocation = ({ hostelPosition }) => {
  const [liveLocations, setLiveLocations] = useState([]);
  const [locationLoading, setLocationLoading] = useState(false);
  const [trackingError, setTrackingError] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);

  const fetchLiveLocations = async () => {
    try {
      setTrackingError('');
      setLocationLoading(true);
      
      const res = await axios.get(
        "http://localhost:5000/api/attendance/live-locations",
        {
          headers: { 
            'x-auth-token': localStorage.getItem('token') 
          }
        }
      );

      if (res.data.success) {
        setLiveLocations(res.data.data);
      }
    } catch (err) {
      setTrackingError(err.response?.data?.msg || "Failed to fetch live locations");
    } finally {
      setLocationLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveLocations();
    const interval = setInterval(fetchLiveLocations, 120000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">
          Live Student Locations (7 PM - 11 PM)
        </h2>
        <button
          onClick={fetchLiveLocations}
          disabled={locationLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {locationLoading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {trackingError && (
        <div className="bg-red-100 text-red-700 p-3 rounded-lg">
          Error: {trackingError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Map Section */}
        <div className="h-96 bg-gray-50 rounded-lg overflow-hidden">
          <MapContainer 
            center={selectedStudent ? 
              [selectedStudent.latitude, selectedStudent.longitude] : 
              hostelPosition
            }
            zoom={selectedStudent ? 17 : 15}
            className="h-full w-full"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap contributors'
            />

            {/* Hostel Marker */}
            <Marker position={hostelPosition}>
              <Popup>
                <span className="font-semibold">Hostel Location</span>
                <br />
                Reference Point
              </Popup>
            </Marker>

            {/* Student Markers */}
            {liveLocations.map(student => {
              const isSelected = selectedStudent?.email === student.email;
              
              return (
                student.latitude && (
                  <Marker
                    key={student.email}
                    position={[student.latitude, student.longitude]}
                    icon={isSelected ? 
                      new L.Icon({
                        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
                        iconSize: [25, 41],
                        iconAnchor: [12, 41],
                        popupAnchor: [1, -34],
                        shadowUrl: new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).href
                      }) : 
                      DefaultIcon
                    }
                    eventHandlers={{
                      click: () => setSelectedStudent(student)
                    }}
                  >
                    <Popup>
                      <div className="space-y-1">
                        <h3 className="font-bold text-lg">{student.name}</h3>
                        <p className="text-sm">
                          <span className="font-medium">Distance:</span> {student.distance} km
                        </p>
                        <p className={`text-sm ${
                          student.status === "Within Range" 
                            ? 'text-green-600' 
                            : 'text-red-600'
                        }`}>
                          Status: {student.status}
                        </p>
                        <p className="text-xs text-gray-500">
                          Last updated: {new Date(student.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </Popup>
                  </Marker>
                )
              )}
            )}
          </MapContainer>
        </div>

        {/* Student List Section */}
        <div className="max-h-96 overflow-y-auto space-y-3">
          {liveLocations.map(student => (
            <div 
              key={student.email}
              className={`p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors ${
                selectedStudent?.email === student.email 
                  ? 'bg-blue-50 border-blue-300' 
                  : 'border-gray-200'
              }`}
              onClick={() => setSelectedStudent(student)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{student.name}</h3>
                  <p className="text-sm text-gray-600">{student.email}</p>
                </div>
                <span className={`px-2 py-1 rounded text-sm ${
                  student.status === "Within Range" 
                    ? "bg-green-100 text-green-800" 
                    : "bg-red-100 text-red-800"
                }`}>
                  {student.status}
                </span>
              </div>
              {student.distance && (
                <div className="mt-2 text-sm">
                  <p>
                    Distance: {student.distance} km
                    <span className="ml-2 text-gray-500">
                      (Updated: {new Date(student.timestamp).toLocaleTimeString()})
                    </span>
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LiveLocation;