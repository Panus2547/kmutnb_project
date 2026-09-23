const planModel = require("../models/planModel");

const getAllPlans = async (req, res) => {
  try {
    const plans = await planModel.getAllPlans();

    res.json(plans);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "ไม่สามารถดึงข้อมูลแผนงานได้"
    });
  }
};

const getPlanByPlanId = async (req, res) => {
  try {
    const { id } = req.params;

    const plan = await planModel.getPlanByPlanId(id, req.user.user_id);

    if (!plan) {
      return res.status(404).json({
        message: "ไม่พบแผนงาน"
      });
    }

    res.json(plan);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "ไม่สามารถดึงข้อมูลแผนงานได้"
    });
  }
};

const getPlanByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    const plan = await planModel.getPlanByUserId(userId, req.user.user_id);

    res.json(plan);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "ไม่สามารถดึงข้อมูลแผนงานได้"
    });
  }
};

const createPlan = async (req, res) => {
  try {

    const {
      plan_name,
      status,
      start_at,
      end_at,
      performance,
      issues,
      kpis,
      budget
    } = req.body;

    // เอาจาก JWT
    const userId = req.user.user_id;

    // ตรวจสอบ KPI
    if (!Array.isArray(kpis)) {
      return res.status(400).json({
        message: "kpis ต้องเป็น Array"
      });
    }

    const result = await planModel.createPlan({

      plan_name,
      status,
      start_at,
      end_at,
      performance,
      issues,

      // คนสร้างข้อมูล
      created_by: userId,

      // KPI หลายตัว
      kpis,

      // Budget 1 ตัว
      budget
    });

    res.status(201).json(result);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "ไม่สามารถสร้างแผนงานได้"
    });
  }
};
const updatePlan = async (req, res) => {
  try {
    const { planId } = req.params;
    const decoded = req.user;
    const userId = Number(decoded.user_id);
    const isAdmin = decoded.role === "admin";

    const plan = await planModel.getPlanByPlanId(planId);

    if (!plan) {
      return res.status(404).json({
        message: "ไม่พบแผนงานนี้"
      });
    }

    const ownerId = Number(plan.created_by);

    if (!isAdmin && ownerId !== userId) {
      return res.status(403).json({
        message: "คุณไม่มีสิทธิ์แก้ไขแผนงานนี้"
      });
    }

    const result = await planModel.updatePlan(
      planId,
      userId,
      isAdmin,
      req.body
    );

    if (!result) {
      return res.status(404).json({
        message: "ไม่พบแผนงานนี้ หรือคุณไม่มีสิทธิ์แก้ไข"
      });
    }

    res.json(result);

  } catch (error) {
    console.error("Update Plan Error:", error);
    res.status(500).json({
      message: "เกิดข้อผิดพลาดในการแก้ไขแผนงาน"
    });
  }
};

const updateKpi = async (req, res) => {
  try {
    const { planId, kpiId } = req.params;
    const decoded = req.user;
    const userId = Number(decoded.user_id);
    const isAdmin = decoded.role === "admin";

    const plan = await planModel.getPlanByPlanId(planId);

    if (!plan) {
      return res.status(404).json({
        message: "ไม่พบแผนงานนี้"
      });
    }

    const ownerId = Number(plan.created_by);

    if (!isAdmin && ownerId !== userId) {
      return res.status(403).json({
        message: "คุณไม่มีสิทธิ์แก้ไข KPI ของแผนงานนี้"
      });
    }

    const result = await planModel.updatePlanKpi(
      planId,
      userId,
      isAdmin,
      kpiId,
      req.body
    );

    if (!result) {
      return res.status(404).json({
        message: "ไม่พบ KPI ของแผนงานนี้"
      });
    }

    return res.json(result);

  } catch (error) {
    console.error("Update KPI Error:", error);
    return res.status(500).json({
      message: "เกิดข้อผิดพลาดในการแก้ไข KPI"
    });
  }
};

