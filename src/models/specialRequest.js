const mongoose = require("mongoose");

const specialRequestSchema = new mongoose.Schema(
  {
    semester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Semester",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    dateCreated: {
      type: Date,
      required: true,
    },
    concern: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SpecialRequestOption",
    },
    reason: {
      type: String,
      required: true,
    },
    coursesAssociated: [
      {
        course: {
          type: String,
          // required: true,
        },
      },
    ],
    statusTrail: {
      inProgress: {
        type: Boolean,
        default: false,
      },
      setInProgessBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      isCancelled: {
        type: String,
        enum: ["Cancelled", "Declined", "Cancellation Pending"],
        default: null,
      },
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
    attachedFiles: [
      {
        file: {
          fileURL: {
            type: String,
            // required: true,
          },
          filePath: {
            type: String,
            // required: true,
          },
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

const SpecialRequest = mongoose.model("SpecialRequest", specialRequestSchema);
module.exports = SpecialRequest;