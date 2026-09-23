const express = require("express");
const cors = require("cors");
const pool = require("./db");
const planRoutes = require("./routes/planRoutes");
const authRoutes = require("./routes/authRoutes");
const cookieParser = require("cookie-parser");

const app = express();
const PORT = process.env.PORT || 5000;

// กำหนด Origin ให้รองรับทั้ง Localhost และ Vercel
const allowedOrigins = [
  "http://localhost:5173",
  "https://kmutnb-project.vercel.app",
  process.env.FRONTEND_URL // เผื่อดึงจาก Environment Variable บน Render
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // อนุญาตหากไม่มี origin (เช่น Postman/mobile apps) หรืออยู่ในรายการที่กำหนด
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // หรือเปลี่ยนเป็น true ทั้งหมดในกรณีทดสอบ
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(cookieParser());

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
  console.log(`Server running on port ${PORT}`);
});