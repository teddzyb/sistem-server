const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    message: {
      type: String,
      required: true,
    },
    link: {
      type: String,
      required: true,
    },
    itemID: {
      type: String,
      required: true,
    },
    dateCreated: {
      type: Date,
      required: true,
    },
    recipients: [
      {
        recipient: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        isRead: {
          type: Boolean,
          default: false,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Notification = mongoose.model("Notification", notificationSchema);
module.exports = Notification;