import { BrowserRouter, Routes, Route } from "react-router-dom";
import Auth from "./page/auth";
import Dashboard from "./page/dashboard";
import Register from "./page/register";
import AdminEditUser from "./page/AdminEditUser";
import ForgotPassword from "./page/ForgotPassword";
import ResetPassword from "./page/ResetPassword";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Auth />} />
      <Route path="/login" element={<Auth />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/register" element={<Register />} />

      {/* 🟢 รองรับทั้งทางเข้าหลัก และแบบมี ID */}
      <Route path="/admin/users" element={<AdminEditUser />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      
    </Routes>
  );
}

export default App;