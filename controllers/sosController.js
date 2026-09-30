const sosModel = require("../models/sosModel");
const userModel = require("../models/userModel");

// CREATE NEW SOS
const createSosController = async (req, res) => {
  try {
    const { bloodGroup, quantity, requesterName, contactPhone, location } = req.body;
    
    if (!bloodGroup || !quantity || !requesterName || !contactPhone || !location) {
      return res.status(400).send({
        success: false,
        message: "All fields are required for an SOS",
      });
    }

    const sos = new sosModel({
      ...req.body,
      requestedBy: req.body.userId, // from auth middleware
    });
    await sos.save();

    return res.status(201).send({
      success: true,
      message: "Emergency SOS broadcasted successfully",
      sos,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error creating SOS request",
      error,
    });
  }
};

// GET ALL ACTIVE SOS
const getActiveSosController = async (req, res) => {
  try {
    const activeSos = await sosModel
      .find({ status: "pending" })
      .populate("requestedBy", "name email phone")
      .sort({ createdAt: -1 });

    return res.status(200).send({
      success: true,
      message: "Active SOS records fetched successfully",
      sosList: activeSos,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error fetching SOS records",
      error,
    });
  }
};

// MARK SOS AS RESOLVED
const resolveSosController = async (req, res) => {
  try {
    const { id } = req.params;
    const sos = await sosModel.findById(id);

    if (!sos) {
      return res.status(404).send({
        success: false,
        message: "SOS record not found",
      });
    }

    // Optional: Check if the user trying to resolve is the requester or an admin
    if (sos.requestedBy.toString() !== req.body.userId) {
       // Ideally we check if they are admin too, but for now we enforce requester
       const user = await userModel.findById(req.body.userId);
       if(user.role !== 'admin') {
           return res.status(403).send({
             success: false,
             message: "Only the requester or an admin can resolve this SOS",
           });
       }
    }

    sos.status = "resolved";
    await sos.save();

    return res.status(200).send({
      success: true,
      message: "SOS marked as resolved",
      sos,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error resolving SOS",
      error,
    });
  }
};

module.exports = {
  createSosController,
  getActiveSosController,
  resolveSosController,
};
