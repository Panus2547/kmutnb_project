const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  // 1. อ่าน Token จาก Cookie เป็นลำดับแรก (หากไม่มีให้ถอยไปอ่านจาก Header)
  const token =
    req.cookies?.token ||
    (req.headers["authorization"] && req.headers["authorization"].split(" ")[1]);

  // 2. ตรวจสอบว่ามี Token หรือไม่
  if (!token) {
    return res.status(401).json({
      message: "ไม่พบ Token ยืนยันตัวตน",
    });
  }

  try {
    // 3. ยืนยันความถูกต้องของ Token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your_fallback_secret_key"
    );

    // 4. ฝังข้อมูล user ลงใน request
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({
      message: "Token ไม่ถูกต้องหรือหมดอายุแล้ว",
    });
  }
};

module.exports = verifyToken;