import { useEffect, useState ,useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "../css/Dashboard.css";
import {handleLogout} from "./logout";
import { handleDeletePlan } from "./deletePlan";
import EditPlanModal from "./editPlanModal";

import AddPlanModal from "./addPlanModal";
function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [statusFilter, setStatusFilter] = useState("ทั้งหมด")
  const [startMonthFilter, setStartMonthFilter] = useState("");
  const [endMonthFilter, setEndMonthFilter] = useState("");

  const [onlyMyPlans, setOnlyMyPlans] = useState(false);

  // 🟢 1. แยก State คำที่กำลังพิมพ์ (searchTerm) และ คำที่กดค้นหาแล้ว (appliedSearch)
  const [searchTerm, setSearchTerm] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");

  const handleEditClick = (plan) => {
    setSelectedPlan(plan);
    setIsEditModalOpen(true);
  };

  // 🟢 2. สร้างฟังก์ชันสำหรับปุ่มค้นหาและปุ่มล้างค่า
  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault(); // ป้องกันหน้าเว็บ Refresh
    setAppliedSearch(searchTerm); // ส่งค่าที่พิมพ์ไปประมวลผลค้นหา
  };

 const handleResetSearch = () => {
    setSearchTerm("");
    setAppliedSearch("");
    setStatusFilter("ทั้งหมด");
    setStartMonthFilter("");
    setEndMonthFilter("");
    setOnlyMyPlans(false);
  };

  

  // 🟢 3. สร้าง State สำหรับเก็บ user
  const [user, setUser] = useState({ username: "Guest", role: "User" });
  const navigate = useNavigate();

  // 🟢 4. กรองข้อมูลเฉพาะเมื่อ appliedSearch มีการเปลี่ยนแปลง
  const filteredPlans = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];

    const term = appliedSearch.trim().toLowerCase();

    return data.filter((item) => {
      // 1. ค้นหาจากข้อความ
      const matchId = item.plan_id ? String(item.plan_id).toLowerCase().includes(term) : false;
      const matchName = item.plan_name ? String(item.plan_name).toLowerCase().includes(term) : false;
      const matchCreator = item.created_by ? String(item.created_by).toLowerCase().includes(term) : false;
      const matchUsername = item.username ? String(item.username).toLowerCase().includes(term) : false;
      const matchSearch = term === "" || matchId || matchName || matchCreator || matchUsername;

      // 2. ค้นหาจากสถานะ
      const matchStatus = statusFilter === "ทั้งหมด" || item.status === statusFilter;

      // 3. ค้นหาจากช่วงเดือน/ปี
      const itemStartMonth = item.start_at ? item.start_at.substring(0, 7) : "";
      const itemEndMonth = item.end_at ? item.end_at.substring(0, 7) : "";
      const matchStartMonth = !startMonthFilter || (itemStartMonth && itemStartMonth >= startMonthFilter);
      const matchEndMonth = !endMonthFilter || (itemEndMonth && itemEndMonth <= endMonthFilter);

      // 🟢 4. เงื่อนไขแสดงเฉพาะข้อมูลของฉัน (เทียบกับ user.username)
      const currentUsername = user?.username || "";
      const matchMyPlan = !onlyMyPlans || 
        (item.created_by && item.created_by === currentUsername) || 
        (item.username && item.username === currentUsername);

      return matchSearch && matchStatus && matchStartMonth && matchEndMonth && matchMyPlan;
    });
  }, [data, appliedSearch, statusFilter, startMonthFilter, endMonthFilter, onlyMyPlans, user]);

  // 🟢 5. Pagination (client-side) — แบ่งหน้าละ 10 รายการ (นับเป็น "แผนงาน" ไม่ใช่แถว KPI)
  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(filteredPlans.length / ITEMS_PER_PAGE));

  const paginatedPlans = useMemo(
    () =>
      filteredPlans.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
      ),
    [filteredPlans, currentPage]
  );

  // รีเซ็ตกลับหน้า 1 ทุกครั้งที่ผลการค้นหา/กรองเปลี่ยน กันหน้าค้างเกินจำนวนหน้าจริง
  useEffect(() => {
    setCurrentPage(1);
  }, [appliedSearch, statusFilter, startMonthFilter, endMonthFilter, onlyMyPlans]);

  const goToPage = (page) => {
    setCurrentPage((prev) => {
      const clamped = Math.min(Math.max(page, 1), totalPages);
      return clamped;
    });
  };

  const fetchDashboard = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/plans`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      const result = await res.json();
      if (res.ok) {
        setData(result);
      } else {
        console.error("Backend Error:", result.message);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlans = () => {
    fetchDashboard();
  };

  useEffect(() => {
    const getCookie = (name) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(";").shift();
      return null;
    };

    const cookieVal = getCookie("user_info");
    if (cookieVal) {
      try {
        const parsed = JSON.parse(decodeURIComponent(cookieVal));
        setUser(parsed);
      } catch (e) {
        console.error("Parse cookie error", e);
      }
    }

    fetchDashboard();
  }, []);

  if (loading) return <div className="loading-state">กำลังโหลดข้อมูล...</div>;
  return (
  <div className="dashboard-container">
    <div className="dashboard-header">
      <h1 className="dashboard-title">🎉 ระบบจัดการแผนงาน</h1>
      <button onClick={handleLogout} className="btn-logout">
        ออกจากระบบ
      </button>
    </div>

    <hr className="divider" />

    {/* 🟢 แสดงข้อมูลผู้ใช้งาน */}
    <h4>
      👤 ผู้ใช้งาน: {user?.username || "Guest"} | สิทธิ์: {user?.role || "User"}
    </h4>

    <button onClick={() => setIsModalOpen(true)}>
      + เพิ่มแผนงาน
    </button>
{/* --- ฟอร์มค้นหาและตัวกรอง --- */}
<form onSubmit={handleSearchSubmit} className="search-panel">
  {/* แถวที่ 1: ค้นหาข้อความ + เลือกสถานะ */}
  <div className="search-row">
    <div className="search-field search-field-wide">
      <label>🔎 ค้นหาแผนงาน (รหัส, ชื่อแผนงาน, ผู้สร้าง)</label>
      <input
        type="text"
        placeholder="พิมพ์ รหัส, ชื่อแผนงาน หรือผู้สร้าง..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>

    <div className="search-field search-field-status">
      <label>📌 สถานะ</label>
      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
      >
        <option value="ทั้งหมด">-- ทุกสถานะ --</option>
        <option value="กำลังดำเนินงาน">กำลังดำเนินงาน</option>
        <option value="อยู่ระหว่างดำเนินการ">อยู่ระหว่างดำเนินการ</option>
        <option value="เสร็จสิ้น">เสร็จสิ้น</option>
        <option value="ยกเลิก">ยกเลิก</option>
      </select>
    </div>
  </div>

  {/* แถวที่ 2: เดือนเริ่ม/จบ + Checkbox ข้อมูลของฉัน + ปุ่มกด */}
  <div className="search-row">
    <div className="search-field">
      <label>📅 เดือนที่เริ่มต้นตั้งแต่</label>
      <input
        type="month"
        value={startMonthFilter}
        onChange={(e) => setStartMonthFilter(e.target.value)}
      />
    </div>

    <div className="search-field">
      <label>📅 เดือนที่สิ้นสุดภายใน</label>
      <input
        type="month"
        value={endMonthFilter}
        onChange={(e) => setEndMonthFilter(e.target.value)}
      />
    </div>

    <div className="search-checkbox-field">
      <label className="search-checkbox-label">
        <input
          type="checkbox"
          checked={onlyMyPlans}
          onChange={(e) => setOnlyMyPlans(e.target.checked)}
        />
        👤 แสดงเฉพาะข้อมูลของฉัน
      </label>
    </div>

    {/* ปุ่มกด ค้นหา และ ล้างค่า */}
    <div className="search-actions">
      <button type="submit" className="btn-search">
        🔍 ค้นหา
      </button>

      {(appliedSearch ||
        statusFilter !== "ทั้งหมด" ||
        startMonthFilter ||
        endMonthFilter ||
        onlyMyPlans) && (
        <button type="button" onClick={handleResetSearch} className="btn-reset">
          ✕ ล้างค่า
        </button>
      )}
    </div>
  </div>
</form>
    {/* Modals */}
    <AddPlanModal
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      onSuccess={fetchPlans}
    />

    <EditPlanModal
      isOpen={isEditModalOpen}
      onClose={() => setIsEditModalOpen(false)}
      onSuccess={fetchDashboard}
      initialData={selectedPlan}
    />

    {/* 🟢 แสดงข้อมูลจาก filteredPlans */}
    {filteredPlans && filteredPlans.length > 0 ? (
      <div className="table-responsive">
        <table className="plans-table">
          <colgroup>
            <col className="col-id" />
            <col className="col-plan-name" />
            <col className="col-status" />
            <col className="col-schedule" />
            <col className="col-kpi-kpi" />
            <col className="col-kpi-unit" />
            <col className="col-kpi-target" />
            <col className="col-kpi-result" />
            <col className="col-kpi-process" />
            <col className="col-performance" />
            <col className="col-budget" />
            <col className="col-issues" />
            <col className="col-user" />
            <col className="col-delete" />
          </colgroup>

          <thead>
            <tr>
              <th rowSpan="2">ID</th>
              <th rowSpan="2">ชื่อโครงการ</th>
              <th rowSpan="2">สถานะ</th>
              <th rowSpan="2">กำหนดการ</th>
              <th colSpan="5" className="header-main">
                ผลการดำเนินงานตามตัวชี้วัด (KPIs) โครงการ/กิจกรรม
              </th>
              <th rowSpan="2">ผลงานเชิงคุณภาพ</th>
              <th rowSpan="2">งบประมาณ (จัดสรร / ใช้จริง)</th>
              <th rowSpan="2">ปัญหา/อุปสรรค</th>
              <th rowSpan="2">ผู้รับผิดชอบ</th>
              <th rowSpan="2">จัดการ</th>
            </tr>
            <tr>
              <th className="vertical-header">ตัวชี้วัด</th>
              <th className="vertical-header">หน่วยนับ</th>
              <th className="vertical-header">เป้าหมาย</th>
              <th className="vertical-header">ผลการดำเนินงาน</th>
              <th className="vertical-header">การบรรลุ (✔️/❌)</th>
            </tr>
          </thead>
          <tbody>
            {/* 🟢 วนลูปเฉพาะ paginatedPlans (10 รายการ/หน้า) */}
            {paginatedPlans.map((item) => {
              const kpis = item.kpis && item.kpis.length > 0 ? item.kpis : [{}];
              const kpiCount = kpis.length;

              return kpis.map((kpi, index) => {
                const processVal = kpi.process ?? item.process;

                return (
                  <tr key={`${item.plan_id}-${kpi.kpi_id || index}`}>
                    {/* คอลัมน์ด้านซ้าย แสดงเฉพาะแถวแรกของแต่ละแผนงาน */}
                    {index === 0 && (
                      <>
                        <td rowSpan={kpiCount}>{item.plan_id}</td>
                        <td rowSpan={kpiCount} className="font-semibold">{item.plan_name}</td>
                        <td rowSpan={kpiCount}>
                          <span className="status-tag">{item.status}</span>
                        </td>
                        <td rowSpan={kpiCount}>
                          {item.start_at
                            ? new Date(item.start_at).toLocaleDateString("th-TH", {
                                month: "short",
                                year: "numeric",
                              })
                            : "-"}{" "}-
                          <br />
                          {item.end_at
                            ? new Date(item.end_at).toLocaleDateString("th-TH", {
                                month: "short",
                                year: "numeric",
                              })
                            : "-"}
                        </td>
                      </>
                    )}

                    {/* คอลัมน์ KPIs */}
                    <td>{kpi.kpi || item.kpi || "-"}</td>
                    <td>{kpi.unit || item.unit || "-"}</td>
                    <td>{kpi.target || item.target || "-"}</td>
                    <td>{kpi.results || item.results || "-"}</td>
                    <td>
                      {processVal === true
                        ? "✔️"
                        : processVal === false
                        ? "❌"
                        : "-"}
                    </td>

                    {/* คอลัมน์ด้านขวา */}
                    {index === 0 && (
                      <>
                        <td rowSpan={kpiCount} className="cell-performance">
                          {item.performance || "-"}
                        </td> 
                        <td rowSpan={kpiCount}>
                          {item.budgets?.map((b) => (
                            <div key={b.budget_id} className="budget-info">
                              <span className="budget-source">{b.budget_source}:</span>
                              <br />
                              {b.allocated_amount?.toLocaleString()} / <strong>{b.actual_amount?.toLocaleString()}</strong> บาท
                            </div>
                          ))}
                        </td>
                        <td rowSpan={kpiCount} className="cell-problems">
                          {item.issues || "-"}
                        </td>
                        <td rowSpan={kpiCount}>
                          <div className="user-info">
                            <strong>{item.username}</strong>
                            <br />
                            <small className="text-muted">{item.user_position}</small>
                          </div>
                        </td>
                        <td rowSpan={kpiCount}>
                          <button
                            type="button"
                            className="btn-delete"
                            onClick={() => handleDeletePlan(item.plan_id, fetchDashboard)}
                          >
                            🗑️ ลบ
                          </button>
                          <button 
                            type="button" 
                            onClick={() => handleEditClick(item)}
                          >
                            ✏️ แก้ไข
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                );
              });
            })}
          </tbody>
        </table>
      </div>
    ) : (
      <p className="empty-state">ไม่พบข้อมูลที่ตรงกับเงื่อนไขการค้นหา</p>
    )}

    {/* 🟢 ตัวเลื่อนหน้า (pagination) — แสดงเมื่อมีมากกว่า 1 หน้า */}
    {filteredPlans.length > 0 && totalPages > 1 && (
      <div className="pagination">
        <button
          type="button"
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
          className="pagination-nav"
        >
          ‹ ก่อนหน้า
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            type="button"
            key={page}
            onClick={() => goToPage(page)}
            className={`pagination-page${page === currentPage ? " is-active" : ""}`}
          >
            {page}
          </button>
        ))}

        <button
          type="button"
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="pagination-nav"
        >
          ถัดไป ›
        </button>

        <span className="pagination-summary">
          หน้า {currentPage} จาก {totalPages} (ทั้งหมด {filteredPlans.length} แผนงาน)
        </span>
      </div>
    )}
  </div>
);
}

export default Dashboard;