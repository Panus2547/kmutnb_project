import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "../css/adminUser.css";

function AdminUserManagement() {
  const navigate = useNavigate();

  // 1. State รายชื่อผู้ใช้ทั้งหมด
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // 2. State สำหรับผู้ใช้งานที่กำลังเลือกแก้ไข
  const [selectedUser, setSelectedUser] = useState(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("user");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // State สำหรับตัวกรองรายชื่อผู้ใช้
  const [searchText, setSearchText] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [customRole, setCustomRole] = useState("");

  // 3. ดึงข้อมูลผู้ใช้ทั้งหมดเมื่อโหลดหน้า (GET /api/auth/users)
  const fetchUsers = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/users", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      const result = await res.json();

      if (res.ok && result.data) {
        setUsers(result.data);
      } else {
        alert(`เกิดข้อผิดพลาด: ${result.message || "ดึงข้อมูลไม่สำเร็จ"}`);
      }
    } catch (err) {
      console.error("Fetch users error:", err);
      alert("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 4. เลือกผู้ใช้ขึ้นมาแก้ไขในฟอร์ม
  const handleSelectUser = (userToEdit) => {
    setSelectedUser(userToEdit);
    setUsername(userToEdit.username || "");
    setEmail(userToEdit.email || "");
    setPhone(userToEdit.phone || "");
    setRole(userToEdit.role || "user");
  };

  // ลบผู้ใช้ (DELETE /api/auth/users/:id)
  const handleDeleteUser = async (userToDelete) => {
    const userId = userToDelete.user_id || userToDelete.id;

    const confirmed = window.confirm(
      `ต้องการลบผู้ใช้ "${userToDelete.username}" (ID: ${userId}) หรือไม่?\nการลบไม่สามารถย้อนกลับได้`
    );
    if (!confirmed) return;

    setDeletingId(userId);

    try {
      const res = await fetch(`http://localhost:5000/api/auth/users/${userId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      const result = await res.json().catch(() => ({}));

      if (res.ok) {
        alert("ลบผู้ใช้สำเร็จ!");

        // ถ้ากำลังแก้ไขผู้ใช้คนนี้อยู่ ให้ปิดฟอร์มแก้ไข
        if (selectedUser && (selectedUser.user_id || selectedUser.id) === userId) {
          handleCancelEdit();
        }
        fetchUsers();
      } else {
        alert(`เกิดข้อผิดพลาด: ${result.message || "ไม่สามารถลบผู้ใช้ได้"}`);
      }
    } catch (err) {
      console.error("Delete user error:", err);
      alert("ไม่สามารถลบผู้ใช้ได้");
    } finally {
      setDeletingId(null);
    }
  };

  // ยกเลิกการแก้ไข
  const handleCancelEdit = () => {
    setSelectedUser(null);
    setUsername("");
    setEmail("");
    setPhone("");
    setRole("user");
  };

  // 5. ส่งข้อมูลอัปเดตกลับไปที่ Backend (PUT /api/auth/users/:id)
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!selectedUser) return;

    if (!username.trim() || !email.trim()) {
      alert("กรุณากรอกชื่อผู้ใช้และอีเมลให้ครบถ้วน");
      return;
    }

    setSaving(true);

    try {
      const userId = selectedUser.user_id || selectedUser.id;
      const payload = { username, email, phone, role };

      const res = await fetch(`http://localhost:5000/api/auth/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (res.ok) {
        alert("บันทึกการแก้ไขสำเร็จ!");
        handleCancelEdit();
        fetchUsers(); // รีโหลดตารางให้แสดงข้อมูลล่าสุด
      } else {
        alert(`เกิดข้อผิดพลาด: ${result.message || "ไม่สามารถอัปเดตได้"}`);
      }
    } catch (err) {
      console.error("Update user error:", err);
      alert("ไม่สามารถบันทึกข้อมูลได้");
    } finally {
      setSaving(false);
    }
  };

  // กรองรายชื่อผู้ใช้ตามคำค้นหา (ID / Username / Email / Phone) และ Role
  const filteredUsers = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();

    return users.filter((u) => {
      const userRole = String(u.role || "").toLowerCase();
      const roleKeyword = customRole.trim().toLowerCase();

      let matchRole = true;
      if (roleFilter === "user" || roleFilter === "admin") {
        matchRole = userRole === roleFilter;
      } else if (roleFilter === "other") {
        // พิมพ์คำค้นหา Role เอง ถ้าไม่พิมพ์ = แสดง Role ที่ไม่ใช่ user/admin
        matchRole = roleKeyword
          ? userRole.includes(roleKeyword)
          : userRole !== "user" && userRole !== "admin";
      }

      const matchText =
        !keyword ||
        [u.user_id || u.id, u.username, u.email, u.phone]
          .filter((v) => v !== null && v !== undefined)
          .some((v) => String(v).toLowerCase().includes(keyword));

      return matchRole && matchText;
    });
  }, [users, searchText, roleFilter, customRole]);

  const hasActiveFilter =
    searchText.trim() !== "" || roleFilter !== "all" || customRole.trim() !== "";

  const handleResetFilter = () => {
    setSearchText("");
    setRoleFilter("all");
    setCustomRole("");
  };

  if (loading) {
    return (
      <div className="admin-page admin-page--loading">
        <p>กำลังโหลดข้อมูลผู้ใช้...</p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="admin-header">
        <button className="btn btn-secondary" type="button" onClick={() => navigate("/dashboard")}>
          ← กลับหน้า Dashboard
        </button>
        <h2>👥 จัดการผู้ใช้งานระบบ</h2>
      </div>

      {/* ส่วนฟอร์มแก้ไข (แสดงเมื่อมีการเลือก User เท่านั้น) */}
      {selectedUser && (
        <div className="admin-card">
          <h3 className="admin-card__title">
            🛠️ แก้ไขข้อมูลผู้ใช้ (ID: {selectedUser.user_id || selectedUser.id})
          </h3>
          <form className="admin-form" onSubmit={handleSubmit}>
            <div className="admin-field">
              <label>
                ชื่อผู้ใช้ (Username) <span className="required">*</span>
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="กรอกชื่อผู้ใช้"
              />
            </div>

            <div className="admin-field">
              <label>
                อีเมล (Email) <span className="required">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@domain.com"
              />
            </div>

            <div className="admin-field">
              <label>เบอร์โทรศัพท์ (Phone)</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="08X-XXX-XXXX"
              />
            </div>

            <div className="admin-field">
              <label>สิทธิ์การใช้งาน (Role)</label>
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="user">👤 User (ผู้ใช้งานทั่วไป)</option>
                <option value="admin">🔑 Admin (ผู้ดูแลระบบ)</option>
              </select>
            </div>

            <div className="admin-actions">
              <button className="btn btn-secondary" type="button" onClick={handleCancelEdit} disabled={saving}>
                ยกเลิก
              </button>
              <button className="btn btn-primary" type="submit" disabled={saving}>
                {saving ? "⏳ กำลังบันทึก..." : "💾 บันทึกการแก้ไข"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ส่วนตารางแสดงรายชื่อผู้ใช้ทั้งหมด */}
      <div className="admin-card">
        <h3 className="admin-card__title">
          📋 รายชื่อผู้ใช้งาน ({filteredUsers.length}
          {hasActiveFilter ? ` จาก ${users.length}` : ""} คน)
        </h3>

        {/* ตัวกรองผู้ใช้ */}
        <div className="admin-filter">
          <div className="admin-field admin-filter__search">
            <label>ค้นหา</label>
            <input
              type="search"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="ค้นหาจาก ID, ชื่อผู้ใช้, อีเมล หรือเบอร์โทร"
            />
          </div>

          <div className="admin-field">
            <label>สิทธิ์การใช้งาน</label>
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                if (e.target.value !== "other") setCustomRole("");
              }}
            >
              <option value="all">ทั้งหมด</option>
              <option value="user">👤 User</option>
              <option value="admin">🔑 Admin</option>
              <option value="other">✏️ อื่นๆ (พิมพ์ค้นหา)</option>
            </select>
          </div>

          {roleFilter === "other" && (
            <div className="admin-field">
              <label>พิมพ์สิทธิ์ที่ต้องการค้นหา</label>
              <input
                type="text"
                value={customRole}
                onChange={(e) => setCustomRole(e.target.value)}
                placeholder="เช่น staff, manager"
              />
            </div>
          )}

          <button
            className="btn btn-secondary"
            type="button"
            onClick={handleResetFilter}
            disabled={!hasActiveFilter}
          >
            ล้างตัวกรอง
          </button>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.user_id || user.id}>
                    <td>{user.user_id || user.id}</td>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td>{user.phone || "-"}</td>
                    <td>
                      <span className={`role-badge ${user.role === "admin" ? "role-badge--admin" : "role-badge--user"}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-edit"
                        type="button"
                        onClick={() => handleSelectUser(user)}
                      >
                        ✏️ แก้ไข
                      </button>{" "}
                      
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="admin-table__empty">
                    {hasActiveFilter ? "ไม่พบผู้ใช้งานที่ตรงกับตัวกรอง" : "ไม่พบข้อมูลผู้ใช้งาน"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminUserManagement;