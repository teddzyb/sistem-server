const Semester = require("../models/semester");
const SpecialRequest = require("../models/specialRequest");
const User = require("../models/user");

const { createNotification } = require("./notificationController");

exports.createSpecialRequest = async (req, res) => {
  try {
    const currentSemester = await Semester.findOne({ isCurrent: true });

    const { concern, reason, coursesAssociated, attachedFiles, createdBy } =
      req.body;

    const specialRequest = new SpecialRequest({
      semester: currentSemester._id,
      createdBy,
      dateCreated: new Date(),
      concern,
      reason,
      coursesAssociated: coursesAssociated.map((course) => ({
        course: course,
      })),
      attachedFiles: attachedFiles.map((file) => ({
        file: {
          fileURL: file.fileURL,
          filePath: file.filePath,
        },
      })),
    });

    await specialRequest.save();

    return res.status(201).json({ specialRequest });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.getSpecialRequests = async (req, res) => {
  try {
    const currentSemester = await Semester.findOne({ isCurrent: true });
    let specialRequests = await SpecialRequest.find({
      semester: currentSemester._id,
    })
      .populate("concern")
      .populate("createdBy")
      .populate("semester");

    specialRequests = specialRequests.filter((specialRequest) => specialRequest.createdBy !== null);

    return res.status(200).json({ specialRequests });
  } catch (error) {
    console.log(error);
    return res.status(500).send(error.message);
  }
};

exports.getSpecialRequestsByProgram = async (req, res) => {
  try {
    const { program } = req.params;
    const currentSemester = await Semester.findOne({ isCurrent: true });
    let specialRequests = await SpecialRequest.find({
      semester: currentSemester._id,
    })
      .populate("concern")
      .populate("createdBy")
      .populate("semester");

    specialRequests = specialRequests.filter(
      (specialRequest) =>
        specialRequest.createdBy.program.replace(/\s/g, "") === program.replace(/\s/g, "")
    );

    specialRequests = specialRequests.filter(
       (specialRequest) => specialRequest.createdBy !== null
    );


    return res.status(200).json({ specialRequests });
  } catch (error) {
    return res.status(500).send(error.message);
  }

}

exports.getSpecialRequestById = async (req, res) => {
  try {
    const { id } = req.params;
    const specialRequest = await SpecialRequest.findById(id)
      .populate("concern")
      .populate("createdBy")
      .populate("statusTrail.coordinatorApproval.approvedBy")
      .populate("semester")
      .populate("remarks.createdBy");

    if (specialRequest) {
      return res.status(200).json({ specialRequest });
    } else {
      return res
        .status(404)
        .send("Special Request with the specified ID does not exist");
    }
  } catch (error) {
    return res.status(500).send(error.message);
  }
};

exports.coordinatorApprove = async (req, res) => {
  try {
    const { id } = req.params;
    const { isApproved, approvedBy } = req.body;

    const specialRequest = await SpecialRequest.findById(id).populate(
      "concern"
    );

    const recipients = [specialRequest.createdBy];
    const link = "special request";
    const message = `Your special request ${
      specialRequest.concern.requestTitle
    } has been ${
      isApproved ? "approved" : "rejected"
    } by the Program Coordinator.`;
    const itemID = id;

    if (specialRequest) {
      specialRequest.statusTrail.inProgress = false;
      specialRequest.statusTrail.coordinatorApproval.isApproved = isApproved;
      specialRequest.statusTrail.coordinatorApproval.dateApproved = Date.now();
      specialRequest.statusTrail.coordinatorApproval.approvedBy = approvedBy;

      await specialRequest.save();

      await createNotification(recipients, link, message, itemID);

      return res.status(200).json({ specialRequest });
    } else {
      return res
        .status(404)
        .send("Special Request with the specified ID does not exist");
    }
  } catch (error) {
    return res.status(500).send(error.message);
  }
};

exports.chairApprove = async (req, res) => {
  try {
    const { id } = req.params;
    const { isApproved } = req.body;

    const specialRequest = await SpecialRequest.findById(id).populate(
      "concern"
    );

    const recipients = [specialRequest.createdBy];
    const link = "special request";
    const message = `Your special request ${
      specialRequest.concern.requestTitle
    } has been ${
      isApproved ? "approved" : "rejected"
    } by the Department Chair.`;
    const itemID = id;

    if (specialRequest) {
      specialRequest.statusTrail.chairApproval.isApproved = isApproved;
      specialRequest.statusTrail.chairApproval.dateApproved = Date.now();

      await specialRequest.save();

      await createNotification(recipients, link, message, itemID);

      return res.status(200).json({ specialRequest });
    } else {
      return res
        .status(404)
        .send("Special Request with the specified ID does not exist");
    }
  } catch (error) {
    return res.status(500).send(error.message);
  }
};

exports.updateSpecialRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      // concern,
      // reason,
      // coursesAssociated,
      notes,
      attachedFiles,
      updatedBy,
    } = req.body;

    const specialRequest = await SpecialRequest.findById(id)
      .populate("concern")
      .populate("createdBy");
    const user = await User.findById(updatedBy);

    let message;
    const link = "special request";
    const itemID = id;
    let recipients;

    if (specialRequest) {
      // specialRequest.concern = concern;
      // specialRequest.reason = reason;
      // specialRequest.coursesAssociated;

      if (updatedBy) {
        message = `Your special request ${specialRequest.concern.requestTitle} has been updated by ${user.firstName} ${user.lastName}.`;
        recipients = [specialRequest.createdBy];
      }

      if (attachedFiles) {
        attachedFiles.map((file) => {
          specialRequest.attachedFiles.push({
            file: {
              fileURL: file.fileURL,
              filePath: file.filePath,
            },
          });
        });

        if (specialRequest.statusTrail.inProgress) {
          message = `${specialRequest.concern.requestTitle} by ${specialRequest.createdBy.firstName} ${specialRequest.createdBy.lastName} has been updated.`;
          const coordinator = specialRequest.statusTrail.setInProgessBy;
          recipients = [coordinator];
        }
      }

      if (notes) {
        const remark = {
          remark: notes,
          createdBy: updatedBy,
          dateCreated: new Date(),
        };

        specialRequest.remarks.push(remark);
      }

      await specialRequest.save();

      await createNotification(recipients, link, message, itemID);

      return res.status(200).json({ specialRequest });
    } else {
      return res
        .status(404)
        .send("Special Request with the specified ID does not exist");
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send(error.message);
  }
};

