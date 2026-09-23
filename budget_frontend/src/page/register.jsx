import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [customRole, setCustomRole] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    const finalRole = role === "other" ? customRole : role;

    try {
      const response = await fetch(`http://localhost:5000/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // 🟢 แก้เป็นแบบนี้ (ส่งค่า finalRole ไปในชื่อคีย์ role)
        body: JSON.stringify({ username, email, phone, password, role: finalRole }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ");
        navigate("/login"); // 🟢 เด้งกลับไปหน้า login เมื่อสมัครสำเร็จ
      } else {
        alert(data.message || "สมัครสมาชิกไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
      }
    } catch (error) {
      console.error("Error registering user:", error);
      alert("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>สมัครสมาชิก</h2>
      <form onSubmit={handleRegister}>
        <div>
          <label htmlFor="username">ชื่อผู้ใช้:</label>
          <input
            id="username"
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="email">อีเมล:</label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="phone">เบอร์โทรศัพท์:</label>
          <input
            id="phone"
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="password">รหัสผ่าน:</label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div>
        <label htmlFor="role">สิทธิ์ผู้ใช้:</label>
        <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
        >
            <option value="ภาควิชาครุศาสตร์เครื่องกล">ภาควิชาครุศาสตร์เครื่องกล</option>
            <option value="ภาควิชาครุศาสตร์ไฟฟ้า">ภาควิชาครุศาสตร์ไฟฟ้า</option>
            <option value="ภาควิชาครุศาสตร์โยธา">ภาควิชาครุศาสตร์โยธา</option>
            <option value="ภาควิชาคอมพิวเตอร์ศึกษา">ภาควิชาคอมพิวเตอร์ศึกษา</option>
            <option value="ภาควิชาครุศาสตร์เทคโนโลยีและสารสนเทศ">ภาควิชาครุศาสตร์เทคโนโลยีและสารสนเทศ</option>
            <option value="ภาควิชาบริหารเทคนิคศึกษา">ภาควิชาบริหารเทคนิคศึกษา</option>
            <option value="สำนักงานคณบดี">สำนักงานคณบดี</option>
            <option value="ศูนย์บูรณาการวิชาชีพครุศาสตร์อุตสาหกรรม">ศูนย์บูรณาการวิชาชีพครุศาสตร์อุตสาหกรรม</option>
            <option value="other">อื่นๆ (กรอกเอง)...</option>
        </select>

        {/* แสดงช่องกรอกเองเมื่อเลือก "other" */}
        {role === "other" && (
            <div style={{ marginTop: "8px" }}>
            <label htmlFor="customRole">ระบุหน่วยงาน/สิทธิ์:</label>
            <input
                id="customRole"
                type="text"
                placeholder="ระบุชื่อหน่วยงานเพิ่มเติม"
                required
                value={customRole}
                onChange={(e) => setCustomRole(e.target.value)}
            />
            </div>
        )}
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "กำลังสมัครสมาชิก..." : "สมัครสมาชิก"}
        </button>
        <button type="button" onClick={() => navigate("/login")}>
          กลับไปหน้าเข้าสู่ระบบ
        </button>
      </form>
    </div>
  );
}

export default Register;