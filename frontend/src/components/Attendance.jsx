import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import axios from 'axios';

const Attendance = () => {
  const videoRef = useRef();
  const [msg, setMsg] = useState("Initializing...");
  const [isModelReady, setIsModelReady] = useState(false);

  // Initialize face-api.js and camera
  useEffect(() => {
    const init = async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
          faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
          faceapi.nets.faceRecognitionNet.loadFromUri("/models") // ✅ Add this
        ]);
        setIsModelReady(true);
        
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: "user" } 
        });
        videoRef.current.srcObject = stream;
        setMsg("Ready - Center your face");
      } catch (err) {
        console.error("Model loading failed:", err);
      }
    };
    init();
  }, []);

  const markAttendance = async (lat, lng) => {
    try {
      const detection = await faceapi.detectSingleFace(
        videoRef.current,
        new faceapi.TinyFaceDetectorOptions({ 
          inputSize: 512, 
          scoreThreshold: 0.4 
        })
      ).withFaceLandmarks() //requires facelandmark68net
      .withFaceDescriptor(); //requires facerecognitionnet

      if (!detection) {
        setMsg("Face not detected. Try better lighting.");
        return;
      }

      const res = await axios.post("http://localhost:5000/api/attendance/mark", {
        faceDescriptor: Array.from(detection.descriptor),
        latitude: lat,
        longitude: lng
      });
      
      setMsg(`Attendance marked at ${new Date().toLocaleTimeString()}`);
    } catch (err) {
      console.error("API Error:", err.response?.data || err.message);
      setMsg(err.response?.data?.msg || "Error processing attendance");
    }
  };

  const handleAttendance = async () => {
    if (!isModelReady) return;
    
    setMsg("Locating...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        markAttendance(pos.coords.latitude, pos.coords.longitude);
      },
      (err) => {
        console.warn("GPS unavailable, using fallback");
        markAttendance(23.256394, 77.458534); // Your hostel coordinates
      },
      { 
        timeout: 20000, 
        maximumAge: 0 
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
      <button
        onClick={handleAttendance}
        disabled={!isModelReady}
        className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg"
      >
        {isModelReady ? "Mark Attendance" : "Loading..."}
      </button>
      <div className="mt-4 p-2 bg-gray-100 rounded">
        {msg.split('\n').map((line, i) => <p key={i}>{line}</p>)}
      </div>
    </div>
  );
};

export default Attendance;