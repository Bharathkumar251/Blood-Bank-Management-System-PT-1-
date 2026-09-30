const mongoose = require("mongoose");

const sosSchema = new mongoose.Schema(
  {
    bloodGroup: {
      type: String,
      required: [true, "Blood group is required"],
      enum: ["O+", "O-", "AB+", "AB-", "A+", "A-", "B+", "B-"],
    },
    quantity: {
      type: Number,
      required: [true, "Blood quantity is required"],
    },
    requesterName: {
      type: String,
      required: [true, "Requester name is required"],
    },
    contactPhone: {
      type: String,
      required: [true, "Contact phone is required"],
    },
    location: {
      type: String,
      required: [true, "Location/Hospital name is required"],
    },
    status: {
      type: String,
      enum: ["pending", "resolved"],
      default: "pending",
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SOS", sosSchema);
