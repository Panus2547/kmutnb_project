const express = require("express");
const cors = require("cors"); // 1. Import cors เข้ามา
const pool = require("./db");
const planRoutes = require("./routes/planRoutes");
const authRoutes = require("./routes/authRoutes");
const cookieParser = require("cookie-parser"); // 1. Import cookie-parser เข้ามา

const app = express();
const PORT = process.env.PORT || 5000;

// 2. ตั้งค่า CORS (ต้องวางไว้ก่อน express.json และ Route ทั้งหมด!)
app.use(
  cors({
    origin: "http://localhost:5173", // URL ของ Frontend Vite (ห้ามมี / ปิดท้าย)
    credentials: true,               // ⭐ สำคัญมาก! อนุญาตให้รับ-ส่ง HttpOnly Cookie
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(cookieParser()); // 2. ใช้งาน cookie-parser เพื่ออ่าน Cookie จาก Request

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/plans", planRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to the Budget Management API");
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});