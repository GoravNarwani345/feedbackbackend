const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: true,
      trim: true,
    },

    feedbackText: {
      type: String,
      required: true,
      trim: true,
    },

    Email: {
      type: String,
      required: true,
      trim: true,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },

    sentimentTag: {
      type: String,
      enum: ["Positive", "Neutral", "Negative"],
      default: "Neutral",
    },

    priorityScore: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Feedback", feedbackSchema);