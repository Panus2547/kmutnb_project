export const handleDeletePlan = async (planId) => {
  if (!window.confirm("คุณต้องการลบแผนงานนี้ใช่หรือไม่?")) return;

  try {
    const res = await fetch(`http://localhost:5000/api/plans/${planId}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (res.ok) {
      alert("ลบข้อมูลสำเร็จ");
      fetchDashboard();
    } else {
      const result = await res.json();
      alert(`เกิดข้อผิดพลาด: ${result.message || "ไม่สามารถลบได้"}`);
    }
  } catch (error) {
    console.error("Delete Error:", error);
    alert("ไม่สามารถเชื่อมต่อกับ Server เพื่อลบข้อมูลได้");
  }
};