exports.getStudentSpecialRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const currentSemester = await Semester.findOne({ isCurrent: true });
    let specialRequests = await SpecialRequest.find({
      createdBy: id,
      semester: currentSemester._id,
    })
      .populate("concern")
      .populate("createdBy")
      .populate("semester");

    return res.status(200).json({ specialRequests });
  } catch (error) {
    return res.status(500).send(error.message);
  }
};

exports.setInProgess = async (req, res) => {
  try {
    const { id } = req.params;
    const { inProgress, updatedBy } = req.body;

    const specialRequest = await SpecialRequest.findById(id)
      .populate("concern")
      .populate("createdBy");
    const user = await User.findById(updatedBy);

    const message = `Your special request ${specialRequest.concern.requestTitle} has been updated by ${user.firstName} ${user.lastName}.`;
    const recepients = [specialRequest.createdBy];
    const link = "special request";
    const itemID = id;

    if (specialRequest) {
      specialRequest.statusTrail.inProgress = inProgress;
      specialRequest.statusTrail.setInProgessBy = updatedBy;

      await specialRequest.save();

      await createNotification(recepients, link, message, itemID);

      return res.status(200).json({ specialRequest });
    } else {
      return res
        .status(404)
        .send("Special Request with the specified ID does not exist");
    }
  } catch (error) {
    return res.status(500).send(error.message);
  }
};

exports.cancelSpecialRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { isCancelled } = req.body;

    const specialRequest = await SpecialRequest.findById(id)
      .populate("concern")
      .populate("createdBy");

    if (specialRequest) {
      specialRequest.statusTrail.isCancelled = isCancelled;

      if (isCancelled === "Cancelled" || isCancelled === "Declined") {
        const message = `Your cancellation request for ${specialRequest.concern.requestTitle} has been ${isCancelled}.`;
        const link = "special request";
        const itemID = id;
        const recipients = [specialRequest.createdBy];

        await createNotification(recipients, link, message, itemID);
      }

      await specialRequest.save();

      return res.status(200).json({ specialRequest });
    } else {
      return res
        .status(404)
        .send("Special Request with the specified ID does not exist");
    }
  } catch (error) {
    return res.status(500).send(error.message);
  }
};

exports.getSpecialRequestBySemester = async (req, res) => {
  try {
    const { year, semester } = req.params;
    const sem = await Semester.findOne({ year, semester });
    let specialRequests = await SpecialRequest.find({ semester: sem?._id })
      .populate("concern")
      .populate("createdBy")
      .populate("semester");

          specialRequests = specialRequests.filter(
            (specialRequest) => specialRequest.createdBy !== null
          );


    if (specialRequests) {
      return res.status(200).json({ specialRequests });
    } else {
      return res
        .status(404)
        .send("Special Requests for the specified semester do not exist");
    }
  } catch (error) {
    return res.status(500).send(error.message);
  }
};

exports.getSpecialRequestsBySemesterAndProgram = async (req, res) => {
  try {
    const { year, semester, program } = req.params;
    const sem = await Semester.findOne({year: semester, semester: year });
    let specialRequests = await SpecialRequest.find({semester: sem?._id})
      .populate("concern")
      .populate("createdBy")
      .populate("semester");

      specialRequests = specialRequests.filter(
        (specialRequest) =>
          specialRequest.createdBy.program.replace(/\s/g, "") ===
          program.replace(/\s/g, "")
      );

          specialRequests = specialRequests.filter(
            (specialRequest) => specialRequest.createdBy !== null
          );


    if (specialRequests) {
      return res.status(200).json({ specialRequests });
    } else {
      return res
        .status(404)
        .send("Special Requests for the specified semester do not exist");
    }
  } catch (error) {
    return res.status(500).send(error.message);
  }

}

exports.getStudentSpecialRequestBySem = async (req, res) => {
  try {
    const { year, semester, id } = req.params;
    const sem = await Semester.findOne({ year, semester });
    const specialRequests = await SpecialRequest.find({
      semester: sem?._id,
      createdBy: id,
    })
      .populate("concern")
      .populate("createdBy")
      .populate("semester");

    if (specialRequests) {
      return res.status(200).json({ specialRequests });
    } else {
      return res
        .status(404)
        .send("Special Requests for the specified semester do not exist");
    }
  } catch (error) {
    return res.status(500).send(error.message);
  }
};
