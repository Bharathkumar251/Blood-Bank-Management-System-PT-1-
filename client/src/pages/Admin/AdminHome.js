import React, { useEffect, useState } from "react";
import Layout from "../../components/shared/Layout/Layout";
import { useSelector } from "react-redux";
import API from "../../services/API";

const AdminHome = () => {
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState({
    donors: 0,
    hospitals: 0,
    organisations: 0,
  });

  // Fetch counts for the dashboard summary
  const fetchStats = async () => {
    try {
      const [donorRes, hospitalRes, orgRes] = await Promise.all([
        API.get("/admin/donar-list"),
        API.get("/admin/hospital-list"),
        API.get("/admin/org-list"),
      ]);
      setStats({
        donors: donorRes.data?.totalCount || 0,
        hospitals: hospitalRes.data?.totalCount || 0,
        organisations: orgRes.data?.totalCount || 0,
      });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <Layout>
      <div className="container mt-4">
        <div className="d-flex flex-column">
          <h1>
            Welcome, Admin <i className="text-success">{user?.name}</i>
          </h1>
          <h5 className="text-muted">Blood Bank Management System</h5>
          <hr />

          {/* Summary cards */}
          <div className="row mt-3">
            <div className="col-md-4 mb-3">
              <div className="card border-danger text-center p-3">
                <div className="card-body">
                  <h2 className="text-danger">{stats.donors}</h2>
                  <p className="card-text fw-bold">Total Donors</p>
                  <a href="/donar-list" className="btn btn-outline-danger btn-sm">
                    View Donors
                  </a>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-3">
              <div className="card border-primary text-center p-3">
                <div className="card-body">
                  <h2 className="text-primary">{stats.hospitals}</h2>
                  <p className="card-text fw-bold">Total Hospitals</p>
                  <a
                    href="/hospital-list"
                    className="btn btn-outline-primary btn-sm"
                  >
                    View Hospitals
                  </a>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-3">
              <div className="card border-success text-center p-3">
                <div className="card-body">
                  <h2 className="text-success">{stats.organisations}</h2>
                  <p className="card-text fw-bold">Total Organisations</p>
                  <a href="/org-list" className="btn btn-outline-success btn-sm">
                    View Organisations
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="alert alert-info mt-3" role="alert">
            <strong>Admin Panel</strong> — Use the sidebar to manage donors,
            hospitals, and organisations. You can view and delete records from
            the respective list pages.
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminHome;
