const mongoose = require('mongoose');

const suggestedCoursesSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: true,
    },
    suggestedCourses: [
      {
        course: {
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
        isEligible: {
          type: Boolean,
          default: false,
        },
        hasTaken: {
          type: Boolean,
          default: false,
        },
        subjectTaken: {
          type: String,
        },
        grade: {
          type: String,
        },
        isPassed: {
          type: Boolean,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
); 

const SuggestedCourses = mongoose.model( 'SuggestedCourses', suggestedCoursesSchema );
module.exports = SuggestedCourses