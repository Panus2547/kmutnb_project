import { Routes, Route } from "react-router-dom";
import Auth from "./page/auth";
import Dashboard from "./page/dashboard";
import Register from "./page/register";

function App() {
  return (
    <Routes>
      {/* หน้าแรกเปิดมาเจอหน้า Login ทันที */}
      <Route path="/" element={<Auth />} />
      <Route path="/login" element={<Auth />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  );
}

export default App;