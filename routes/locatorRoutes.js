const express = require("express");
const { getNearbyFacilitiesController } = require("../controllers/locatorController");

const router = express.Router();

// GET ALL NEARBY BLOOD BANKS & HOSPITALS
router.get("/facilities", getNearbyFacilitiesController);

module.exports = router;
