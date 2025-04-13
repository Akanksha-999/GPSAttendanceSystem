import React, { useRef, useEffect, useState } from "react";
import * as faceapi from "face-api.js";

const FaceCapture = ({ onFaceDetected }) => {
  const videoRef = useRef();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load models and start camera
  useEffect(() => {
    const init = async () => {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
        await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
        await faceapi.nets.faceRecognitionNet.loadFromUri("/models");

        navigator.mediaDevices
          .getUserMedia({ video: {} })
          .then(stream => (videoRef.current.srcObject = stream))
          .catch(err => setError("Enable camera access!"));

        setLoading(false);
      } catch (err) {
        setError("Failed to load face models");
      }
    };
    init();
  }, []);

  const captureFace = async () => {
    const detection = await faceapi
      .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (detection) {
      onFaceDetected(detection.descriptor); // Pass descriptor to parent
    } else {
      setError("Face not detected. Center your face.");
    }
  };

  return (
    <div className="space-y-4">
      <video ref={videoRef} autoPlay muted className="w-64 h-64 border rounded" />
      {error && <p className="text-red-500">{error}</p>}
      <button
        onClick={captureFace}
        disabled={loading}
        className="px-4 py-2 bg-green-600 text-white rounded"
      >
        {loading ? "Loading..." : "Capture Face"}
      </button>
    </div>
  );
};

export default FaceCapture;