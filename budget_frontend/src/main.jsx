import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./app"; // 🟢 แก้จาก pp เป็น App และใช้ ./app ตัวพิมพ์เล็กตามชื่อไฟล์จริง

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);