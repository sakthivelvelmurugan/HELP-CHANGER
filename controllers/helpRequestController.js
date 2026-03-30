const mongoose = require("mongoose");
const HelpRequest = require("../models/HelpRequest");

const sendServerError = (res) => res.status(500).json({ message: "Something went wrong" });

const createHelpRequest = async (req, res) => {
  try {
    const { title, description, location } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: "Title and description are required" });
    }

    const cleanTitle = title.trim();
    const cleanDescription = description.trim();

    if (!cleanTitle || !cleanDescription) {
      return res.status(400).json({ message: "Title and description cannot be empty" });
    }

    const helpRequest = await HelpRequest.create({
      title: cleanTitle,
      description: cleanDescription,
      location: location ? location.trim() : ""
    });

    return res.status(201).json({ message: "Request created", data: helpRequest });
  } catch (error) {
    return sendServerError(res);
  }
};

const listHelpRequests = async (req, res) => {
  try {
    const helpRequests = await HelpRequest.find().sort({ createdAt: -1 });
    return res.status(200).json({ data: helpRequests });
  } catch (error) {
    return sendServerError(res);
  }
};

const acceptHelpRequest = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid request id" });
    }

    const helpRequest = await HelpRequest.findById(id);
    if (!helpRequest) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (helpRequest.status !== "open") {
      return res.status(400).json({ message: "Only open requests can be accepted" });
    }

    helpRequest.status = "accepted";
    await helpRequest.save();

    return res.status(200).json({ message: "Request accepted", data: helpRequest });
  } catch (error) {
    return sendServerError(res);
  }
};

const completeHelpRequest = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid request id" });
    }

    const helpRequest = await HelpRequest.findById(id);
    if (!helpRequest) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (helpRequest.status !== "accepted") {
      return res.status(400).json({ message: "Only accepted requests can be completed" });
    }

    helpRequest.status = "completed";
    await helpRequest.save();

    return res.status(200).json({ message: "Request marked as completed", data: helpRequest });
  } catch (error) {
    return sendServerError(res);
  }
};

module.exports = {
  createHelpRequest,
  listHelpRequests,
  acceptHelpRequest,
  completeHelpRequest
};
