
const express = require("express");
const router = express.Router();
const multer = require("multer");
const xlsx = require("xlsx");
const Requirement = require("../models/Requirement");

const upload = multer({ storage: multer.memoryStorage() });

router.get("/", async (req, res) => {
  const data = await Requirement.find();
  res.json(data);
});

router.post("/", async (req, res) => {
  const newReq = new Requirement(req.body);
  await newReq.save();
  res.json(newReq);
});

router.put("/:id", async (req, res) => {
  const updated = await Requirement.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

router.get("/export", async (req, res) => {
  try {
    const data = await Requirement.find().lean();
    if (!data.length) return res.status(404).json({ message: "No data found" });

    // Prepare data for Excel
    const formattedData = data.map(item => ({
      "Requirement Id": item.requirementId,
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

    const formattedData = jsonData.map(item => ({
      requirementId: item["Requirement Id"] || "REQ-" + Date.now() + Math.floor(Math.random() * 1000),
      description: item["Requirement Description"] || "",
      development: item["Development"] || "Pending",
      testing: item["Testing"] || "Pending",
      reporting: item["Reporting"] || "Pending",
      deployment: item["Deployment"] || "Pending",
      usage: item["Usage"] || "Pending",
      status: item["Status"] || "Not Started",
      remarks: item["Remarks"] || ""
    }));

    await Requirement.insertMany(formattedData);
    res.json({ message: "Import successful", count: formattedData.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  await Requirement.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

module.exports = router;
