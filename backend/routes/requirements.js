
const express = require("express");
const router = express.Router();
const multer = require("multer");
const xlsx = require("xlsx");

const upload = multer({ storage: multer.memoryStorage() });

router.get("/", async (req, res) => {
  try {
    const result = await req.pool.query("SELECT * FROM requirements ORDER BY id ASC");
    // Format keys to match frontend expectation (camelCase)
    const formatted = result.rows.map(row => ({
      _id: row.id,
      requirementId: row.requirement_id,
      description: row.description,
      development: row.development,
      testing: row.testing,
      reporting: row.reporting,
      deployment: row.deployment,
      usage: row.usage,
      status: row.status,
      remarks: row.remarks
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { requirementId, description, development, testing, reporting, deployment, usage, status, remarks } = req.body;

    const result = await req.pool.query(
      `INSERT INTO requirements (requirement_id, description, development, testing, reporting, deployment, usage, status, remarks) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [requirementId, description, development || 'Pending', testing || 'Pending', reporting || 'Pending', deployment || 'Pending', usage || 'Pending', status || 'Not Started', remarks || '']
    );

    const row = result.rows[0];
    res.json({
      _id: row.id,
      requirementId: row.requirement_id,
      description: row.description,
      development: row.development,
      testing: row.testing,
      reporting: row.reporting,
      deployment: row.deployment,
      usage: row.usage,
      status: row.status,
      remarks: row.remarks
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const bodyKeys = Object.keys(req.body);

    if (bodyKeys.length === 0) {
      return res.status(400).json({ message: "No data to update" });
    }

    // Convert camelCase to snake_case for the query
    const dbKeyMap = {
      requirementId: 'requirement_id',
      description: 'description',
      development: 'development',
      testing: 'testing',
      reporting: 'reporting',
      deployment: 'deployment',
      usage: 'usage',
      status: 'status',
      remarks: 'remarks'
    };

    let setClauses = [];
    let values = [];
    let paramIndex = 1;

    bodyKeys.forEach(key => {
      if (dbKeyMap[key]) {
        setClauses.push(`${dbKeyMap[key]} = $${paramIndex}`);
        values.push(req.body[key]);
        paramIndex++;
      }
    });

    values.push(id);

    const updateQuery = `
      UPDATE requirements 
      SET ${setClauses.join(", ")} 
      WHERE id = $${paramIndex} 
      RETURNING *
    `;

    const result = await req.pool.query(updateQuery, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Requirement not found" });
    }

    const row = result.rows[0];
    res.json({
      _id: row.id,
      requirementId: row.requirement_id,
      description: row.description,
      development: row.development,
      testing: row.testing,
      reporting: row.reporting,
      deployment: row.deployment,
      usage: row.usage,
      status: row.status,
      remarks: row.remarks
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/export", async (req, res) => {
  try {
    const result = await req.pool.query("SELECT * FROM requirements ORDER BY id ASC");
    if (!result.rows.length) return res.status(404).json({ message: "No data found" });

    // Prepare data for Excel
    const formattedData = result.rows.map(item => ({
      "Requirement Id": item.requirement_id,
      "Requirement Description": item.description,
      "Development": item.development,
      "Testing": item.testing,
      "Reporting": item.reporting,
      "Deployment": item.deployment,
      "Usage": item.usage,
      "Status": item.status,
      "Remarks": item.remarks
    }));

    const worksheet = xlsx.utils.json_to_sheet(formattedData);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, "Requirements");

    // Write to buffer
    const excelBuffer = xlsx.write(workbook, { bookType: "xlsx", type: "buffer" });

    res.set({
      "Content-Disposition": "attachment; filename=requirements.xlsx",
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    res.send(excelBuffer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/import", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(worksheet);

    let importCount = 0;

    for (const item of jsonData) {
      const requirementId = item["Requirement Id"] || "REQ-" + Date.now() + Math.floor(Math.random() * 1000);
      const description = item["Requirement Description"] || "";
      const development = item["Development"] || "Pending";
      const testing = item["Testing"] || "Pending";
      const reporting = item["Reporting"] || "Pending";
      const deployment = item["Deployment"] || "Pending";
      const usage = item["Usage"] || "Pending";
      const status = item["Status"] || "Not Started";
      const remarks = item["Remarks"] || "";

      // Try to insert, ignore if duplicates (or implement update logic)
      try {
        await req.pool.query(
          `INSERT INTO requirements (requirement_id, description, development, testing, reporting, deployment, usage, status, remarks) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
           ON CONFLICT (requirement_id) DO NOTHING`,
          [requirementId, description, development, testing, reporting, deployment, usage, status, remarks]
        );
        importCount++;
      } catch (e) {
        console.error("Error inserting row:", e);
      }
    }

    res.json({ message: "Import successful", count: importCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await req.pool.query("DELETE FROM requirements WHERE id = $1", [req.params.id]);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
