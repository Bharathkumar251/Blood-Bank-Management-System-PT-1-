import React, { useState, useEffect } from "react";
import Layout from "../components/shared/Layout/Layout";
import API from "../services/API";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import moment from "moment";

const Camps = () => {
  const { user } = useSelector((state) => state.auth);
  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    date: "",
    location: "",
    description: "",
  });

  const getCamps = async () => {
    try {
      setLoading(true);
      const { data } = await API.get("/camps/get-all");
      if (data?.success) {
        setCamps(data.camps);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch camps");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCamps();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.post("/camps/create", formData);
      if (data?.success) {
        toast.success("Camp created successfully!");
        setFormData({ name: "", date: "", location: "", description: "" });
        getCamps();
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to create camp");
    }
  };

  return (
    <Layout>
      <div className="container p-4">
        <h3 className="text-primary fw-bold mb-4">🎪 Blood Donation Camps</h3>
        <div className="row">
          {(user?.role === "admin" || user?.role === "organisation") && (
            <div className="col-md-4">
              <div className="card p-4 shadow-sm border-0" style={{ backgroundColor: "#f0f8ff" }}>
                <h5 className="mb-3 text-primary">Organize a Camp</h5>
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Camp Name</label>
                    <input type="text" name="name" className="form-control" value={formData.name} onChange={handleChange} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Date & Time</label>
                    <input type="datetime-local" name="date" className="form-control" value={formData.date} onChange={handleChange} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Location</label>
                    <input type="text" name="location" className="form-control" value={formData.location} onChange={handleChange} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Description (Optional)</label>
                    <textarea name="description" className="form-control" rows="2" value={formData.description} onChange={handleChange}></textarea>
                  </div>
                  <button type="submit" className="btn btn-primary w-100 fw-bold">Create Camp</button>
                </form>
              </div>
            </div>
          )}
          
          <div className={user?.role === "admin" || user?.role === "organisation" ? "col-md-8" : "col-md-12"}>
            <h5 className="mb-3">Upcoming Camps</h5>
            {loading ? (
              <p>Loading...</p>
            ) : camps.length === 0 ? (
              <p className="text-muted">No upcoming camps scheduled.</p>
            ) : (
              <div className="row">
                {camps.map((camp) => (
                  <div key={camp._id} className="col-md-6 mb-3">
                    <div className="card p-3 border-primary border-2 shadow-sm">
                      <h5 className="mt-2 fw-bold text-primary">{camp.name}</h5>
                      <p className="mb-1 text-muted">📍 <strong>Location:</strong> {camp.location}</p>
                      <p className="mb-1 text-muted">📅 <strong>Date:</strong> {moment(camp.date).format("MMMM Do YYYY, h:mm a")}</p>
                      <p className="mb-2 text-muted">🏢 <strong>Organiser:</strong> {camp.organiser?.organisationName || camp.organiser?.name || "Unknown"}</p>
                      {camp.description && <p className="mb-2 small">{camp.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Camps;
