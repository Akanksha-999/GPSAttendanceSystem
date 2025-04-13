import React, { useState } from "react";
import axios from "axios";

const AdminDashboard = () => {
  const [report, setReport] = useState(null);
  const [date, setDate] = useState("");

  const fetchReport = async () => {
    try {
       // Ensure valid date format
    const isoDate = new Date(date).toISOString().split('T')[0];
    console.log("Validated date:", isoDate);

      // console.log("Fetching report for date:", date);
      const res = await axios.get(`http://localhost:5000/api/attendance/daily-report?date=${isoDate}`);
      setReport(res.data);
    } catch (err) {
      console.error("Error fetching report", err);
      setReport(null);
    alert(err.response?.data?.msg || "Error fetching report");
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Admin Attendance Dashboard</h1>
      <input
        type="date"
        value={date}
        onChange={e => setDate(e.target.value)}
        className="p-2 border rounded"
      />
      <button onClick={fetchReport} className="ml-2 px-4 py-2 bg-blue-600 text-white rounded">View Report</button>

      {report && (
        <div className="mt-6 space-y-4">
          <div className="text-lg font-semibold">Summary for {report.date}</div>
          <ul className="list-disc pl-6">
            <li>Total Students: {report.total}</li>
            <li>Present: {report.present}</li>
            <li>Absent: {report.absent}</li>
          </ul>

          <div>
            <h2 className="text-xl font-semibold mt-4">Present Students</h2>
            <ul className="pl-4">
              {report.presentUsers.map(user => (
                <li key={user.email}>{user.name} ({user.email})</li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold mt-4">Absent Students</h2>
            <ul className="pl-4">
              {report.absentUsers.map(user => (
                <li key={user.email}>{user.name} ({user.email})</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
