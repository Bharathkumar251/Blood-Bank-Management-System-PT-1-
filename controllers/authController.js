const userModel = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendRegistrationWelcomeEmail } = require("../services/emailService");
const { sendSmsNotification } = require("../services/smsService");

// REGISTER
const registerController = async (req, res) => {
  try {
    const existingUser = await userModel.findOne({ email: req.body.email });
    // Validation: duplicate user
    if (existingUser) {
      return res.status(409).send({
        success: false,
        message: "User already exists with this email",
      });
    }
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    req.body.password = hashedPassword;
    // Save user
    const user = new userModel(req.body);
    await user.save();

    // Send Welcome & Account Verification email asynchronously (safe & non-blocking)
    const displayName =
      user.name || user.hospitalName || user.organisationName || "New Member";
    sendRegistrationWelcomeEmail({
      recipientEmail: user.email,
      name: displayName,
      role: user.role,
      phone: user.phone,
      address: user.address,
      userId: user._id,
      createdAt: user.createdAt,
    }).catch((err) =>
      console.error("Welcome email delivery background error:", err.message)
    );

    return res.status(201).send({
      success: true,
      message: `User registered successfully! Verification email dispatched to ${user.email} & notification linked to ${user.phone}`,
      // Security: never return password in response
      user: {
        _id: user._id,
        role: user.role,
        name: user.name,
        organisationName: user.organisationName,
        hospitalName: user.hospitalName,
        email: user.email,
        website: user.website,
        address: user.address,
        phone: user.phone,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Register API",
      error,
    });
  }
};

// LOGIN
const loginController = async (req, res) => {
  try {
    const user = await userModel.findOne({ email: req.body.email });
    if (!user) {
      return res.status(401).send({
        success: false,
        message: "Invalid credentials",
      });
    }
    // Check role matches
    if (user.role !== req.body.role) {
      return res.status(401).send({
        success: false,
        message: "Invalid credentials: role does not match",
      });
    }
    // Compare password
    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) {
      return res.status(401).send({
        success: false,
        message: "Invalid credentials",
      });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    return res.status(200).send({
      success: true,
      message: "Login successful",
      token,
      // Security: never return password in response
      user: {
        _id: user._id,
        role: user.role,
        name: user.name,
        organisationName: user.organisationName,
        hospitalName: user.hospitalName,
        email: user.email,
        website: user.website,
        address: user.address,
        phone: user.phone,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Login API",
      error,
    });
  }
};

// GET CURRENT USER
const currentUserController = async (req, res) => {
  try {
    const user = await userModel
      .findOne({ _id: req.body.userId })
      .select("-password"); // Security: exclude password field
    return res.status(200).send({
      success: true,
      message: "User fetched successfully",
      user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Unable to get current user",
      error,
    });
  }
};

module.exports = { registerController, loginController, currentUserController };
