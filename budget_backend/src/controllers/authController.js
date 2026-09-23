import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js"; // ⚠️ ต้องใส่ นามสกุลไฟล์ .js ด้วยเสมอใน ES Modules

export const register = async (req, res) => {
  try {
    const { username, email, password, phone, role } = req.body;

    if (!username || !email || !password || !phone || !role) {
      return res.status(400).json({
        message: "กรุณากรอกข้อมูลให้ครบ"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userModel.register({
      username,
      email,
      password: hashedPassword,
      phone,
      role
    });

    return res.status(201).json({
      message: "สมัครสมาชิกสำเร็จ",
      user
    });

  } catch (error) {
    console.error("Register Error:", error);

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: "อีเมลหรือชื่อผู้ใช้นี้ถูกใช้งานแล้ว" });
    }

    return res.status(500).json({
      message: "เกิดข้อผิดพลาดในการสมัครสมาชิก"
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "กรุณากรอกอีเมลและรหัสผ่าน"
      });
    }

    const result = await userModel.login(email, password);

    if (!result) {
      return res.status(401).json({
        message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง"
      });
    }

    res.cookie("token", result.token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000
    });

    res.cookie("user_info", JSON.stringify({
      username: result.user.username,
      role: result.user.role
    }), {
      httpOnly: false,
      secure: false,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000
    });

    return res.status(200).json({
      message: "เข้าสู่ระบบสำเร็จ",
      user: result.user
    });

  } catch (error) {
    console.error("Login Controller Error:", error);

    return res.status(500).json({
      message: "ไม่สามารถเข้าสู่ระบบได้"
    });
  }
};

export const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "lax",
  });

  res.clearCookie("user_info", {
    sameSite: "lax",
  });

  return res.status(200).json({ message: "ออกจากระบบสำเร็จ" });
};