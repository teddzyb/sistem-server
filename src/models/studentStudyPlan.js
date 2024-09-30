const mongoose = require('mongoose')

const studentStudyPlanSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: true,
    },
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
    suggestedCourses: [
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
    lastUpdatedBy: {
      type:
        mongoose.Schema.Types.ObjectId,
      ref: "User",
    }
  },
  {
    timestamps: true,
  }
);

const StudentStudyPlan = mongoose.model(
  "StudentStudyPlan",
  studentStudyPlanSchema
);

module.exports = StudentStudyPlan;