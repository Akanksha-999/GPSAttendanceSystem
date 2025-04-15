import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import Attendance from "./components/Attendance";
import AdminDashboard from "./components/AdminDashboard";
import Login from "./components/Login";
import ProtectedRoute from "./routes/ProtectedRoute";
import Register from "./components/Register";
import AdminControls from './components/AdminControls';
import "./components/leaflet.css";
import MapDisplay from './components/MapDisplay';


function App() {
  const { auth, logout } = useContext(AuthContext);

  return (
    <div className="p-6">
      {/* Navbar */}
      <nav className="flex justify-between items-center p-4  rounded-lg" style={{ backgroundColor: "rgb(82, 164, 183)" }}>
        {/* Logo or Title */}
        <div className="bg-blue-100 hover:shadow-lg p-6 flex flex-col items-center justify-center rounded-xl cursor-pointer transition duration-300 ease-in-out w-64">
          <h1 className="text-black-800 font-bold text-xl text-center whitespace-nowrap">
            GPS Attendance System
          </h1>
        </div>
         
        {/* Buttons Section */}
        <div className="flex gap-4 items-center">
          {/* Student: Big Attendance Button */}
          {auth.token && auth.role === "student" && (
            <Link
              to="/"
              className="bg-blue-100 hover:shadow-lg p-6 flex flex-col items-center space-y-2 rounded-2xl cursor-pointer transition duration-300 ease-in-out w-40"
            >
              <span className="text-blue-600 font-bold text-lg">
                Attendance
              </span>
            </Link>
          )}

          {/* Admin: Dashboard & Controls */}
          {auth.token && auth.role === "admin" && (
            <>
              <Link
                to="/admin"
                className="bg-blue-100 hover:shadow-md p-6 flex flex-col items-center space-y-2 rounded-2xl cursor-pointer transition duration-300 ease-in-out"
              >
                <span className="text-blue-600 font-bold text-lg">
                  Dashboard
                </span>
              </Link>

              <Link
                to="/admin/controls"
                className="bg-blue-100 hover:shadow-md p-6 flex flex-col items-center space-y-2 rounded-2xl cursor-pointer transition duration-300 ease-in-out"
              >
                <span className="text-blue-600 font-bold text-lg">
                  Student Controls
                </span>
              </Link>
            </>
          )}

          {/* Auth: Login or Logout */}
          {!auth.token ? (
            <Link
              to="/login"
              className="bg-blue-100 hover:shadow-md p-6 flex flex-col items-center space-y-2 rounded-2xl cursor-pointer transition duration-300 ease-in-out"
            >
              <span className="text-blue-600 font-bold text-lg">
                Login
              </span>
            </Link>
          ) : (
            <button
              onClick={logout}
              className="bg-red-100 hover:shadow-md p-6 flex flex-col items-center space-y-2 rounded-2xl cursor-pointer transition duration-300 ease-in-out"
            >
              <span className="text-red-500 font-bold text-lg">
                Logout
              </span>
            </button>
          )}
        </div>
      </nav>

      {/* ROUTES */}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <Attendance />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/controls"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminControls />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
