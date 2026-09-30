const express = require("express");
const authMiddleware = require("../middlewares/authMiddelware");
const { createCampController, getCampsController } = require("../controllers/campController");

const router = express.Router();

// CREATE CAMP || POST
router.post("/create", authMiddleware, createCampController);

// GET CAMPS || GET
router.get("/get-all", authMiddleware, getCampsController);

module.exports = router;
