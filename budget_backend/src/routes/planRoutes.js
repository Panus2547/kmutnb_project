const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");
const isOwnerOrAdmin = require("../middleware/authMiddleware");

const planController = require("../controllers/planController");

router.get("/", verifyToken, planController.getAllPlans);

router.post("/", verifyToken, planController.createPlan);

router.put("/:planId", verifyToken, isOwnerOrAdmin, planController.updatePlan);

router.put("/:planId/kpis", verifyToken, isOwnerOrAdmin, planController.replaceKpis); // 👈 เพิ่มใหม่

router.put("/:planId/kpis/:kpiId", verifyToken, planController.updateKpi);

router.put("/:planId/budget/:budgetId", verifyToken, planController.updateBudget);

router.delete("/:planId", verifyToken, planController.deletePlan);

router.delete("/:planId/kpis/:kpiId", verifyToken, planController.removeKpi);

module.exports = router;