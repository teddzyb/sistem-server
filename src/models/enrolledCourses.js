const mongoose = require("mongoose");

const enrolledSchema = new mongoose.Schema(
  {
        studentProgram: {
            type: String,
        },
        year: {
          type: String,
        },
        currentEnrolledCourses: [
          {
            courseCode: {
              type: String,
              required: true,
            },
            courseDesc: {
              type: String,
              required: true,
            },
            finalGrade: {
              type: String,
              required: true,
            },
            isPassed: {
              type: Boolean,
              required: true,
            },
          },
        ],
    studentId: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Enrolled = mongoose.model("enrolled_courses", enrolledSchema);

module.exports = Enrolled;
