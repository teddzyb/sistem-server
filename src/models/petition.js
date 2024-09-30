const mongoose = require("mongoose");

const petitionSchema = new mongoose.Schema(
  {
    semester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Semester",
      required: true,
    },
    courseStatus: {
      type: String,
      required: true,
    },
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
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    dateCreated: {
      type: Date,
      required: true,
    },
    statusTrail: {
      coordinatorApproval: {
        isApproved: {
          type: Boolean,
          default: false,
        },
        dateApproved: {
          type: Date,
          default: null,
        },
        approvedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          default: null,
        },
      },
      chairApproval: {
        isApproved: {
          type: Boolean,
          default: false,
        },
        dateApproved: {
          type: Date,
          default: null,
        },
      },
    },
    deadline: {
      type: Date,
    },
    studentsJoined: [
      {
        student: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        dateJoined: {
          type: Date,
          default: Date.now,
        },
        hasConfirmed: {
          type: Boolean,
          default: false,
        },
        hasLeft: {
          type: Boolean,
          default: false,
        }
      },
    ],
    waitingList: [
      {
        student: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        dateJoined: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    remarks: [
      {
        remark: {
          type: String,
          required: true,
        },
        createdBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        dateCreated: {
          type: Date,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Petition = mongoose.model("Petition", petitionSchema);
module.exports = Petition;
