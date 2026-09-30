const express = require("express");
const authMiddleware = require("../middlewares/authMiddelware");
const { chatController } = require("../controllers/aiController");

const router = express.Router();

// CHAT || POST
router.post("/chat", authMiddleware, chatController);

module.exports = router;
