const express = require("express");
const { getHealth } = require("../controllers/healthController");
const authRoutes = require("./authRoutes");
const helpRequestRoutes = require("./helpRequestRoutes");

const router = express.Router();

router.get("/health", getHealth);
router.use("/auth", authRoutes);
router.use("/requests", helpRequestRoutes);

module.exports = router;