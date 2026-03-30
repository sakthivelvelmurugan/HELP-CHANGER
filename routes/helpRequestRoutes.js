const express = require("express");
const {
  createHelpRequest,
  listHelpRequests,
  acceptHelpRequest,
  completeHelpRequest
} = require("../controllers/helpRequestController");

const router = express.Router();

router.post("/", createHelpRequest);
router.get("/", listHelpRequests);
router.patch("/:id/accept", acceptHelpRequest);
router.patch("/:id/complete", completeHelpRequest);

module.exports = router;
