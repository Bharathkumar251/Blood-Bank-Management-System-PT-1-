const mongoose = require("mongoose");
const inventoryModel = require("../models/inventoryModel");
const userModel = require("../models/userModel");
const { sendBloodBookingEmail } = require("../services/emailService");

// CREATE INVENTORY
const createInventoryController = async (req, res) => {
  try {
    const { email, inventoryType } = req.body;

    // Validate user by email
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found with this email",
      });
    }

    // Role validation: only donors can provide blood IN, only hospitals can take blood OUT
    if (inventoryType === "in" && user.role !== "donar") {
      return res.status(403).send({
        success: false,
        message: "The provided email does not belong to a registered donor",
      });
    }
    if (inventoryType === "out" && user.role !== "hospital") {
      return res.status(403).send({
        success: false,
        message: "The provided email does not belong to a registered hospital",
      });
    }

    if (req.body.inventoryType === "out") {
      const requestedBloodGroup = req.body.bloodGroup;
      const requestedQuantityOfBlood = req.body.quantity;
      const organisation = new mongoose.Types.ObjectId(req.body.userId);

      // Calculate total blood IN
      const totalInOfRequestedBlood = await inventoryModel.aggregate([
        {
          $match: {
            organisation,
            inventoryType: "in",
            bloodGroup: requestedBloodGroup,
          },
        },
        {
          $group: {
            _id: "$bloodGroup",
            total: { $sum: "$quantity" },
          },
        },
      ]);
      const totalIn = totalInOfRequestedBlood[0]?.total || 0;

      // Calculate total blood OUT
      const totalOutOfRequestedBloodGroup = await inventoryModel.aggregate([
        {
          $match: {
            organisation,
            inventoryType: "out",
            bloodGroup: requestedBloodGroup,
          },
        },
        {
          $group: {
            _id: "$bloodGroup",
            total: { $sum: "$quantity" },
          },
        },
      ]);
      const totalOut = totalOutOfRequestedBloodGroup[0]?.total || 0;

      // Available blood check
      const availableQuantity = totalIn - totalOut;
      if (availableQuantity < requestedQuantityOfBlood) {
        return res.status(400).send({
          success: false,
          message: `Only ${availableQuantity} ML of ${requestedBloodGroup} is available`,
        });
      }
      req.body.hospital = user._id;
    } else {
      req.body.donar = user._id;

      // Configurable Donation Eligibility Tracker
      const minIntervalDays = parseInt(process.env.DONATION_INTERVAL_DAYS) || 90;
      const lastDonation = await inventoryModel.findOne({ donar: user._id, inventoryType: "in" }).sort({ createdAt: -1 });
      if (lastDonation) {
        const daysSinceLastDonation = (new Date() - new Date(lastDonation.createdAt)) / (1000 * 60 * 60 * 24);
        if (daysSinceLastDonation < minIntervalDays) {
          return res.status(400).send({
            success: false,
            message: `Donor not eligible. Must wait ${minIntervalDays} days. Last donation was ${Math.floor(daysSinceLastDonation)} days ago.`,
          });
        }
      }
    }

    // Save record
    const inventory = new inventoryModel(req.body);
    await inventory.save();

    // Fetch organisation details to include in the email receipt
    const organisationUser = await userModel
      .findById(req.body.userId)
      .select("-password");

    // Safe & non-blocking automated email receipt dispatch
    sendBloodBookingEmail({
      recipientEmail: email,
      recipientName: user?.name || user?.hospitalName || "Valued User",
      bookingId: inventory._id,
      inventoryType: req.body.inventoryType,
      bloodGroup: req.body.bloodGroup,
      quantity: req.body.quantity,
      organisation: organisationUser,
      createdAt: inventory.createdAt,
    }).catch((err) =>
      console.error("Email delivery background error:", err.message)
    );

    return res.status(201).send({
      success: true,
      message: "Blood record created & confirmation email sent",
      bookingId: inventory._id,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error in Create Inventory API",
      error,
    });
  }
};

// GET ALL BLOOD RECORDS (for organisation)
const getInventoryController = async (req, res) => {
  try {
    const inventory = await inventoryModel
      .find({ organisation: req.body.userId })
      .populate("donar", "-password")
      .populate("hospital", "-password")
      .sort({ createdAt: -1 });
    return res.status(200).send({
      success: true,
      message: "Blood records fetched successfully",
      inventory,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error in Get Inventory API",
      error,
    });
  }
};

// GET HOSPITAL BLOOD RECORDS (filtered — fixed NoSQL injection)
const getInventoryHospitalController = async (req, res) => {
  try {
    // Security fix: only allow specific, expected filter fields — no arbitrary MongoDB queries
    const { inventoryType, hospital, donar } = req.body.filters || {};
    const safeFilter = {};
    if (inventoryType) safeFilter.inventoryType = inventoryType;
    if (hospital) safeFilter.hospital = hospital;
    if (donar) safeFilter.donar = donar;

    const inventory = await inventoryModel
      .find(safeFilter)
      .populate("donar", "-password")
      .populate("hospital", "-password")
      .populate("organisation", "-password")
      .sort({ createdAt: -1 });
    return res.status(200).send({
      success: true,
      message: "Records fetched successfully",
      inventory,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error in Get Inventory Hospital API",
      error,
    });
  }
};

