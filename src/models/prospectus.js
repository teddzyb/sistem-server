const mongoose = require("mongoose");

const prospectusSchema = new mongoose.Schema(
  {
    program: {
      type: String,
    },
    effectiveYear: {
      type: String,
    },
    courses: [
      {
        year: {
          type: String,
        },
        semester: {
          type: String,
        },
        courseCode: {
          type: String,
        },
        courseDesc: {
          type: String,
        },
        isLab: {
          type: Boolean,
          default: false,
        },
        units: {
          type: Number,
        },
        equivalents: [
          {
            type: String,
          },
        ],
        requisites: [
          {
            type: String,
          },
        ],
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Prospectus = mongoose.model("Prospectus", prospectusSchema);
module.exports = Prospectus;