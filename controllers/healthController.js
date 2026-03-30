const getHealth = (req, res) => {
  res.json({ status: "ok", message: "Server is healthy" });
};

module.exports = { getHealth };
