import React, { useState } from "react";
import axios from "axios";

const AdminDashboard = () => {
  const [report, setReport] = useState(null);
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [reportError, setReportError] = useState("");

  // const fetchReport = async () => {
  //   try {
  //     setLoading(true);
  //     setReportError("");
  //     setReport(null);

  //     const isoDate = new Date(date).toISOString().split('T')[0];
  //     const res = await axios.get(`http://localhost:5000/api/attendance/daily-report?date=${isoDate}`);
      
  //     // Validate response structure
  //     if (!res.data || !res.data.presentStudents || !res.data.absentStudents) {
  //       throw new Error("Invalid report data structure from server");
  //     }

  //     setReport({
  //       date: res.data.date,
  //       total: res.data.total,
  //       present: res.data.present,
  //       absent: res.data.absent,
  //       presentStudents: res.data.presentStudents || [],
  //       absentStudents: res.data.absentStudents || []
  //     });

  //   } catch (err) {
  //     console.error("Error fetching report", err);
  //     setReportError(err.response?.data?.msg || err.message || "Failed to load attendance report");
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const fetchReport = async () => {
    try {
      setLoading(true);
      setReportError("");
      setReport(null);
  
      const isoDate = new Date(date).toISOString().split('T')[0];
      const res = await axios.get(`http://localhost:5000/api/attendance/daily-report?date=${isoDate}`,
        {
          headers: {
            'x-auth-token': localStorage.getItem('token')
          }
        }
      );
      
      // // Validate response structure
      // if (!res.data.success || !res.data.data) {
      //   throw new Error(res.data.msg || "Invalid server response");
      // }

      // After the axios.get call:
if (!res.data || typeof res.data.total !== 'number') {
  throw new Error("Invalid report structure");
}
  
      setReport({
        date: res.data.date,
        total: res.data.total,
        present: res.data.present,
        absent: res.data.absent,
        presentStudents: res.data.presentStudents || [],
        absentStudents: res.data.absentStudents || []
      });
  
    } catch (err) {
      console.error("Error fetching report:", err);
      setReportError(
        err.response?.data?.msg || 
        err.response?.data?.message || 
        err.message || 
        "Failed to load report"
      );    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="p-6 space-y-4">
      <div className="bg-yellow-200 hover:shadow-lg p-6 flex items-center justify-center rounded-xl cursor-pointer transition duration-300 ease-in-out w-full max-w-md mx-auto">
        <h1 className="text-blue-900 font-bold text-xl text-center whitespace-nowrap">
          Admin Attendance Dashboard
        </h1>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="p-2 border rounded flex-1"
          aria-label="Select date for report"
        />
        <button 
          onClick={fetchReport} 
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
          disabled={loading || !date}
        >
          {loading ? "Loading..." : "View Report"}
        </button>
      </div>

      {reportError && (
        <div className="bg-red-100 text-red-700 p-3 rounded-lg">
          Error: {reportError}
        </div>
      )}

      {report && (
        <div className="bg-yellow-100 p-6 rounded-xl shadow-md space-y-3 mx-auto max-w-3xl">
          <h2 className="text-blue-900 font-bold text-xl text-center">
            Attendance Report for {report.date}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-bold text-lg">Total Students</h3>
              <p className="text-2xl">{report.total}</p>
            </div>
            <div className="bg-green-100 p-4 rounded-lg shadow">
              <h3 className="font-bold text-lg">Present</h3>
              <p className="text-2xl">{report.present}</p>
            </div>
            <div className="bg-red-100 p-4 rounded-lg shadow">
              <h3 className="font-bold text-lg">Absent</h3>
              <p className="text-2xl">{report.absent}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Present Students */}
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="text-xl font-bold mb-4">Present Students</h2>
              <div className="max-h-72 overflow-y-auto">
                {report.presentStudents.length > 0 ? (
                   
                  <ul className="space-y-2">
                    {report.presentStudents.map((student, index) => (
                      <li 
                        // key={`${student.email}-${student.timestamp}`}
                        key={'present-${index}'}
                        className="border-b pb-2"
                      >
                      <div className="font-semibold text-blue-900">
                  {student.name} ({student.email})
                </div><div className="text-sm text-gray-600">
                  {new Date(student.timestamp).toLocaleString()}
                </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No present students for this date</p>
                )}
              </div>
            </div>

            {/* Absent Students */}
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="text-xl font-bold mb-4">Absent Students</h2>
              <div className="max-h-72 overflow-y-auto">
                {report.absentStudents.length > 0 ? (
                  <ul className="space-y-2">
                    {report.absentStudents.map((student,index) => (
                      <li 
                        key={'absent-${index}'}
                        className="border-b pb-2"
                      >
                        <div className="font-medium">{student.name}</div>
                        <div className="text-sm text-gray-600">{student.email}</div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">All students present!</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;