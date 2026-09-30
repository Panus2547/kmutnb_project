const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

// 1. Register
const register = async (req, res) => {
  try {
    const { username, email, password, phone, role } = req.body;

    if (!username || !email || !password || !phone || !role) {
      return res.status(400).json({ message: "กรุณากรอกข้อมูลให้ครบ" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await userModel.register({
      username,
      email,
      password: hashedPassword,
      phone,
      role,
    });

    return res.status(201).json({ message: "สมัครสมาชิกสำเร็จ", user });
  } catch (error) {
    console.error("Register Error:", error);
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ message: "อีเมลหรือชื่อผู้ใช้นี้ถูกใช้งานแล้ว" });
    }
    return res.status(500).json({ message: "เกิดข้อผิดพลาดในการสมัครสมาชิก" });
  }
};

// 2. Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "กรุณากรอกอีเมลและรหัสผ่าน" });
    }

    const result = await userModel.login(email, password);
    if (!result) {
      return res.status(401).json({ message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" });
    }

    res.cookie("token", result.token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.cookie(
      "user_info",
      JSON.stringify({
        username: result.user.username,
        role: result.user.role,
      }),
      {
        httpOnly: false,
        secure: false,
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000,
      }
    );

    return res.status(200).json({ message: "เข้าสู่ระบบสำเร็จ", user: result.user });
  } catch (error) {
    console.error("Login Controller Error:", error);
    return res.status(500).json({ message: "ไม่สามารถเข้าสู่ระบบได้" });
  }
};

// 3. Logout
const logout = (req, res) => {
  res.clearCookie("token", { httpOnly: true, sameSite: "lax" });
  res.clearCookie("user_info", { sameSite: "lax" });
  return res.status(200).json({ message: "ออกจากระบบสำเร็จ" });
};

// 4. Get All Users
const getAllUser = async (req, res) => {
  try {
    const users = await userModel.getUser();
    return res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("Error in getAllUser:", error);
    return res.status(500).json({
      success: false,
      message: "ไม่สามารถดึงข้อมูลผู้ใช้งานได้",
      error: error.message,
    });
  }
};

// 5. Update User
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, phone, role } = req.body;

    if (!id) {
      return res.status(400).json({ success: false, message: "ระบุ ID ของผู้ใช้งานที่ต้องการแก้ไข" });
    }

    if (!username || !email) {
      return res.status(400).json({ success: false, message: "กรุณากรอกข้อมูล Username และ Email ให้ครบถ้วน" });
    }

    const updatedUser = await userModel.editUser(id, username, email, phone, role);

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "ไม่พบข้อมูลผู้ใช้งานที่ต้องการแก้ไข" });
    }

    return res.status(200).json({
      success: true,
      message: "อัปเดตข้อมูลผู้ใช้งานสำเร็จ",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Error in updateUser:", error);
    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการอัปเดตข้อมูลผู้ใช้งาน",
      error: error.message,
    });
  }
};

const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "กรุณากรอกอีเมล" });
    }

    // สร้าง Token สุ่ม 32 ตัวอักษร
    const resetToken = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 15 * 60 * 1000); // หมดอายุใน 15 นาที

    const user = await userModel.saveResetToken(email, resetToken, expires);

    // ป้องกัน Enumeration Attack: แม้ไม่พบอีเมลใน DB ก็ควรตอบกลับว่าส่งแล้วเพื่อความปลอดภัย
    if (!user) {
      return res.status(200).json({ message: "หากอีเมลนี้อยู่ในระบบ เราได้ส่งลิงก์รีเซ็ตรหัสผ่านให้แล้ว" });
    }

    // ตั้งค่า Nodemailer (ใช้อีเมลสำหรับส่ง เช่น Gmail App Password)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // อีเมลระบบ
        pass: process.env.EMAIL_PASS, // App Password จาก Google
      },
    });

    const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password?token=${resetToken}`;

    await transporter.sendMail({
      from: '"Budget App" <no-reply@budgetapp.com>',
      to: email,
      subject: "รีเซ็ตรหัสผ่านของคุณ",
      html: `<p>คุณได้ร้องขอการรีเซ็ตรหัสผ่าน กรุณาคลิกลิงก์ด้านล่างเพื่อตั้งรหัสผ่านใหม่ (ลิงก์มีอายุ 15 นาที):</p>
             <a href="${resetUrl}">${resetUrl}</a>`,
    });

    return res.status(200).json({ message: "ส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมลของคุณเรียบร้อยแล้ว" });
 } catch (error) {
  console.error("FULL EMAIL ERROR:", error); // 👈 ปริ้นท์ error ตัวเต็มออกมาดูใน Terminal
  return res.status(500).json({ 
    message: "เกิดข้อผิดพลาดในการส่งอีเมล", 
    error: error.message // ส่ง error.message กลับมาดูชั่วคราวได้ด้วยครับ
  });
}
};

// 2. Reset Password ใหม่
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: "ข้อมูลไม่ครบถ้วน" });
    }

    const user = await userModel.findUserByResetToken(token);
    if (!user) {
      return res.status(400).json({ message: "ลิงก์นี้หมดอายุหรือใช้งานไม่ได้แล้ว" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await userModel.updatePassword(user.user_id, hashedPassword);

    return res.status(200).json({ message: "เปลี่ยนรหัสผ่านสำเร็จแล้ว สามารถเข้าสู่ระบบด้วยรหัสผ่านใหม่ได้ทันที" });
  } catch (error) {
    console.error("Reset Password Error:", error);
    return res.status(500).json({ message: "ไม่สามารถรีเซ็ตรหัสผ่านได้" });
  }
};


module.exports = {
  register,
  login,
  logout,
  getAllUser,
  updateUser,
  requestPasswordReset,
  resetPassword,
  
};