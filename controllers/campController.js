const campModel = require("../models/campModel");

// CREATE CAMP
const createCampController = async (req, res) => {
  try {
    const { name, date, location, description } = req.body;
    if (!name || !date || !location) {
      return res.status(400).send({
        success: false,
        message: "Please provide all required fields",
      });
    }

    const camp = new campModel({
      name,
      date,
      location,
      description,
      organiser: req.body.userId,
    });
    await camp.save();

    return res.status(201).send({
      success: true,
      message: "Blood Donation Camp created successfully",
      camp,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error creating camp",
      error,
    });
  }
};

// GET ALL CAMPS (Upcoming)
const getCampsController = async (req, res) => {
  try {
    const camps = await campModel
      .find({ date: { $gte: new Date() } })
      .populate("organiser", "name email phone organisationName")
      .sort({ date: 1 });

    return res.status(200).send({
      success: true,
      message: "Upcoming camps fetched successfully",
      camps,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error fetching camps",
      error,
    });
  }
};

module.exports = { createCampController, getCampsController };
