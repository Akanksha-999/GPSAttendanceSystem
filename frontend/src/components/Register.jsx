import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FaceCapture from './FaceCapture';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    faceDescriptor: []
  });
  const navigate = useNavigate();

  // ✅ Fixed: Convert Float32Array to regular array
  const handleFaceCapture = (descriptor) => {
    const descriptorArray = Array.from(descriptor); // Convert for JSON
    setFormData(prev => ({ ...prev, faceDescriptor: descriptorArray }));
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Moved validation BEFORE API call
    if (formData.faceDescriptor.length === 0) {
      alert("Capture your face first!");
      return;
    }

    // ✅ Added error handling for API call
    try {

      console.log("Submitting:", formData);

      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      // if (!res.ok) {
      //   alert('Registration successful!');
      //   navigate('/login');
      // } else {
      //   alert(data.message || 'Registration failed.');
      // }
      if (!res.ok) {
        // ✅ Log detailed backend error
        console.error("Backend Error:", data);
        alert(data.message || "Registration failed.");
        return;
      }
  
      alert('Registration successful!');
      navigate('/login');

    } catch (err) {
      console.error("Network Error:", err);
    alert("Network error. Check console for details.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto mt-10">
      {/* Existing fields */}
      <input name="name" placeholder="Name" onChange={handleChange} required className="w-full p-2 border" />
      <input name="email" placeholder="Email" type="email" onChange={handleChange} required className="w-full p-2 border" />
      <input name="password" placeholder="Password" type="password" onChange={handleChange} required className="w-full p-2 border" />
      <select name="role" onChange={handleChange} className="w-full p-2 border">
        <option value="student">Student</option>
        <option value="admin">Admin</option>
      </select>

      {/* ✅ Added instruction for face capture */}
      <p className="text-sm text-gray-600">Step 2: Capture your face</p>
      <FaceCapture onFaceDetected={handleFaceCapture} />

      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
        Register
      </button>
    </form>
  );
};

export default Register;