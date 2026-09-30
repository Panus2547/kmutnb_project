const express = require("express");
const router = express.Router();
const {
  register,
  login,
  logout,
  getAllUser,
  updateUser,
  requestPasswordReset, // 🟢 ดึงเข้ามาใช้งาน
  resetPassword,
} = require("../controllers/authController");

// Authentication Routes
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

// User Management Routes
router.get("/users", getAllUser); // 🟢 เปลี่ยนจาก "/" เป็น "/users" ให้ตรงกับ Frontend
router.put("/users/:id", updateUser);


// Password Recovery Routes
router.post("/forgot-password", requestPasswordReset);
router.post("/reset-password", resetPassword);


module.exports = router;