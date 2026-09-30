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

const getUser = async () => {
  try {
    const result = await pool.query(`
      SELECT 
        user_id, 
        username, 
        email,
        phone, 
        role
      FROM public.user
      ORDER BY user_id ASC
    `);
    
    return result.rows;
  } catch (error) {
    console.error("Database query error (getUser):", error);
    throw error;
  }
};

const editUser = async (userId, username, email, phone, role) => {
  try {
    const result = await pool.query(
      `
      UPDATE public.user
      SET 
        username = $1,
        email = $2,
        phone = $3,
        role = $4
      WHERE user_id = $5
      RETURNING *;
      `,
      [username, email, phone, role, userId]
    );

    return result.rows[0]; // ส่งคืนข้อมูล user ที่แก้ไขเรียบร้อยแล้ว
  } catch (error) {
    console.error("Error in editUser:", error);
    throw error;
  }
};

const saveResetToken = async (email, token, expires) => {
  const result = await pool.query(
    `UPDATE "user" 
     SET reset_token = $1, reset_token_expires = $2 
     WHERE email = $3 
     RETURNING user_id, email`,
    [token, expires, email]
  );
  return result.rows[0];
};

// ค้นหาผู้ใช้จาก Reset Token และเช็คว่ายังไม่หมดอายุ
const findUserByResetToken = async (token) => {
  const result = await pool.query(
    `SELECT * FROM "user" 
     WHERE reset_token = $1 AND reset_token_expires > NOW()`,
    [token]
  );
  return result.rows[0];
};

// อัปเดตรหัสผ่านใหม่ + ล้าง Token ออก
const updatePassword = async (userId, hashedPassword) => {
  await pool.query(
    `UPDATE "user" 
     SET password = $1, reset_token = NULL, reset_token_expires = NULL 
     WHERE user_id = $2`,
    [hashedPassword, userId]
  );
};



module.exports = {
  register,
  login,
  getUser,
  editUser,
  findUserByResetToken,
  updatePassword,
  saveResetToken,

};
