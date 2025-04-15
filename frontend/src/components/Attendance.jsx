import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import axios from 'axios';
import MapDisplay from './MapDisplay'; // Make sure to create this component

const HOSTEL_LAT = 23.256394;
const HOSTEL_LNG = 77.458534;
const RADIUS_KM = 0.5;

// Haversine formula for frontend distance calculation
const haversine = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * (Math.PI/180)) * 
    Math.cos(lat2 * (Math.PI/180)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

const Attendance = () => {
  const videoRef = useRef();
  const [msg, setMsg] = useState("Loading Camera...");
  const [isModelReady, setIsModelReady] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [locationData, setLocationData] = useState({
    userLat: null,
    userLng: null,
    distance: null
  });

  // Initialize face-api.js and camera
  useEffect(() => {
    const init = async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
          faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
          faceapi.nets.faceRecognitionNet.loadFromUri("/models")
        ]);
        setIsModelReady(true);
        
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: "user" } 
        });
        videoRef.current.srcObject = stream;
        setMsg("Ready - Center your face");
      } catch (err) {
        console.error("Model loading failed:", err);
        setMsg("Failed to initialize camera");
      }
    };
    init();
  }, []);

  const markAttendance = async (lat, lng) => {
    try {
      setMsg("Scanning face...");
      
      const detection = await faceapi.detectSingleFace(
        videoRef.current,
        new faceapi.TinyFaceDetectorOptions({ 
          inputSize: 512, 
          scoreThreshold: 0.4 
        })
      ).withFaceLandmarks()
      .withFaceDescriptor();

      if (!detection) {
        setMsg("Face not detected. Ensure good lighting and center your face.");
        return;
      }

      setMsg("Face recognized! Checking location...");
      
      // Calculate distance from hostel
      const distance = haversine(lat, lng, HOSTEL_LAT, HOSTEL_LNG);
      setLocationData({
        userLat: lat,
        userLng: lng,
        distance: distance
      });
      setShowMap(true);

      if (distance > RADIUS_KM) {
        setMsg(`You are ${distance.toFixed(2)}km away! Attendance denied.`);
        return;
      }

      // Proceed with attendance marking
      const res = await axios.post("http://localhost:5000/api/attendance/mark", {
        faceDescriptor: Array.from(detection.descriptor),
        latitude: lat,
        longitude: lng
      },{headers: {
        'x-auth-token': localStorage.getItem('token')}
      });
      
      setMsg(`Attendance marked at ${new Date().toLocaleTimeString()}`);
    } catch (err) {
      console.error("API Error:", err.response?.data || err.message);
      setMsg(err.response?.data?.msg || "Error processing attendance");
    }
  };

  // const handleAttendance = async () => {
  //   if (!isModelReady) return;
    
  //   setMsg("Locating...");
  //   navigator.geolocation.getCurrentPosition(
  //     (pos) => {
  //       // Verify accuracy
  //       if (pos.coords.accuracy > 200) { // 100 meters radius
  //         setMsg("Low GPS accuracy. Move to open area.");
  //         return;
  //       }
  //       markAttendance(pos.coords.latitude, pos.coords.longitude);
  //     },
  //     (err) => {
  //       console.error("GPS Error:", err);
        
  //       setShowMap(false);
        
  //       if (err.code === 2) {
  //         setMsg(`
  //           1. Enable device GPS (not just browser permissions)
  //           2. Ensure you're outdoors with clear sky view
  //           3. Connect to mobile data
  //           4. Wait 30 seconds then retry
  //         `);
  //       } else {
  //         setMsg("Location access required - enable GPS in device settings");
  //       }
  //     },
  //     {
  //       enableHighAccuracy: true,
  //       timeout: 15000,
  //       maximumAge: 0
  //     }
  //   );
  // };

  const handleAttendance = async () => {
    if (!isModelReady) return;

    //✅ Time Check - Must be between 7 PM and 8 PM
    const now = new Date();
    const hour = now.getHours();
    const minutes = now.getMinutes();

    if (hour < 19 || (hour === 20 && minutes > 0) || hour > 20) {
      setMsg("⛔ Attendance can only be marked between 7:00 PM and 8:00 PM.");
      return;
    }

    setMsg("Locating...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        // Verify accuracy
        if (pos.coords.accuracy > 200) {
          setMsg("⚠ Low GPS accuracy. Move to open area.");
          return;
        }
        markAttendance(pos.coords.latitude, pos.coords.longitude);
      },
      (err) => {
        console.error("GPS Error:", err);
        setShowMap(false);
        if (err.code === 2) {
          setMsg(`📍 Location tips:
  1. Enable device GPS (not just browser permissions)
  2. Ensure you're outdoors with clear sky view
  3. Connect to mobile data
  4. Wait 30 seconds then retry`);
        } else {
          setMsg("Location access required - enable GPS in device settings");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };


  return (
    <div className="p-4">
      <video 
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="w-full max-w-md mx-auto border rounded-lg"
        style={{ transform: 'scaleX(-1)' }}
      />

<div className="mt-4 space-y-4">
      <button
        onClick={handleAttendance}
        disabled={!isModelReady}
        className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-400 w-full"
      >
        {isModelReady ? "Mark Attendance" : "Loading..."}
      </button>
</div>
     
      
      <div className="mt-4 p-2 bg-gray-100 rounded">
        {msg.split('\n').map((line, i) => <p key={i}>{line}</p>)}
      </div>

      {showMap && locationData.userLat && (
        <MapDisplay
          userLat={locationData.userLat}
          userLng={locationData.userLng}
          hostelLat={HOSTEL_LAT}
          hostelLng={HOSTEL_LNG}
          distance={locationData.distance}
        />
      )}
      
    </div>
  );
};

export default Attendance;