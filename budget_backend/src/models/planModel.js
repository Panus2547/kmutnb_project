const pool = require("../db");

const getAllPlans = async () => {
  const result = await pool.query(`
    SELECT 
      p.plan_id,
      p.plan_name,
      p.status,
      p.start_at,
      p.end_at,
      p.performance,
      p.issues,
      u.username,
      u.role AS user_position,
      
      -- รวบรวม KPIs เป็น JSON Array
      COALESCE(
        jsonb_agg(
          DISTINCT jsonb_build_object(
            'kpi_id', pk.kpi_id,
            'kpi', pk.kpi,
            'unit', pk.unit,
            'target', pk.target,
            'results', pk.results,
            'process', pk.process
          )
        ) FILTER (WHERE pk.kpi_id IS NOT NULL), '[]'::jsonb
      ) AS kpis,

      -- รวบรวม Budgets เป็น JSON Array
      COALESCE(
        jsonb_agg(
          DISTINCT jsonb_build_object(
            'budget_id', b.budget_id,
            'budget_source', b.budget_source,
            'allocated_amount', COALESCE(b.allocated_amount, 0),
            'actual_amount', COALESCE(b.actual_amount, 0)
          )
        ) FILTER (WHERE b.budget_id IS NOT NULL), '[]'::jsonb
      ) AS budgets

    FROM public.plan p
    LEFT JOIN public."user" u ON p.created_by = u.user_id
    LEFT JOIN public.budget b ON p.plan_id = b.plan_id
    LEFT JOIN public.plan_kpi pk ON p.plan_id = pk.plan_id -- 👈 แก้ไขเงื่อนไข JOIN ตรงนี้
    
    -- จัดกลุ่มตามระดับแผนงาน และผู้สร้าง
    GROUP BY p.plan_id, u.user_id
    ORDER BY p.created_at DESC;
  `);

  return result.rows; // คืนค่าเป็น Array ของแผนงานทั้งหมดที่มี kpis และ budgets อยู่ข้างใน
};

const getPlanByPlanId = async (planId) => {
  const result = await pool.query(`
    SELECT 
      p.plan_id,
      p.plan_name,
      p.created_by, -- 📍 1. ต้องเพิ่มบรรทัดนี้ลงไปใน SELECT
      p.status,
      p.start_at,
      p.end_at,
      p.performance,
      p.issues,
      u.username,
      u.role AS user_position,
      
      -- รวบรวม KPIs เป็น JSON Array
      COALESCE(
        jsonb_agg(
          DISTINCT jsonb_build_object(
            'kpi_id', pk.kpi_id,
            'kpi', pk.kpi,
            'unit', pk.unit,
            'target', pk.target,
            'results', pk.results,
            'process', pk.process
          )
        ) FILTER (WHERE pk.kpi_id IS NOT NULL), '[]'::jsonb
      ) AS kpis,

      -- รวบรวม Budgets เป็น JSON Array
      COALESCE(
        jsonb_agg(
          DISTINCT jsonb_build_object(
            'budget_id', b.budget_id,
            'budget_source', b.budget_source,
            'allocated_amount', COALESCE(b.allocated_amount, 0),
            'actual_amount', COALESCE(b.actual_amount, 0)
          )
        ) FILTER (WHERE b.budget_id IS NOT NULL), '[]'::jsonb
      ) AS budgets

    FROM public.plan p
    LEFT JOIN public."user" u ON p.created_by = u.user_id
    LEFT JOIN public.budget b ON p.plan_id = b.plan_id
    LEFT JOIN public.plan_kpi pk ON p.plan_id = pk.plan_id
    
    WHERE p.plan_id = $1

    GROUP BY p.plan_id, p.created_by, u.user_id -- 📍 2. ต้องเพิ่ม p.created_by ตรงนี้ด้วยเพื่อป้องกัน SQL Error
    ORDER BY p.created_at DESC;
  `, [planId]);

  return result.rows[0];
};

