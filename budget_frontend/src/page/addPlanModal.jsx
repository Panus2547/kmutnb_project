import { useState } from "react";

function AddPlanModal({ isOpen, onClose, onSuccess }) {
    const [planName, setPlanName] = useState("");
  const [status, setStatus] = useState("กำลังดำเนินงาน");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [performance, setPerformance] = useState("");
  const [issues, setIssues] = useState("");
  const [loading, setLoading] = useState(false);

  // 🟢 1. State รูปแบบ Array สำหรับ KPIs
  const [kpis, setKpis] = useState([
    { kpi: "", unit: "", target: "", results: "", process: true }
  ]);

  // 🟢 2. State รูปแบบ Array สำหรับ Budgets (รองรับหลายแหล่งเงิน)
  const [budgets, setBudgets] = useState([
    { budget_source: "", other_source: "", allocated_amount: "", actual_amount: "" }
  ]);

  if (!isOpen) return null;

  // ---จัดการ KPIs--- (แก้เป็น immutable update ป้องกัน bug ที่มิวเทต object เดิมตรง ๆ)
  const handleKpiChange = (index, field, value) => {
    setKpis((prev) =>
      prev.map((k, i) => (i === index ? { ...k, [field]: value } : k))
    );
  };

  const addKpiRow = () => {
    setKpis((prev) => [
      ...prev,
      { kpi: "", unit: "", target: "", results: "", process: true },
    ]);
  };

  const removeKpiRow = (index) => {
    if (kpis.length > 1) {
      setKpis((prev) => prev.filter((_, i) => i !== index));
    }
  };

  // ---จัดการ Budgets--- (แก้เป็น immutable update เช่นเดียวกัน)
  const handleBudgetChange = (index, field, value) => {
    setBudgets((prev) =>
      prev.map((b, i) => (i === index ? { ...b, [field]: value } : b))
    );
  };

  const addBudgetRow = () => {
    setBudgets((prev) => [
      ...prev,
      { budget_source: "", other_source: "", allocated_amount: "", actual_amount: "" },
    ]);
  };

  const removeBudgetRow = (index) => {
    if (budgets.length > 1) {
      setBudgets((prev) => prev.filter((_, i) => i !== index));
    }
  };

  // 🟢 ฟังก์ชันสำหรับเคลียร์ค่าในฟอร์มทั้งหมด
  const resetForm = () => {
    setPlanName("");
    setStatus("กำลังดำเนินงาน");
    setStartAt("");
    setEndAt("");
    setPerformance("");
    setIssues(""); // ✅ แก้จาก setProblems (ไม่มีอยู่จริง → ทำให้ resetForm throw error ทุกครั้งที่บันทึกสำเร็จ)

    // รีเซ็ต Array กลับเป็นค่าเริ่มต้น 1 แถวว่าง
    setKpis([
      { kpi: "", unit: "", target: "", results: "", process: true }
    ]);
    setBudgets([
      { budget_source: "", other_source: "", allocated_amount: "", actual_amount: "" }
    ]);
  };

  // ---Submit ข้อมูลเข้า Backend---
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!planName.trim()) {
      alert("กรุณากรอกชื่อโครงการ");
      return;
    }

    setLoading(true);

    // 🟢 กรองเอาเฉพาะรายการงบประมาณที่มีการเลือกแหล่งเงินแล้วเท่านั้น
    const validBudgets = budgets
      .filter((b) => b.budget_source.trim() !== "")
      .map((b) => ({
        budget_source: b.budget_source === "อื่นๆ" ? (b.other_source || "อื่นๆ") : b.budget_source,
        allocated_amount: b.allocated_amount ? Number(b.allocated_amount) : 0,
        actual_amount: b.actual_amount ? Number(b.actual_amount) : 0,
      }));

    // 🟢 กรองเอาเฉพาะ KPI ที่กรอกชื่อตัวชี้วัดแล้วเท่านั้น (เดิมไม่มี filter ทำให้แถวว่างถูกส่งไปด้วย)
    const validKpis = kpis
      .filter((k) => k.kpi.trim() !== "")
      .map((k) => ({
        kpi: k.kpi.trim(),
        unit: k.unit,
        target: k.target ? Number(k.target) : 0,
        results: k.results ? Number(k.results) : 0,
        process: k.process,
      }));

    const payload = {
      plan_name: planName,
      status: status,
      start_at: startAt || null,
      end_at: endAt || null,
      performance: performance,
      issues: issues,
      kpis: validKpis,
      // 🟢 เปลี่ยนจาก 'budgets' เป็น 'budget' ให้ตรงกับ Schema ของ Backend
      budget: validBudgets,
    };

    try {
      const res = await fetch("http://localhost:5000/api/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert("บันทึกข้อมูลสำเร็จ");
        resetForm();
        onSuccess();
        onClose();
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(`เกิดข้อผิดพลาด: ${errData.message || "ไม่สามารถบันทึกได้"}`);
      }
    } catch (err) {
      console.error("Submit Error:", err);
      alert("ไม่สามารถเชื่อมต่อกับ Server ได้");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="modal-overlay" style={modalOverlayStyle}>
    <div className="modal-content" style={modalContentStyle}>
    <h2>เพิ่มแผนงาน</h2>
    <form onSubmit={handleSubmit}>
      {/* ข้อมูลพื้นฐาน */}
      <div style={{ marginBottom: "10px", display: "flex", flexDirection: "column", width: "100%" }}>
  <label style={{ marginBottom: "4px", textAlign: "left", alignSelf: "flex-start" }}>
    ชื่อโครงการ:
  </label>
  <input
    type="text"
    required
    value={planName}
    onChange={(e) => setPlanName(e.target.value)}
    style={{ width: "100%", boxSizing: "border-box", display: "block" }}
  />
</div>

      <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
        <div>
          <label>สถานะ: </label>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="ดำเนินการแล้วเสร็จ">ดำเนินการแล้วเสร็จ</option>
            <option value="อยู่ระหว่างดำเนินการ">อยู่ระหว่างดำเนินการ</option>
            <option value="ขอเลื่อนดำเนินการ">ขอเลื่อนดำเนินการ</option>
            <option value="ไม่ได้ดำเนินการ">ไม่ได้ดำเนินการ</option>
          </select>
        </div>
        <div>
          <label>วันเริ่ม: </label>
          <input type="date" value={startAt} onChange={(e) => setStartAt(e.target.value)} />
        </div>
        <div>
          <label>วันสิ้นสุด: </label>
          <input type="date" value={endAt} onChange={(e) => setEndAt(e.target.value)} />
        </div>
      </div>

      <hr />

      {/* 🟢 ส่วนจัดการ KPIs (วาง Checkbox ไว้ด้านในลูปนี้) */}
      <h4>📊 ผลการดำเนินงานตามตัวชี้วัด (KPIs) โครงการ/กิจกรรม</h4>

        {kpis.map((k, index) => (
          <div 
  key={index} 
  style={{ 
    display: "flex", 
    gap: "8px", 
    marginBottom: "8px", 
    alignItems: "center",
    flexWrap: "nowrap", // 🟢 บังคับให้อยู่ในแถวเดียวกันทั้งหมด
    width: "100%"
  }}
>
  <input
    type="text"
    placeholder="ตัวชี้วัด"
    value={k.kpi}
    onChange={(e) => handleKpiChange(index, "kpi", e.target.value)}
    style={{ flex: "2 1 120px", minWidth: "0" }}
  />
  <input
    type="text"
    placeholder="หน่วยนับ"
    value={k.unit}
    onChange={(e) => handleKpiChange(index, "unit", e.target.value)}
    style={{ flex: "1 1 70px", minWidth: "0" }}
  />
  <input
    type="number"
    placeholder="เป้าหมาย"
    value={k.target}
    onChange={(e) => handleKpiChange(index, "target", e.target.value)}
    style={{ flex: "1 1 70px", minWidth: "0" }}
  />
  <input
    type="number"
    placeholder="ผลงาน"
    value={k.results}
    onChange={(e) => handleKpiChange(index, "results", e.target.value)}
    style={{ flex: "1 1 70px", minWidth: "0" }}
  />

  {/* Checkbox การบรรลุ + ปุ่ม ❌ อยู่ต่อท้ายในบรรทัดเดียวกัน */}
  <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
    <input
      id={`kpi-process-${index}`}
      type="checkbox"
      checked={Boolean(k.process)}
      onChange={(e) => handleKpiChange(index, "process", e.target.checked)}
      style={{ cursor: "pointer" }}
    />
    <label htmlFor={`kpi-process-${index}`} style={{ cursor: "pointer", whiteSpace: "nowrap" }}>
      บรรลุ
    </label>

    {kpis.length > 1 && (
      <button 
        type="button" 
        onClick={() => removeKpiRow(index)}
        style={{
          backgroundColor: "#fff5f5",
          border: "1px solid #fecaca",
          padding: "4px 8px",
          borderRadius: "4px",
          cursor: "pointer",
          fontSize: "12px",
          lineHeight: 1
        }}
      >
        ❌
      </button>
    )}
  </div>
</div>
        ))}

        <button 
          type="button" 
          onClick={addKpiRow}
          style={{ marginTop: "5px", marginBottom: "10px" }}
        >
          + เพิ่มตัวชี้วัด (KPI)
        </button>

        <hr />

          {/* 🟢 ส่วนจัดการ Dynamic Budgets Array */}
<h4>💰 รายการงบประมาณ (Budgets)</h4>
{budgets.map((b, index) => (
  <div key={index} style={{ marginBottom: "10px" }}>
    <div style={{ display: "flex", gap: "5px", marginBottom: "5px" }}>
      {/* Dropdown เลือกแหล่งงบประมาณ */}
      <select
        value={b.budget_source}
        onChange={(e) => handleBudgetChange(index, "budget_source", e.target.value)}
        style={{ flex: 2 }}
        required
      >
        <option value="">-- เลือกแหล่งงบประมาณ --</option>
        <option value="งปม.เงินรายได้">งปม.เงินรายได้</option>
        <option value="งปม.แผ่นดิน">งปม.แผ่นดิน</option>
        <option value="เงินกองทุนพัฒนา">เงินกองทุนพัฒนา</option>
        <option value="เงินบริจาค/อุดหนุน">เงินบริจาค/อุดหนุน</option>
        <option value="อื่นๆ">อื่นๆ</option>
      </select>

      <input
        type="number"
        step="0.01"
        placeholder="จัดสรร (บาท)"
        value={b.allocated_amount}
        onChange={(e) => handleBudgetChange(index, "allocated_amount", e.target.value)}
        style={{ flex: 1 }}
      />
      <input
        type="number"
        step="0.01"
        placeholder="ใช้จริง (บาท)"
        value={b.actual_amount}
        onChange={(e) => handleBudgetChange(index, "actual_amount", e.target.value)}
        style={{ flex: 1 }}
      />
      {budgets.length > 1 && (
        <button type="button" onClick={() => removeBudgetRow(index)}>❌</button>
      )}
    </div>

    {/* 🟢 ช่องกรอกเพิ่มเติม จะแสดงผลเฉพาะตอนที่เลือก "อื่นๆ" เท่านั้น */}
    {b.budget_source === "อื่นๆ" && (
      <input
        type="text"
        placeholder="ระบุแหล่งงบประมาณอื่นๆ..."
        value={b.other_source}
        onChange={(e) => handleBudgetChange(index, "other_source", e.target.value)}
        style={{ width: "100%", padding: "5px", marginTop: "2px" }}
        required
      />
    )}
  </div>
))}

          <hr />

          {/* ผลงานเชิงคุณภาพ & ปัญหา */}
          <div style={{ marginBottom: "10px" }}>
            <label>ผลงานเชิงคุณภาพ: </label>
            <textarea
              value={performance}
              onChange={(e) => setPerformance(e.target.value)}
              style={{ width: "100%" }}
            />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label>ปัญหา/อุปสรรค: </label>
            <textarea
              value={issues}
              onChange={(e) => setIssues(e.target.value)}
              style={{ width: "100%" }}
            />
          </div>

          {/* ปุ่มควบคุม */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "15px" }}>
            <button type="button" onClick={onClose} disabled={loading}>
              ยกเลิก
            </button>
            <button type="submit" disabled={loading}>
              {loading ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Inline CSS ตัวอย่างสำหรับ Overlay
const modalOverlayStyle = {
  position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000
};

const modalContentStyle = {
  background: "#fff", padding: "20px", borderRadius: "8px",
  maxWidth: "650px", width: "90%", maxHeight: "90vh", overflowY: "auto"
};

export default AddPlanModal;