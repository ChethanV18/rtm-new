import React, { useEffect, useState } from "react";
import axios from "axios";
import "./index.css";

function App() {
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get("https://rtm-new.onrender.com/requirements");
      setRequirements(res.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const addRequirement = async () => {
    const newReq = {
      requirementId: "REQ-" + Date.now().toString().slice(-6),
      description: "New Requirement",
      development: "Pending",
      testing: "Pending",
      reporting: "Pending",
      deployment: "Pending",
      usage: "Pending",
      status: "Not Started",
      remarks: ""
    };

    await axios.post("https://rtm-new.onrender.com/requirements", newReq);
    fetchData();
  };

  const handleExport = async () => {
    window.location.href = "https://rtm-new.onrender.com/requirements/export";
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      await axios.post("https://rtm-new.onrender.com/requirements/import", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      fetchData();
    } catch (error) {
      console.error("Error importing file:", error);
      alert("Failed to import. Please check file format.");
    }
    e.target.value = null; // reset file input
  };

  const updateRequirement = async (id, field, value) => {
    // Optimistic update
    setRequirements((prev) =>
      prev.map(r => r._id === id ? { ...r, [field]: value } : r)
    );
    try {
      await axios.put(`http://localhost:5000/requirements/${id}`, { [field]: value });
    } catch (error) {
      console.error("Failed to update:", error);
      fetchData(); // Rollback on failure
    }
  };

  const deleteRequirement = async (id) => {
    if (!window.confirm("Are you sure you want to delete this requirement?")) return;
    try {
      await axios.delete(`http://localhost:5000/requirements/${id}`);
      fetchData();
    } catch (error) {
      console.error("Failed to delete:", error);
    }
  };

  const phaseOptions = ["✔️", "❌", "Pending"];
  const statusOptions = ["In Progress", "Complete", "Not Started"];

  const getPhaseClass = (val) => {
    if (val === "✔️") return "phase-Tick";
    if (val === "❌") return "phase-X";
    if (val === "Pending") return "phase-Pending";
    return "";
  };

  const getStatusClass = (val) => {
    return `status-${val.replace(/\s+/g, '-')}`;
  };

  const renderPhaseDropdown = (req, field) => (
    <select
      className={`phase-select ${getPhaseClass(req[field])}`}
      value={req[field]}
      onChange={(e) => updateRequirement(req._id, field, e.target.value)}
    >
      {phaseOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  );

  const renderStatusDropdown = (req, field) => (
    <select
      className={`status-select ${getStatusClass(req[field])}`}
      value={req[field]}
      onChange={(e) => updateRequirement(req._id, field, e.target.value)}
    >
      {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  );

  return (
    <div className="dashboard-container">
      <div className="header">
        <h1>Requirements Traceability</h1>
        <div className="actions">
          <label className="btn btn-secondary file-input-wrapper">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
            Import
            <input type="file" accept=".xlsx, .xls" onChange={handleImport} />
          </label>
          <button className="btn btn-secondary" onClick={handleExport}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 16 12 21 17 16"></polyline><line x1="12" y1="12" x2="12" y2="21"></line></svg>
            Export
          </button>
          <button className="btn" onClick={addRequirement}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Add Requirement
          </button>
        </div>
      </div>

      <div className="table-container">
        {loading ? (
          <div className="empty-state">Loading data...</div>
        ) : requirements.length === 0 ? (
          <div className="empty-state">No requirements found. Click "Add Requirement" to get started.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th style={{ width: '25%' }}>Description</th>
                <th style={{ textAlign: 'center' }}>Dev</th>
                <th style={{ textAlign: 'center' }}>Test</th>
                <th style={{ textAlign: 'center' }}>Report</th>
                <th style={{ textAlign: 'center' }}>Deploy</th>
                <th style={{ textAlign: 'center' }}>Usage</th>
                <th style={{ width: '20%' }}>Remarks</th>
                <th>Status</th>
                <th style={{ textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {requirements.map(r => (
                <tr key={r._id}>
                  <td><span className="id-badge">{r.requirementId}</span></td>
                  <td>
                    <input
                      type="text"
                      value={r.description}
                      onChange={(e) => updateRequirement(r._id, "description", e.target.value)}
                      placeholder="Req description..."
                    />
                  </td>
                  <td style={{ textAlign: 'center' }}>{renderPhaseDropdown(r, "development")}</td>
                  <td style={{ textAlign: 'center' }}>{renderPhaseDropdown(r, "testing")}</td>
                  <td style={{ textAlign: 'center' }}>{renderPhaseDropdown(r, "reporting")}</td>
                  <td style={{ textAlign: 'center' }}>{renderPhaseDropdown(r, "deployment")}</td>
                  <td style={{ textAlign: 'center' }}>{renderPhaseDropdown(r, "usage")}</td>
                  <td>
                    <input
                      type="text"
                      style={{ minWidth: "150px" }}
                      value={r.remarks}
                      onChange={(e) => updateRequirement(r._id, "remarks", e.target.value)}
                      placeholder="Add remarks..."
                    />
                  </td>
                  <td>{renderStatusDropdown(r, "status")}</td>
                  <td style={{ textAlign: 'center' }}>
                    <button className="delete-btn" onClick={() => deleteRequirement(r._id)} title="Delete">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default App;
