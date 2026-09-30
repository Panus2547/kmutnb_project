import { useState } from "react";
import { useNavigate } from "react-router-dom";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      alert("กรุณากรอกอีเมล");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("http://localhost:5000/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const result = await res.json();

      if (res.ok) {
        setMessage(result.message || "ส่งลิงก์รีเซ็ตรหัสผ่านเรียบร้อยแล้ว กรุณาเช็คอีเมลของคุณ");
      } else {
        alert(result.message || "เกิดข้อผิดพลาดในการส่งข้อมูล");
      }
    } catch (err) {
      console.error("Forgot Password Error:", err);
      alert("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", padding: "20px", border: "1px solid #ccc", borderRadius: "8px" }}>
      <h2>🔑 ลืมรหัสผ่าน</h2>
      <p style={{ fontSize: "0.9rem", color: "#666" }}>
        กรอกอีเมลที่คุณใช้ลงทะเบียน เราจะส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ไปให้ทางอีเมล
      </p>

      {message ? (
        <div style={{ padding: "12px", backgroundColor: "#e8f5e9", color: "#2e7d32", borderRadius: "4px", marginBottom: "15px" }}>
          {message}
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px" }}>อีเมล (Email)</label>
            <input
              type="email"
              required
              style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
              placeholder="example@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ width: "100%", padding: "10px", backgroundColor: "#007bff", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}
          >
            {loading ? "⏳ กำลังส่งข้อมูล..." : "✉️ ส่งลิงก์รีเซ็ตรหัสผ่าน"}
          </button>
        </form>
      )}

      <div style={{ marginTop: "15px", textAlign: "center" }}>
        <button
          type="button"
          onClick={() => navigate("/login")}
          style={{ background: "none", border: "none", color: "#007bff", cursor: "pointer" }}
        >
          ← กลับไปหน้าเข้าสู่ระบบ
        </button>
      </div>
    </div>
  );
}

export default ForgotPassword;