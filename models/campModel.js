const mongoose = require("mongoose");

const campSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Camp name is required"],
    },
    date: {
      type: Date,
      required: [true, "Camp date is required"],
    },
    location: {
      type: String,
      required: [true, "Camp location is required"],
    },
    description: {
      type: String,
    },
    organiser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: [true, "Organiser is required"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Camps", campSchema);