// ใน src/controllers/planController.js

const updateBudget = async (req, res) => {
  try {
    const { planId, budgetId } = req.params;
    
    // ดึง userId และ role จาก Middleware (verifyToken)
    const userId = req.user?.userId || req.user?.id;
    const isAdmin = req.user?.role === "admin";

    // ข้อมูล budgetData ที่ส่งมาจาก Frontend
    const budgetData = req.body;

    // ตรวจสอบว่ามี planId และ budgetId ส่งมาหรือไม่
    if (!planId || !budgetId) {
      return res.status(400).json({ 
        message: "กรุณาระบุ planId และ budgetId ให้ครบถ้วน" 
      });
    }

    // เรียกใช้ฟังก์ชัน Service/Model
    const updatedBudget = await planModel.updateBudget(
      budgetId,
      planId,
      userId,
      isAdmin,
      budgetData
    );

    if (!updatedBudget) {
      return res.status(404).json({ 
        message: "ไม่พบข้อมูลรายการงบประมาณ หรือคุณไม่มีสิทธิ์แก้ไขรายการนี้" 
      });
    }

    return res.status(200).json({
      message: "อัปเดตข้อมูลรายการงบประมาณสำเร็จ",
      data: updatedBudget,
    });

  } catch (error) {
    console.error("Error in updateBudget Controller:", error);
    return res.status(500).json({ 
      message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์", 
      error: error.message 
    });
  }
};

const replaceKpis = async (req, res) => {
  try {
    const { planId } = req.params;
    const { kpis } = req.body;

    if (!Array.isArray(kpis)) {
      return res.status(400).json({
        message: "รูปแบบข้อมูล KPI ไม่ถูกต้อง",
      });
    }

    const result = await planModel.replaceKpisForPlan(planId, kpis);

    return res.json({
      message: "บันทึก KPI สำเร็จ",
      data: result,
    });
  } catch (error) {
    console.error("Replace KPIs Error:", error);
    return res.status(500).json({
      message: "ไม่สามารถบันทึกข้อมูล KPI ได้",
    });
  }
};

const deletePlan = async (req, res) => {
  try {
    const { planId } = req.params;
    const decoded = req.user; // ดึงข้อมูลผู้ใช้จาก JWT ที่ถูกตรวจสอบแล้ว
    const userId = Number(decoded.user_id);
    const ownerId = Number((await planModel.getPlanByPlanId(planId))?.created_by);
    console.log("Owner ID:", ownerId, "User ID:", userId);
    if(!ownerId){
      return res.status(404).json({
        message: "ไม่พบแผนงานนี้"
      });
    }

    if (decoded.role !== "admin" && ownerId !== userId) {
      return res.status(403).json({
        message: "คุณไม่มีสิทธิ์ลบแผนงานนี้"
      });
    }

    const plan = await planModel.deletePlan(
      planId
    );

    return res.json({
      message: "ลบแผนงานสำเร็จ"
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "ไม่สามารถลบแผนงานได้"
    });
  }
};


const removeKpi = async (req, res) => {
  try {
    const { planId, kpiId } = req.params;

    if (!planId || !kpiId) {
      return res.status(400).json({
        success: false,
        message: "ข้อมูลไม่ครบถ้วน (ต้องระบุ planId และ kpiId)"
      });
    }

    const deletedKpi = await deleteKpi(kpiId);

    if (!deletedKpi) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบรายการ KPI ที่ต้องการลบ"
      });
    }

    return res.status(200).json({
      success: true,
      message: "ลบตัวชี้วัดเรียบร้อยแล้ว",
      data: deletedKpi
    });

  } catch (error) {
    console.error("Error in removeKpi:", error);
    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์",
      error: error.message
    });
  }
};

module.exports = {
  getAllPlans,
  getPlanByPlanId,
  getPlanByUserId,
  createPlan,
  updatePlan,
  updateKpi,
  updateBudget,
  deletePlan,
  replaceKpis,
  removeKpi
};