const getPlanByUserId = async (userId) => {
  const result = await pool.query(`
   SELECT 
      p.plan_id,
      p.plan_name,
      p.status,
      p.start_at,
      p.end_at,
      p.performance,
      p.issues,
      u.username,
      u.role AS user_position,
      
      -- รวบรวม KPIs เป็น JSON Array
      COALESCE(
        jsonb_agg(
          DISTINCT jsonb_build_object(
            'kpi_id', pk.kpi_id,
            'kpi', pk.kpi,
            'unit', pk.unit,
            'target', pk.target,
            'results', pk.results,
            'process', pk.process
          )
        ) FILTER (WHERE pk.kpi_id IS NOT NULL), '[]'::jsonb
      ) AS kpis,

      -- รวบรวม Budgets เป็น JSON Array
      COALESCE(
        jsonb_agg(
          DISTINCT jsonb_build_object(
            'budget_id', b.budget_id,
            'budget_source', b.budget_source,
            'allocated_amount', COALESCE(b.allocated_amount, 0),
            'actual_amount', COALESCE(b.actual_amount, 0)
          )
        ) FILTER (WHERE b.budget_id IS NOT NULL), '[]'::jsonb
      ) AS budgets

    FROM public.plan p
    LEFT JOIN public."user" u ON p.created_by = u.user_id
    LEFT JOIN public.budget b ON p.plan_id = b.plan_id
    LEFT JOIN public.plan_kpi pk ON p.plan_id = pk.plan_id -- 👈 แก้ไขเงื่อนไข JOIN ตรงนี้
    
    WHERE p.created_by = $1

    GROUP BY p.plan_id, u.user_id
    ORDER BY p.created_at DESC;
  `, [userId]);

  return result.rows[0];
};

