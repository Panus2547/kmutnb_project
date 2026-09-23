import { useState, useEffect } from "react";


function EditPlanModal({ isOpen, onClose, onSuccess, initialData }) {
  const [planName, setPlanName] = useState("");
  const [status, setStatus] = useState("กำลังดำเนินงาน");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [performance, setPerformance] = useState("");
  const [issues, setIssues] = useState("");
  const [loading, setLoading] = useState(false);

  const [kpis, setKpis] = useState([]);
  const [budgets, setBudgets] = useState([]);

  // เติมข้อมูลเดิมลงใน Form เมื่อเปิด Modal
  useEffect(() => {
  if (initialData) {
    setPlanName(initialData.plan_name || "");
    setStatus(initialData.status || "กำลังดำเนินงาน");
    setStartAt(initialData.start_at ? initialData.start_at.split("T")[0] : "");
    setEndAt(initialData.end_at ? initialData.end_at.split("T")[0] : "");
    setPerformance(initialData.performance || "");
    setIssues(initialData.issues || "");

    // 🟢 KPIs: ดึง kpi_id มาด้วย
    if (initialData.kpis && initialData.kpis.length > 0) {
      setKpis(
        initialData.kpis.map((k) => ({
          kpi_id: k.kpi_id, // 👈 สำคัญมาก
          kpi: k.kpi || "",
          unit: k.unit || "",
          target: k.target ?? "",
          results: k.results ?? "",
          process: k.process ?? true,
        }))
      );
    } else {
      setKpis([{ kpi: "", unit: "", target: "", results: "", process: true }]);
    }

    // 🟢 Budgets: ดึง budget_id มาด้วย
    if (initialData.budgets && initialData.budgets.length > 0) {
      const predefinedSources = [
        "งปม.เงินรายได้",
        "งปม.แผ่นดิน",
        "เงินกองทุนพัฒนา",
        "เงินบริจาค/อุดหนุน",
      ];
      setBudgets(
        initialData.budgets.map((b) => {
          const isOther = !predefinedSources.includes(b.budget_source);
          return {
            budget_id: b.budget_id, // 👈 สำคัญมาก
            budget_source: isOther ? "อื่นๆ" : b.budget_source,
            other_source: isOther ? b.budget_source : "",
            allocated_amount: b.allocated_amount ?? "",
            actual_amount: b.actual_amount ?? "",
          };
        })
      );
    } else {
      setBudgets([
        { budget_source: "", other_source: "", allocated_amount: "", actual_amount: "" },
      ]);
    }
  }
}, [initialData]);

  if (!isOpen || !initialData) return null;

  // ---จัดการ KPIs---
    // ---จัดการ KPIs--- (เหมือนเดิมทุกจุด ไม่แตะฟอร์ม)
  const handleKpiChange = (index, field, value) => {
    const updated = [...kpis];
    updated[index][field] = value;
    setKpis(updated);
  };
  const addKpiRow = () =>
    setKpis([...kpis, { kpi: "", unit: "", target: "", results: "", process: true }]);
  const removeKpiRow = (index) => {
    if (kpis.length > 1) {
      setKpis(kpis.filter((_, i) => i !== index));
    }
  };

  // ---จัดการ Budgets--- (เหมือนเดิมทุกจุด)
  const handleBudgetChange = (index, field, value) => {
    const updated = [...budgets];
    updated[index][field] = value;
    setBudgets(updated);
  };
  const removeBudgetRow = (index) =>
    budgets.length > 1 && setBudgets(budgets.filter((_, i) => i !== index));

  // ---Submit ข้อมูลอัปเดตไปที่ Backend---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. อัปเดตข้อมูลหลักของ Plan
      const planPayload = {
        plan_name: planName,
        status: status,
        start_at: startAt || null,
        end_at: endAt || null,
        performance: performance,
        issues: issues,
      };

      const resPlan = await fetch(
        `http://localhost:5000/api/plans/${initialData.plan_id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(planPayload),
        }
      );

      if (!resPlan.ok) {
        const errData = await resPlan.json().catch(() => ({}));
        throw new Error(errData.message || "ไม่สามารถอัปเดตข้อมูลแผนงานได้");
      }

      // 2. ส่ง KPI ทั้งชุดในคำขอเดียว ให้ backend ลบของเก่าทั้งหมดของ plan นี้แล้วแทนที่ด้วยชุดใหม่
      //    (แทนที่การวน PUT ทีละ kpi_id แบบเดิม)
      const kpiPayload = kpis
        .filter((k) => k.kpi.trim() !== "") // ตัดแถวที่ไม่ได้กรอกชื่อ KPI ทิ้ง ไม่ส่งไป backend
        .map((k) => ({
          kpi: k.kpi.trim(),
          unit: k.unit || "",
          target: k.target !== "" ? Number(k.target) : 0,
          results: k.results !== "" ? Number(k.results) : 0,
          process: Boolean(k.process),
        }));

      const resKpi = await fetch(
        `http://localhost:5000/api/plans/${initialData.plan_id}/kpis`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ kpis: kpiPayload }),
        }
      );

      if (!resKpi.ok) {
        const errData = await resKpi.json().catch(() => ({}));
        throw new Error(errData.message || "ไม่สามารถบันทึกข้อมูล KPI ได้");
      }

      // 3. วนลูปยิง PUT อัปเดต Budgets ทีละตัวตาม budget_id (เหมือนเดิม ไม่แตะ)
      const budgetPromises = budgets
        .filter((b) => b.budget_id && b.budget_source.trim() !== "")
        .map(async (b) => {
          const res = await fetch(
            `http://localhost:5000/api/plans/${initialData.plan_id}/budget/${b.budget_id}`,
            {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({
                budget_source:
                  b.budget_source === "อื่นๆ"
                    ? b.other_source || "อื่นๆ"
                    : b.budget_source,
                allocated_amount: b.allocated_amount
                  ? Number(b.allocated_amount)
                  : 0,
                actual_amount: b.actual_amount ? Number(b.actual_amount) : 0,
              }),
            }
          );

          if (!res.ok) {
            const errRes = await res.json().catch(() => ({}));
            console.error("Budget Update Error Detail:", res.status, errRes);
            throw new Error(
              errRes.message || "อัปเดตข้อมูลรายการงบประมาณไม่สำเร็จ"
            );
          }
          return res;
        });

      await Promise.all(budgetPromises);

      alert("อัปเดตข้อมูลสำเร็จ");
      if (typeof onSuccess === "function") onSuccess();
      if (typeof onClose === "function") onClose();
    } catch (err) {
      console.error("Update Error:", err);
      alert(`เกิดข้อผิดพลาด: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

 return (
    <div className="modal-overlay" style={modalOverlayStyle}>
    <div className="modal-content" style={modalContentStyle}>
    <h2>✏️แก้ไขแผนงาน</h2>
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
    title="ลบตัวชี้วัด"
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

const modalOverlayStyle = {
  position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: "rgba(0,0,0,0.5)",
  display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000,
};
const modalContentStyle = {
  background: "#fff", padding: "20px", borderRadius: "8px",
  maxWidth: "650px", width: "90%", maxHeight: "90vh", overflowY: "auto",
};

export default EditPlanModal;