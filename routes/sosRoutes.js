const express = require("express");
const authMiddleware = require("../middlewares/authMiddelware");
const {
  createSosController,
  getActiveSosController,
  resolveSosController,
} = require("../controllers/sosController");

const router = express.Router();

// CREATE SOS || POST
router.post("/create", authMiddleware, createSosController);

// GET ACTIVE SOS || GET
router.get("/active", authMiddleware, getActiveSosController);

// RESOLVE SOS || PUT
router.put("/resolve/:id", authMiddleware, resolveSosController);

module.exports = router;
