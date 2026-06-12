const express = require("express");
const router = express.Router();

const {
  createFeedback,
  getAllFeedback,
} = require("./Controller");

router.post("/", createFeedback);
router.get("/", getAllFeedback);

module.exports = router;