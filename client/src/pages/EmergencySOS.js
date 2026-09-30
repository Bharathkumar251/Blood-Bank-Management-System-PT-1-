import React, { useState, useEffect } from "react";
import Layout from "../components/shared/Layout/Layout";
import API from "../services/API";
import { toast } from "react-toastify";

const EmergencySOS = () => {
  const [sosList, setSosList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    bloodGroup: "",
    quantity: "",
    requesterName: "",
    contactPhone: "",
    location: "",
  });

  const getActiveSos = async () => {
    try {
      setLoading(true);
      const { data } = await API.get("/sos/active");
      if (data?.success) {
        setSosList(data.sosList);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch SOS requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getActiveSos();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.post("/sos/create", formData);
      if (data?.success) {
        toast.success("Emergency SOS broadcasted!");
        setFormData({ bloodGroup: "", quantity: "", requesterName: "", contactPhone: "", location: "" });
        getActiveSos();
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to broadcast SOS");
    }
  };

  const handleResolve = async (id) => {
    try {
      const { data } = await API.put(`/sos/resolve/${id}`);
      if (data?.success) {
        toast.success("SOS resolved successfully");
        getActiveSos();
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to resolve SOS or you don't have permission");
    }
  };

  return (
    <Layout>
      <div className="container p-4">
        <h3 className="text-danger fw-bold mb-4">🚨 Emergency Blood SOS</h3>
        <div className="row">
          <div className="col-md-5">
            <div className="card p-4 shadow-sm border-0" style={{ backgroundColor: "#fff5f5" }}>
              <h5 className="mb-3 text-danger">Broadcast an Emergency</h5>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-bold">Blood Group Required</label>
                  <select name="bloodGroup" className="form-select" value={formData.bloodGroup} onChange={handleChange} required>
                    <option value="">Select Blood Group</option>
                    {["O+", "O-", "AB+", "AB-", "A+", "A-", "B+", "B-"].map((bg) => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold">Quantity Needed (ML)</label>
                  <input type="number" name="quantity" className="form-control" value={formData.quantity} onChange={handleChange} required />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold">Requester Name / Patient Name</label>
                  <input type="text" name="requesterName" className="form-control" value={formData.requesterName} onChange={handleChange} required />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold">Contact Phone</label>
                  <input type="text" name="contactPhone" className="form-control" value={formData.contactPhone} onChange={handleChange} required />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold">Hospital Name & Location</label>
                  <textarea name="location" className="form-control" rows="2" value={formData.location} onChange={handleChange} required></textarea>
                </div>
                <button type="submit" className="btn btn-danger w-100 fw-bold">BROADCAST SOS 🚨</button>
              </form>
            </div>
          </div>
          <div className="col-md-7">
            <h5 className="mb-3">Active Emergency Requests</h5>
            {loading ? (
              <p>Loading...</p>
            ) : sosList.length === 0 ? (
              <p className="text-muted">No active SOS requests at the moment.</p>
            ) : (
              sosList.map((sos) => (
                <div key={sos._id} className="card p-3 mb-3 border-danger border-2 shadow-sm">
                  <div className="d-flex justify-content-between align-items-start">
                    <span className="badge bg-danger fs-6">{sos.bloodGroup}</span>
                    <small className="text-muted">{new Date(sos.createdAt).toLocaleString()}</small>
                  </div>
                  <h5 className="mt-2 fw-bold">{sos.requesterName} Needs {sos.quantity} ML</h5>
                  <p className="mb-1 text-muted">🏥 <strong>Location:</strong> {sos.location}</p>
                  <p className="mb-2 text-muted">📞 <strong>Contact:</strong> {sos.contactPhone}</p>
                  
                  <div className="d-flex justify-content-end">
                    <button className="btn btn-sm btn-outline-success fw-bold" onClick={() => handleResolve(sos._id)}>Mark as Resolved ✔</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EmergencySOS;
