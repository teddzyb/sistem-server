const mongoose = require("mongoose");

const gradeSchema = new mongoose.Schema(
  {
    studentProgram: {
      type: String,
      required: true,
    },
    studentName: {
      type: String,
      required: true,
    },
    year: {
      type: String,
      required: true,
    },
    courses: [
      {
        semester: {
          type: String,
          required: true,
        },
        courseCode: {
          type: String,
          required: true,
        },
        courseDesc: {
          type: String,
          //required: true,
        },
        units:{
          type: String,
          required: true,
        },
        finalGrade: {
          type: String,
          default: "N/A",
          required: true,
        },
        isPassed: {
          type: Boolean,
          required: true,
        },
        isAddedManually: {
          type: Boolean,
          default: false,
        },
      },
    ],
    accreditedCourses: [
      {
        accreditedCourse: {
          courseCode: {
            type: String,
            required: true,
          },
          courseDesc: {
            type: String,
            required: true,
          },
          isPassed: {
            type: Boolean,
            required: true,
          }
        },
        equivalentCourse: {
          course: {
            type: String,
            // required: true,
          },
          // courseDesc: {
          //   type: String,
          //   required: true,
          // },
          units: {
            type: String,
            // required: true,
          },
          finalGrade: {
            type: String,
            // required: true,
          },
          schoolTaken: {
            type: String,
            required: true,
          },
        },
        file: {
          filePath: {
            type: String,
            required: true,
          },
          fileUrl: {
            type: String,
            required: true,
          },
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

const Grade = mongoose.model("Grade", gradeSchema);

module.exports = Grade;
