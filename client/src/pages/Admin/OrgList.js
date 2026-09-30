import React, { useEffect, useState } from "react";
import Layout from "../../components/shared/Layout/Layout";
import moment from "moment";
import API from "../../services/API";
import { toast } from "react-toastify";

const OrgList = () => {
  const [data, setData] = useState([]);

  const getOrgs = async () => {
    try {
      const { data } = await API.get("/admin/org-list");
      if (data?.success) {
        setData(data?.orgData);
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to fetch organisation list");
    }
  };

  useEffect(() => {
    getOrgs();
  }, []);

  // Fixed: window.prompt() → window.confirm(); in-state update instead of page reload
  const handelDelete = async (id) => {
    try {
      const confirmed = window.confirm(
        "Are you sure you want to delete this organisation? This action cannot be undone."
      );
      if (!confirmed) return;
      const { data } = await API.delete(`/admin/delete-donar/${id}`);
      if (data?.success) {
        toast.success(data?.message);
        setData((prev) => prev.filter((record) => record._id !== id));
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to delete organisation");
    }
  };

  return (
    <Layout>
      <div className="container mt-3">
        <h4 className="mb-3">Organisation List ({data.length})</h4>
        <table className="table table-bordered table-hover">
          <thead className="table-dark">
            <tr>
              <th scope="col">#</th>
              <th scope="col">Organisation Name</th>
              <th scope="col">Email</th>
              <th scope="col">Phone</th>
              <th scope="col">Date Joined</th>
              <th scope="col">Action</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((record, index) => (
              <tr key={record._id}>
                <td>{index + 1}</td>
                <td>{record.organisationName}</td>
                <td>{record.email}</td>
                <td>{record.phone}</td>
                <td>{moment(record.createdAt).format("DD/MM/YYYY hh:mm A")}</td>
                <td>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handelDelete(record._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {data.length === 0 && (
          <p className="text-muted text-center">No organisations found.</p>
        )}
      </div>
    </Layout>
  );
};

export default OrgList;
