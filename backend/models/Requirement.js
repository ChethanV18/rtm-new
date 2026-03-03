
const mongoose = require("mongoose");

const RequirementSchema = new mongoose.Schema({
  requirementId: String,
  description: String,
  development: { type: String, enum: ["✔️", "❌", "Pending"], default: "Pending" },
  testing: { type: String, enum: ["✔️", "❌", "Pending"], default: "Pending" },
  reporting: { type: String, enum: ["✔️", "❌", "Pending"], default: "Pending" },
  deployment: { type: String, enum: ["✔️", "❌", "Pending"], default: "Pending" },
  usage: { type: String, enum: ["✔️", "❌", "Pending"], default: "Pending" },
  status: { type: String, enum: ["In Progress", "Complete", "Not Started"], default: "Not Started" },
  remarks: { type: String, default: "" }
});

module.exports = mongoose.model("Requirement", RequirementSchema);
