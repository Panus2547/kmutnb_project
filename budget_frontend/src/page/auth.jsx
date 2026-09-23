import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/Auth.css"; // 🟢 Import CSS จากโฟลเดอร์ css

// ดึง API URL จาก Env ของ Vite ถ้าไม่มีให้ชี้ไปที่ Render
const API_BASE_URL = import.meta.env.VITE_API_URL || "https://spms-backend-ry26.onrender.com";

function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setEmail("");
        setPassword("");
        alert("ล็อกอินสำเร็จ");
        
        navigate("/dashboard", { replace: true });
      } else {
        alert(data.message || "ล็อกอินไม่สำเร็จ");
      }
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการเชื่อมต่อ:", error);
      alert("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>📊 ระบบจัดการแผนงาน</h2>
          <p>เข้าสู่ระบบเพื่อใช้งาน Dashboard</p>
        </div>

        <form onSubmit={handleLogin} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">อีเมล</label>
            <input
              id="email"
              type="email"
              required
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">รหัสผ่าน</label>
            <input
              id="password"
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="auth-actions">
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? "กำลังเข้าสู่ระบบ..." : "🔑 เข้าสู่ระบบ"}
            </button>
            <button
              type="button"
              className="btn-register-link"
              onClick={() => navigate("/register")}
            >
              สมัครสมาชิกใหม่
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Auth;