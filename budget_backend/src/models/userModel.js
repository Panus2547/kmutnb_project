const pool = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const register = async ({
  username,
  email,
  password,
  phone,
  role
}) => {
  const result = await pool.query(
    `
    INSERT INTO "user" (
      username,
      email,
      password,
      phone,
      role
    )
    VALUES ($1, $2, $3, $4, $5)
    RETURNING
      user_id,
      username,
      email,
      phone,
      role
    `,
    [
      username,
      email,
      password,
      phone,
      role
    ]
  );

  return result.rows[0];
};

const login = async (email, password) => {
  // 1. ดึงข้อมูล user จาก Database (ต้อง SELECT password ออกมาด้วย!)
  const result = await pool.query(
    `
    SELECT
      user_id,
      username,
      email,
      password,
      phone,
      role
    FROM "user" 
    WHERE email = $1
    `,
    [email]
  );

  const user = result.rows[0];

  // ถ้าไม่เจอ user ให้ส่ง null หรือ throw error ออกไป
  if (!user) {
    return null;
  }

  // 2. ตรวจสอบรหัสผ่านผ่าน bcrypt
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return null;
  }

  // 3. สร้าง JWT Token
  const token = jwt.sign(
    {
      user_id: user.user_id,
      username: user.username,
      role: user.role
    },
    process.env.JWT_SECRET || "your_fallback_secret",
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "1d"
    }
  );

  // 4. ลบ password ออกจาก object ก่อนเพื่อความปลอดภัย
  delete user.password;

  // 5. return ข้อมูล token และ user ออกไปให้ Controller นำไปใช้ส่ง res.json
  return {
    token,
    user
  };
};

module.exports = {
  register,
  login
};