const createPlan = async ({
  plan_name,
  status,
  start_at,
  end_at,
  performance,
  issues,
  created_by,
  kpis,
  budget
}) => {

  const client = await pool.connect();

  try {

    await client.query("BEGIN");

    const planResult = await client.query(`
      INSERT INTO plan (
        plan_name,
        status,
        start_at,
        end_at,
        performance,
        issues,
        created_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [
      plan_name,
      status,
      start_at,
      end_at,
      performance,
      issues,
      created_by
    ]);

    const plan = planResult.rows[0];

    const planId = plan.plan_id;

    const kpiResults = [];

    if (Array.isArray(kpis)) {

      for (const item of kpis) {

        const kpiResult = await client.query(`
          INSERT INTO plan_kpi (
            plan_id,
            kpi,
            unit,
            target,
            results,
            process
          )
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING *
        `, [
          planId,
          item.kpi,
          item.unit,
          item.target,
          item.results,
          item.process
        ]);

        kpiResults.push(kpiResult.rows[0]);
      }
    }

    let budgetData = null;

    if (budget) {
      
      for (const item of budget) {

        const budgetResult = await client.query(`
          INSERT INTO budget (
            plan_id,
            budget_source,
            allocated_amount,
            actual_amount
          )
          VALUES ($1, $2, $3, $4)
          RETURNING *
        `, [
          planId,
          item.budget_source || 'ไม่ระบุงบประมาณ',
          item.allocated_amount ?? 0,
          item.actual_amount ?? 0
        ]);

        budgetData = budgetResult.rows[0];
      }
    }

    await client.query("COMMIT");

    return {
      plan,
      kpis: kpiResults,
      budget: budgetData
    };


  } catch (error) {

    await client.query("ROLLBACK");

    throw error;

  } finally {

    client.release();
  }
};

const addKpi = async (plan_id, kpi, unit, target, results, process) => {
  const queryResult = await client.query(
    `
    INSERT INTO plan_kpi (
      plan_id,
      kpi,
      unit,
      target,
      results,
      process
    )
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
    `,
    [
      plan_id,
      kpi,
      unit || "",
      target !== "" ? Number(target) : 0,
      results !== "" ? Number(results) : 0,
      Boolean(process),
    ]
  );

  return queryResult.rows[0];
};

const updatePlan = async (planId, userId, isAdmin, planData) => {
  const { plan_name, status, start_at, end_at, performance, issues } = planData;

  const result = await pool.query(`
    UPDATE "plan"
    SET 
      plan_name   = COALESCE($1, plan_name),
      status      = COALESCE($2, status),
      start_at    = COALESCE($3, start_at),
      end_at      = COALESCE($4, end_at),
      performance = COALESCE($5, performance),
      issues      = COALESCE($6, issues)
    WHERE plan_id = $7
      AND ($8 = true OR created_by = $9)
    RETURNING *
  `, [plan_name, status, start_at, end_at, performance, issues, planId, isAdmin, userId]);

  return result.rows[0];
};

const updatePlanKpi = async (planId, userId, isAdmin, planKpiId, kpiData) => {
  const { kpi, unit, target, results, process } = kpiData;

  const result = await pool.query(
    `
      UPDATE "plan_kpi"
      SET
        kpi     = COALESCE($1, kpi),
        unit    = COALESCE($2, unit),
        target  = COALESCE($3, target),
        results = COALESCE($4, results),
        process = COALESCE($5, process)
      WHERE kpi_id = $6
        AND plan_id = $7
        AND EXISTS (
          SELECT 1 FROM "plan" p
          WHERE p.plan_id = $7
            AND ($8 = true OR p.created_by = $9)
        )
      RETURNING *
    `,
    [kpi, unit, target, results, process, planKpiId, planId, isAdmin, userId]
  );

  return result.rows[0];
};

const updateBudget = async (budgetId, planId, userId, isAdmin, budgetData) => {
  // 🟢 ดึงค่าโดยรองรับทั้ง allocated_amount และ allocate_amount
  const { 
    budget_source, 
    allocated_amount, 
    allocate_amount, 
    actual_amount 
  } = budgetData;

  const allocated = allocated_amount ?? allocate_amount;

  const result = await pool.query(
    `
    UPDATE "budget"
    SET 
      budget_source    = COALESCE($1, budget_source),
      allocated_amount = COALESCE($2, allocated_amount), -- 🟢 แก้เป็น allocated_amount
      actual_amount    = COALESCE($3, actual_amount)
    WHERE budget_id = $4
      AND plan_id   = $5
      AND (
        $6 = true 
        OR plan_id IN (
          SELECT plan_id 
          FROM "plan" 
          WHERE plan_id = $5 AND created_by = $7
        )
      )
    RETURNING *
    `,
    [
      budget_source, // $1
      allocated,     // $2
      actual_amount, // $3
      budgetId,      // $4
      planId,        // $5
      isAdmin,       // $6
      userId         // $7
    ]
  );

  return result.rows[0];
};

const replaceKpisForPlan = async (planId, kpis) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    await client.query('DELETE FROM "plan_kpi" WHERE plan_id = $1', [planId]); // 👈 แก้ตรงนี้

    const inserted = [];
    for (const k of kpis) {
      const { rows } = await client.query(
        `INSERT INTO plan_kpi (plan_id, kpi, unit, target, results, process)   
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,                                                        
        [planId, k.kpi, k.unit, k.target, k.results, k.process]
      );
      inserted.push(rows[0]);
    }

    await client.query("COMMIT");
    return inserted;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};


const deletePlan = async (planId) => {
  const result = await pool.query(`
    DELETE FROM "plan"
    WHERE plan_id = $1
    RETURNING *
  `, [planId]);

  return result.rows[0];
};

const deleteKpi = async (kpi_id) =>{
  const result = await pool.query(`
    DELETE FROM "plan_kpi"
    WHERE kpi_id = $1
    RETURNING *
  `, [kpi_id]);

  return result.rows[0]; 
}

module.exports = {
  getAllPlans,
  getPlanByPlanId,
  getPlanByUserId,
  updatePlan,
  updatePlanKpi,
  updateBudget,
  createPlan,
  addKpi,
  deletePlan,
  deleteKpi,
  replaceKpisForPlan
};
