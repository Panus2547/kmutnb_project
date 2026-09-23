// logout.js
export const handleLogout = async () => {
  try {
    // 1. ยิง API บอก Express ให้ลบ Cookie HttpOnly token และ user_info
    await fetch(`http://localhost:5000/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
  } catch (error) {
    console.error("Logout API Error:", error);
  } finally {
    // 2. เคลียร์ Cookie ฝั่ง Client ทันทีเพื่อความปลอดภัย
    document.cookie = "user_info=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

    // 🟢 3. เด้งกลับไปหน้า Login และล้าง Memory/State ที่ค้างในระบบ
    window.location.href = "/";
  }
};