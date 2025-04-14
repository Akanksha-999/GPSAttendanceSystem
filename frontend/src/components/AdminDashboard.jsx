import React, { useState } from "react";
import axios from "axios";

const AdminDashboard = () => {
  const [report, setReport] = useState(null);
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const isoDate = new Date(date).toISOString().split('T')[0];
      const res = await axios.get(`http://localhost:5000/api/attendance/daily-report?date=${isoDate}`);
      
      // Transform data with safe defaults
      const transformedData = {
        ...res.data,
        presentUsers: res.data.presentStudents || [],
        absentUsers: res.data.absentStudents || []
      };

      setReport(transformedData);
    } catch (err) {
      console.error("Error fetching report", err);
      alert(err.response?.data?.msg || "Error fetching report");
      setReport(null);
    } finally {
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
        />
        <button 
          onClick={fetchReport} 
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
          disabled={loading || !date}
        >
          {loading ? "Loading..." : "View Report"}
        </button>
      </div>

      {report && (
        // <div className="mt-6 space-y-4">
        <div className="bg-yellow-200 hover:shadow-lg p-6 flex flex-col gap-x-6 items-start justify-center rounded-xl space-y-4 cursor-pointer transition duration-300 ease-in-out w-full max-w-xl mx-auto">

      <h2 className="text-blue-900 font-bold text-xl text-center">
       Attendance Report for {report.date}
      </h2>
  
    <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
    <button className="bg-white text-blue-900 font-bold py-2 px-4 rounded-lg shadow-md w-full sm:w-auto">
      Total Students: {report.total}
    </button>
    <button className="bg-green-100 text-green-800 font-bold py-2 px-4 rounded-lg shadow-md w-full sm:w-auto">
      Present: {report.present}
    </button>
    <button className="bg-red-100 text-red-800 font-bold py-2 px-4 rounded-lg shadow-md w-full sm:w-auto">
      Absent: {report.absent}
    </button>
  </div>


{/* <div>
<h2 className="text-xl font-bold mt-4">Present Students</h2>
  <ul className="pl-4">
    {(report.presentUsers || []).map(user => (
      <li key={user.userId?._id || user._id} className="mb-2">
        <div className="font-medium">
          {user.userId?.name || user.name} ({user.userId?.email || user.email})
        </div>
        <div className="text-sm text-gray-600">
          Marked at: {new Date(user.timestamp).toLocaleString()}
        </div>
      </li>
    ))}

      {report.presentUsers?.length === 0 && (
      <li className="text-gray-500">No present students for this date</li>
      )}
        </ul>
        </div>

          <div>
            <h2 className="text-xl font-bold mt-4">Absent Students</h2>
            <ul className="pl-4">
              {(report.absentUsers || []).map(user => (
                <li key={user._id}>
                  {user.name} ({user.email})
                </li>
              ))}
              {report.absentUsers?.length === 0 && (
                <li className="text-gray-500">No absent students for this date</li>
              )}
            </ul>
          </div>
        
      */}

<div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
  {/* Present Students */}
  <div className="bg-yellow-100 p-4 rounded-xl shadow-md w-full">
    <h2 className="text-2xl font-bold text-black mb-3 text-center">
      Present Students
    </h2>
    <div className="max-h-72 overflow-y-auto bg-white rounded-lg border border-gray-300 p-3">
      <ul className="space-y-3">
        {(report.presentUsers || []).map((user) => (
          <li key={user.userId?._id || user._id} className="border-b pb-2">
            <div className="font-semibold text-blue-900">
              {user.userId?.name || user.name} ({user.userId?.email || user.email})
            </div>
            <div className="text-sm text-gray-600">
              Marked at: {new Date(user.timestamp).toLocaleString()}
            </div>
          </li>
        ))}
        {report.presentUsers?.length === 0 && (
          <li className="text-gray-500">No present students for this date</li>
        )}
      </ul>
    </div>
  </div>

  {/* Absent Students */}
  <div className="bg-red-100 p-4 rounded-xl shadow-md w-full">
    <h2 className="text-2xl font-bold text-black mb-3 text-center">
      Absent Students
    </h2>
    <div className="max-h-72 overflow-y-auto bg-white rounded-lg border border-gray-300 p-3">
      <ul className="space-y-3 font-semibold text-red-900">
        {(report.absentUsers || []).map((user) => (
          <li key={user._id} className="border-b pb-2">
            {user.name} ({user.email})
          </li>
        ))}
        {report.absentUsers?.length === 0 && (
          <li className="text-gray-500 font-normal">
            No absent students for this date
          </li>
        )}
      </ul>
    </div>
  </div>
</div>




     </div>
      )}
    </div>
  );
};

export default AdminDashboard;