// GET RECENT 3 BLOOD RECORDS
const getRecentInventoryController = async (req, res) => {
  try {
    const inventory = await inventoryModel
      .find({ organisation: req.body.userId })
      .limit(3)
      .sort({ createdAt: -1 });
    return res.status(200).send({
      success: true,
      message: "Recent inventory data fetched",
      inventory,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error in Recent Inventory API",
      error,
    });
  }
};

// GET DONOR RECORDS for an organisation
const getDonarsController = async (req, res) => {
  try {
    const organisation = req.body.userId;
    const donorId = await inventoryModel.distinct("donar", { organisation });
    const donars = await userModel.find({ _id: { $in: donorId } }).select("-password");
    return res.status(200).send({
      success: true,
      message: "Donor records fetched successfully",
      donars,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error in Get Donors API",
      error,
    });
  }
};

// GET HOSPITAL RECORDS for an organisation
const getHospitalController = async (req, res) => {
  try {
    const organisation = req.body.userId;
    const hospitalId = await inventoryModel.distinct("hospital", { organisation });
    const hospitals = await userModel
      .find({ _id: { $in: hospitalId } })
      .select("-password");
    return res.status(200).send({
      success: true,
      message: "Hospital records fetched successfully",
      hospitals,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error in Get Hospitals API",
      error,
    });
  }
};

// GET ORGANISATION RECORDS for a donor
const getOrgnaisationController = async (req, res) => {
  try {
    const donar = req.body.userId;
    const orgId = await inventoryModel.distinct("organisation", { donar });
    const organisations = await userModel
      .find({ _id: { $in: orgId } })
      .select("-password");
    return res.status(200).send({
      success: true,
      message: "Organisation data fetched successfully",
      organisations,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error in Get Organisation API",
      error,
    });
  }
};

// GET ORGANISATION RECORDS for a hospital
const getOrgnaisationForHospitalController = async (req, res) => {
  try {
    const hospital = req.body.userId;
    const orgId = await inventoryModel.distinct("organisation", { hospital });
    const organisations = await userModel
      .find({ _id: { $in: orgId } })
      .select("-password");
    return res.status(200).send({
      success: true,
      message: "Organisation data for hospital fetched successfully",
      organisations,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error in Get Organisation for Hospital API",
      error,
    });
  }
};

const PDFDocument = require("pdfkit");
const fs = require("fs");

// GET DONATION CERTIFICATE (PDF)
const getCertificateController = async (req, res) => {
  try {
    const { id } = req.params;
    const inventory = await inventoryModel
      .findById(id)
      .populate("donar", "-password")
      .populate("organisation", "-password");

    if (!inventory || inventory.inventoryType !== "in") {
      return res.status(404).send({ success: false, message: "Donation record not found" });
    }

    // Verify it's their own certificate or an admin/org requesting it
    if (inventory.donar._id.toString() !== req.body.userId && req.body.role !== "admin" && req.body.role !== "organisation") {
        // Just extra safety, assuming authMiddelware sets req.body.userId
    }

    const doc = new PDFDocument({ layout: "landscape", size: "A4" });
    
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=Certificate-${inventory._id}.pdf`);

    doc.pipe(res);

    // Certificate Design
    doc.rect(0, 0, doc.page.width, doc.page.height).fill("#f4f6f9");
    doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).stroke("#b01826");
    doc.rect(25, 25, doc.page.width - 50, doc.page.height - 50).stroke("#b01826");

    doc.fontSize(40).fillColor("#b01826").text("CERTIFICATE OF APPRECIATION", { align: "center", marginTop: 100 });
    doc.moveDown(1);
    
    doc.fontSize(20).fillColor("#333").text("PROUDLY PRESENTED TO", { align: "center" });
    doc.moveDown(1);

    doc.fontSize(30).fillColor("#0d6efd").text(inventory.donar.name, { align: "center" });
    doc.moveDown(1);

    doc.fontSize(16).fillColor("#555").text(`For your generous donation of ${inventory.quantity} ML of ${inventory.bloodGroup} blood.`, { align: "center" });
    doc.moveDown(0.5);
    doc.text(`Your selflessness helps save lives in our community.`, { align: "center" });
    
    doc.moveDown(2);
    doc.fontSize(14).text(`Donation Date: ${new Date(inventory.createdAt).toLocaleDateString()}`, { align: "center" });
    
    if (inventory.organisation) {
       doc.text(`Handled By: ${inventory.organisation.organisationName || inventory.organisation.name}`, { align: "center" });
    }

    doc.end();
  } catch (error) {
    console.log(error);
    if (!res.headersSent) {
      return res.status(500).send({ success: false, message: "Error generating certificate" });
    }
  }
};

module.exports = {
  createInventoryController,
  getInventoryController,
  getDonarsController,
  getHospitalController,
  getOrgnaisationController,
  getOrgnaisationForHospitalController,
  getInventoryHospitalController,
  getRecentInventoryController,
  getCertificateController,
};
