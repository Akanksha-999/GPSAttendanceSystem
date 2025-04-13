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

function App() {
  const { auth, logout } = useContext(AuthContext);
  return (
    
    <div className="p-6">
      {/* Navbar */}
      <nav className="flex justify-between items-center p-4 bg-gray-100 rounded-lg">
        <h1 className="text-2xl font-bold">GPS Attendance System</h1>
        <div className="space-x-4">
          {auth.token && auth.role === "student" && (
            <Link to="/" className="text-blue-600 font-semibold">Attendance</Link>
          )}
          {auth.token && auth.role === "admin" && (
            <>
            <Link to="/admin" className="text-blue-600 font-semibold">Dashboard</Link>
            <Link to="/admin/controls" className="text-blue-600 font-semibold">Student Controls</Link>
            </>
          )}
          {!auth.token ? (
            <Link to="/login" className="text-blue-600 font-semibold">Login</Link>
          ) : (
            <button onClick={logout} className="text-red-500 font-semibold">Logout</button>
          )}
        </div>
      </nav>
{/*ROUTES*/}
       <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={ <Register/> } />
    
        <Route path="/" element={
          <ProtectedRoute allowedRoles={["student"]}>
            <Attendance />
          </ProtectedRoute>
        } />

        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
       
        <Route path="/admin/controls" 
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminControls />
          </ProtectedRoute>} 
      />
      
      </Routes>
    </div>
  );
}

export default App;
