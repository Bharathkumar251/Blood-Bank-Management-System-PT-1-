const userModel = require("../models/userModel");
const inventoryModel = require("../models/inventoryModel");

// GET DONOR LIST
const getDonarsListController = async (req, res) => {
  try {
    const donarData = await userModel
      .find({ role: "donar" })
      .select("-password")
      .sort({ createdAt: -1 });
    return res.status(200).send({
      success: true,
      totalCount: donarData.length,
      message: "Donor list fetched successfully",
      donarData,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error in Donor List API",
      error,
    });
  }
};

// GET HOSPITAL LIST
const getHospitalListController = async (req, res) => {
  try {
    const hospitalData = await userModel
      .find({ role: "hospital" })
      .select("-password")
      .sort({ createdAt: -1 });
    return res.status(200).send({
      success: true,
      totalCount: hospitalData.length,
      message: "Hospital list fetched successfully",
      hospitalData,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error in Hospital List API",
      error,
    });
  }
};

// GET ORGANISATION LIST
const getOrgListController = async (req, res) => {
  try {
    const orgData = await userModel
      .find({ role: "organisation" })
      .select("-password")
      .sort({ createdAt: -1 });
    return res.status(200).send({
      success: true,
      totalCount: orgData.length,
      message: "Organisation list fetched successfully",
      orgData,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error in Organisation List API",
      error,
    });
  }
};

// DELETE USER (donor, hospital, or organisation) + their inventory records
const deleteDonarController = async (req, res) => {
  try {
    const userId = req.params.id;

    // Also remove all inventory records linked to this user to avoid orphaned data
    await inventoryModel.deleteMany({
      $or: [{ donar: userId }, { hospital: userId }, { organisation: userId }],
    });

    await userModel.findByIdAndDelete(userId);

    return res.status(200).send({
      success: true,
      message: "Record deleted successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error while deleting record",
      error,
    });
  }
};

module.exports = {
  getDonarsListController,
  getHospitalListController,
  getOrgListController,
  deleteDonarController,
};
