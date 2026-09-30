import moment from "moment";
import React, { useEffect, useState } from "react";
import Layout from "../components/shared/Layout/Layout";
import API from "../services/API";
import { useSelector } from "react-redux";

const Donation = () => {
  const { user } = useSelector((state) => state.auth);
  const [data, setData] = useState([]);
  
  //find donar records
  const getDonars = async () => {
    try {
      const { data } = await API.post("/inventory/get-inventory-hospital", {
        filters: {
          inventoryType: "in",
          donar: user?._id,
        },
      });
      if (data?.success) {
        setData(data?.inventory);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getDonars();
  }, []);

  const handleDownloadCertificate = async (id) => {
    try {
      const response = await API.get(`/inventory/certificate/${id}`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Certificate-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.log("Failed to download certificate", error);
      alert("Failed to download certificate");
    }
  };

  return (
    <Layout>
      <div className="container mt-4">
        <h4 className="mb-3 text-success">My Donation History</h4>
        <table className="table">
          <thead>
            <tr>
              <th scope="col">Blood Group</th>
              <th scope="col">Inventory Type</th>
              <th scope="col">Quantity</th>
              <th scope="col">Email</th>
              <th scope="col">Date</th>
              <th scope="col">Action</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((record) => (
              <tr key={record._id}>
                <td>{record.bloodGroup}</td>
                <td>{record.inventoryType}</td>
                <td>{record.quantity} ML</td>
                <td>{record.email}</td>
                <td>{moment(record.createdAt).format("DD/MM/YYYY hh:mm A")}</td>
                <td>
                   <button 
                     className="btn btn-sm btn-outline-danger" 
                     onClick={() => handleDownloadCertificate(record._id)}
                   >
                     Download Certificate
                   </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
};

export default Donation;
