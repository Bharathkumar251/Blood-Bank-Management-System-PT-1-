import React, { useEffect, useState } from "react";
import Layout from "./../../components/shared/Layout/Layout";
import moment from "moment";
import API from "../../services/API";
import { toast } from "react-toastify";

const DonarList = () => {
  const [data, setData] = useState([]);

  const getDonars = async () => {
    try {
      const { data } = await API.get("/admin/donar-list");
      if (data?.success) {
        setData(data?.donarData);
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to fetch donor list");
    }
  };

  useEffect(() => {
    getDonars();
  }, []);

  // Fixed: replaced window.prompt() with window.confirm() — cleaner UX
  const handelDelete = async (id) => {
    try {
      const confirmed = window.confirm(
        "Are you sure you want to delete this donor? This action cannot be undone."
      );
      if (!confirmed) return;
      const { data } = await API.delete(`/admin/delete-donar/${id}`);
      if (data?.success) {
        toast.success(data?.message);
        // Refresh list without full page reload
        setData((prev) => prev.filter((record) => record._id !== id));
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to delete donor");
    }
  };

  return (
    <Layout>
      <div className="container mt-3">
        <h4 className="mb-3">Donor List ({data.length})</h4>
        <table className="table table-bordered table-hover">
          <thead className="table-dark">
            <tr>
              <th scope="col">#</th>
              <th scope="col">Name</th>
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
                <td>{record.name || record.organisationName + " (ORG)"}</td>
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
          <p className="text-muted text-center">No donors found.</p>
        )}
      </div>
    </Layout>
  );
};

export default DonarList;
