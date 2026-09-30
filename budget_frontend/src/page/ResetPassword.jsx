import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token"); // ดึง token จาก URL query string
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      alert("ไม่พบ Token สำหรับรีเซ็ตรหัสผ่าน ลิงก์อาจไม่ถูกต้อง");
      return;
    }

    if (newPassword.length < 6) {
      alert("รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("รหัสผ่านใหม่และการยืนยันรหัสผ่านไม่ตรงกัน");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });

      const result = await res.json();

      if (res.ok) {
        alert("🎉 เปลี่ยนรหัสผ่านสำเร็จ! กรุณาล็อกอินด้วยรหัสผ่านใหม่");
        navigate("/login");
      } else {
        alert(`เกิดข้อผิดพลาด: ${result.message || "ไม่สามารถรีเซ็ตรหัสผ่านได้"}`);
      }
    } catch (err) {
      console.error("Reset Password Error:", err);
      alert("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div style={{ maxWidth: "400px", margin: "50px auto", textAlign: "center" }}>
        <h2>⛔ ลิงก์ไม่ถูกต้องหรือหมดอายุ</h2>
        <p>ไม่พบรหัสโทเคนสำหรับตั้งรหัสผ่านใหม่ กรุณากดขอลิงก์ใหม่อีกครั้ง</p>
        <button onClick={() => navigate("/forgot-password")}>ไปหน้าขอลิงก์รีเซ็ต</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", padding: "20px", border: "1px solid #ccc", borderRadius: "8px" }}>
      <h2>🔒 ตั้งรหัสผ่านใหม่</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>รหัสผ่านใหม่ (New Password)</label>
          <input
            type="password"
            required
            style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
            placeholder="อย่างน้อย 6 ตัวอักษร"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>ยืนยันรหัสผ่านใหม่ (Confirm Password)</label>
          <input
            type="password"
            required
            style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
            placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{ width: "100%", padding: "10px", backgroundColor: "#28a745", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}
        >
          {loading ? "⏳ กำลังบันทึก..." : "💾 บันทึกรหัสผ่านใหม่"}
        </button>
      </form>
    </div>
  );
}

export default ResetPassword;