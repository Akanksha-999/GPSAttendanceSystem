import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminControls.css';

const AdminControls = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/user", {
          params: { role: "student" }
        });
        
        // Verify response structure
        console.log("Students data:", res.data);
        if (Array.isArray(res.data)) {
          setStudents(res.data);
        } else {
          throw new Error("Invalid response format");
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Failed to load students");
        setStudents([]); // Ensure students is always an array
      }
    };
    fetchStudents();
  }, []);

  const handleReset = async () => {
    // if (!selectedStudent) return;
    
    // try {
    //     setLoading(true);
    //     console.log("Resetting attendance for:", selectedStudent);
    //     const res = await axios.post( "http://localhost:5000/api/attendance/reset", { 
    //       studentId: selectedStudent 
    //     },
    //     {
    //         headers: {
    //           "Content-Type": "application/json",
    //           "x-auth-token": localStorage.getItem("token") // Add auth token
    //         }
    //       }
    // );
    //     console.log("Reset response:", res.data);
    //     alert("Attendance reset successfully!");
    //   } catch (err) {
    //     console.error("Reset error:", err.response?.data);
    //     alert(err.response?.data?.msg || "Reset failed");
    //   } finally {
    //     setLoading(false);
    //   }
    
    try {
        const token = localStorage.getItem("token");
        console.log("Using token:", token); // Verify token exists
        
        const res = await axios.post(
          "http://localhost:5000/api/attendance/reset",
          { studentId: selectedStudent },
          {
            headers: {
              "Content-Type": "application/json",
              "x-auth-token": token
            }
          }
        );
        console.log("Full response:", res);
        alert(`Reset successful! Deleted ${res.data.deletedCount} records.`);
      }catch (err) {
        console.error("Complete error object:", err);
        console.error("Response data:", err.response?.data);
        alert(`Error: ${err.response?.data?.msg || err.message}`);
      }

  };

  return (
    <div className="control-panel">
      <h2>Student Attendance Controls</h2>
      
      {error && <div className="error-alert">{error}</div>}

      <div className="form-group">
        <label>Select Student:</label>
        <select
          value={selectedStudent}
          onChange={(e) => setSelectedStudent(e.target.value)}
          disabled={loading}
        >
          <option value="">Choose a student</option>
          {students.map(s => (
            <option key={s._id} value={s._id}>
              {s.name} ({s.email})
            </option>
          ))}
        </select>
      </div>


      <button 
        onClick={handleReset}
        disabled={!selectedStudent || loading}
        className="reset-button"
      >
        {loading ? "Processing..." : "Reset Attendance"}
      </button>
    </div>
  );
};

export default AdminControls;