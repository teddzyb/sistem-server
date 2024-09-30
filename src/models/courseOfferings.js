const mongoose = require("mongoose");

const courseOfferingsSchema = new mongoose.Schema(
  {
    semPeriod: {
      semester: {
        type: String,
        required: true,
      },
      year: {
        type: String,
        required: true,
      },
    },
    courses: [
      {
        course: {
          courseCode: {
            type: String,
            required: true,
            // unique: true,
          },
          courseDesc: {
            type: String,
            required: true,
            // unique: true,
          },
          program: {
            type: String,
            required: true,
          }
        },
        isRegularOffering: {
          type: Boolean,
          required: true,
        },
        yearLevel: {
          type: String,
          required: true,
        },
        studentCount: [
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

const CourseOfferings = mongoose.model(
  "CourseOfferings",
  courseOfferingsSchema
);
module.exports = CourseOfferings;
