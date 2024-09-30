const Petition = require("../models/petition");
const Semester = require("../models/semester");
const User = require("../models/user");
const { handleAddCourseOfferings, handleRemoveCourseOfferings } = require("./courseOfferingsController");
const { createNotification } = require("./notificationController");

exports.createPetition = async (req, res) => {
    try {
        const { courseStatus, course, createdBy } = req.body;
        const currentSemester = await Semester.findOne({ isCurrent: true });
        const student = await User.findById(createdBy);

        const petition = await Petition.create({
            semester: currentSemester._id,
            courseStatus,
            course,
            createdBy,
            dateCreated: Date.now(),
            studentsJoined: [
                {
                    student: createdBy,
                },
            ],
        });

        // await handleAddCourseOfferings(course, currentSemester.semester, currentSemester.year, student.idNumber);

        return res.status(201).json({ petition });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

exports.getPetitions = async (req, res) => {
    try {
        const currentSemester = await Semester.findOne({ isCurrent: true });
        let petitions = await Petition.find({ semester: currentSemester._id }).populate("createdBy").populate("studentsJoined.student").populate('semester')

        let noStudents = petitions.filter((petition) => petition.studentsJoined.length === 0);

        // Delete petitions with no students
        for (let petition of noStudents) {
            await Petition.findByIdAndDelete(petition._id);
        }

        // Filter out deleted petitions
        petitions = petitions.filter((petition) => petition.studentsJoined.length > 0);

        return res.status(200).json({ petitions });
    } catch (error) {
        return res.status(500).send(error.message);
    }
}
exports.getPetitionById = async (req, res) => {
    try {
        const { id } = req.params;
        const petition = await Petition.findById(id).populate("createdBy").populate("studentsJoined.student").populate("statusTrail.coordinatorApproval.approvedBy").populate("waitingList.student").populate('semester').populate('remarks.createdBy');

        if (petition) {
            return res.status(200).json({ petition });
        } else {
            return res.status(404).send("Petition with the specified ID does not exist");
        }

    } catch (error) {
        return res.status(500).send(error.message);
    }
}

exports.joinPetition = async (req, res) => {
    try {
        const { id } = req.params;
        const { student } = req.body;

        const petition = await Petition.findById(id).populate('semester');
        const studentId = await User.findById(student);

        if (petition) {

            if (!petition.studentsJoined.includes(student)) {
                petition.studentsJoined.push({ student, dateJoined: Date.now()});
                await petition.save();
                // await handleAddCourseOfferings(petition.course, petition.semester.semester, petition.semester.year, studentId.idNumber);
            }   


          return res.status(200).json({ petition });
        } else {
          return res
            .status(404)
            .send("Petition with the specified ID does not exist");
        }
    } catch (error) {
        return res.status(500).send(error.message);
    }
}

exports.deletePetition = async (req, res) => {
    try {
        const { id } = req.params;

        const petition = await Petition.findById(id).populate('semester');
        const studentId = petition.studentsJoined[0].student;
        const student = await User.findById(studentId);

        if (petition) {
        
            const course = petition.course;
            const semester = petition.semester

            // await handleRemoveCourseOfferings(course, semester.semester, semester.year, student.idNumber);

            await Petition.findByIdAndDelete(id);

            return res.status(200);
        }
    } catch (error) {
        console.log(error)
        return res.status(500).send(error.message);
    }
}

exports.leavePetition = async (req, res) => {
    try {
        const { id } = req.params;
        const { student } = req.body;

        const petition = await Petition.findById(id).populate('semester');
        const studentId = await User.findById(student)

        if (petition) {

            studentId.banToPetition = true;

            petition.studentsJoined.forEach((studentJoined) => {
                if (studentJoined.student == student) {
                    studentJoined.hasLeft = true;
                  }
            });



            await studentId.save();

            let wait 

            if (petition.studentsJoined.length < 25 && petition.waitingList.length > 0){
                wait = petition.waitingList.shift()
                petition.studentsJoined.push(wait)

                const message = `You have been added to the petition list for ${petition.course}.`;
                const link = "petition";
                const itemID = id;
                const recipients = [wait];

                await createNotification(recipients, link, message, itemID);
            }
            

            await petition.save();

            // await handleRemoveCourseOfferings(petition.course, petition.semester.semester, petition.semester.year, studentId.idNumber);

            return res.status(200).json({ petition });
        } else {
            return res.status(404).send("Petition with the specified ID does not exist");
        }
    } catch (error) {
        return res.status(500).send(error.message);
    }
}

exports.coordinatorApprovePetition = async (req, res) => {
    try {
        const { id } = req.params;
        const { isApproved, user } = req.body;
        
        const petition = await Petition.findById(id);

        const { studentsJoined } = petition;
        const recipients = studentsJoined.map(
          (studentJoined) => studentJoined.student
        );
        const message = isApproved
          ? `[ACTION REQUIRED] Your petition for ${petition.course.courseCode} ${petition.course.courseDesc} has been APPROVED by the Program Coordinator. Please confirm your participation by clicking here.`
          : `Your petition for ${petition.course.courseCode} ${petition.course.courseDesc} has been REJECTED by the Program Coordinator.`;
        const link = 'petition'
        const itemID = id

        if (petition) {
            petition.statusTrail.coordinatorApproval.isApproved = isApproved;
            petition.statusTrail.coordinatorApproval.dateApproved = Date.now();
            petition.statusTrail.coordinatorApproval.approvedBy = user;
            await petition.save();

            await createNotification(recipients, link, message, itemID);

            return res.status(200).json({ petition });
        } else {
            return res.status(404).send("Petition with the specified ID does not exist");
        }


    } catch (error) {
        console.log(error)
        return res.status(500).send(error.message);
    }
}

exports.chairApprovePetition = async (req, res) => {
    try {
        const { id } = req.params;
        const { isApproved } = req.body;
        
        const petition = await Petition.findById(id);

        const { studentsJoined } = petition;
        const recipients = studentsJoined.map(
          (studentJoined) => studentJoined.student
        );
        const message = `Your petition for ${petition.course.courseCode} ${
          petition.course.courseDesc
        } has been ${
          isApproved ? "APPROVED" : "REJECTED"
        } by the the Department Chair.`;
        const link = "petition";
        itemID = id

        if (petition) {
            petition.statusTrail.chairApproval.isApproved = isApproved;
            petition.statusTrail.chairApproval.dateApproved = Date.now();
            await petition.save();

            await createNotification(recipients, link, message, itemID);

            return res.status(200).json({ petition });
        } else {
            return res.status(404).send("Petition with the specified ID does not exist");
        }

    } catch (error) {
        return res.status(500).send(error.message);
    }
}

exports.getStudentJoinedPetitions = async (req, res) => {
    try {
        const { id } = req.params;
        const currentSemester = await Semester.findOne({ isCurrent: true });
        let petitions = await Petition.find({ "studentsJoined.student": id, semester: currentSemester._id }).populate("createdBy").populate("studentsJoined.student").populate('semester')
        
        return res.status(200).json({ petitions });
    } catch (error) {
        return res.status(500).send(error.message);
    }
}

exports.joinWaitingList = async (req, res) => {
    try {
        const { id } = req.params;
        const { student } = req.body;

        const petition = await Petition.findById(id);

        if (petition) {
          petition.waitingList.push({ student, dateJoined: Date.now() });
          await petition.save();

          return res.status(200).json({ petition });
        } else {
          return res
            .status(404)
            .send("Petition with the specified ID does not exist");
        }

    } catch (error) {
        return res.status(500).send(error.message);
    }
}

exports.leaveWaitingList = async (req, res) => {
    try {
        const { id } = req.params;
        const { student } = req.body;

        const petition = await Petition.findById(id);

        if (petition) {
            petition.waitingList = petition.waitingList.filter((waitingList) => waitingList.student != student);
            await petition.save();

            return res.status(200).json({ petition });
        } else {
            return res.status(404).send("Petition with the specified ID does not exist");
        }

    } catch (error) {
        return res.status(500).send(error.message);
    }
}

exports.confirmParticipation = async (req, res) => {
    try {
        const { id } = req.params;
        const { student } = req.body;

        const petition = await Petition.findById(id);

        if (petition) {
            petition.studentsJoined.forEach((studentJoined) => {
                if (studentJoined.student == student) {
                    studentJoined.hasConfirmed = true;
                }
            });

            await petition.save();

            return res.status(200).json({ petition });
        } else {
            return res.status(404).send("Petition with the specified ID does not exist");
        }
    } catch (error) {
        return res.status(500).send(error.message);
    }
}

exports.setPetitionDeadline = async (req, res) => {
    try {
        const { id } = req.params;
        const { deadline } = req.body;

        const petition = await Petition.findById(id);

        if (petition) {
            petition.deadline = deadline;
            await petition.save();

            return res.status(200).json({ petition });
        } else {
            return res.status(404).send("Petition with the specified ID does not exist");
        }
    }   catch (error) {
        return res.status(500).send(error.message);
    }
}

exports.getWaitlists = async (req, res) => {
    try {
        const { id } = req.params;
        const currentSemester = await Semester.findOne({ isCurrent: true });
        let petitions = await Petition.find({ "waitingList.student": id, semester: currentSemester._id }).populate("createdBy").populate("studentsJoined.student").populate("waitingList.student");
         
        return res.status(200).json({ petitions });
    } catch (error) {
        return res.status(500).send(error.message);
    }
}

exports.getPetitionsBySemester = async (req, res) => {
    try {
        const { year, semester } = req.params;
        const sem = await Semester.findOne({ year, semester });
        let petitions = await Petition.find({ semester: sem?._id }).populate("createdBy").populate("studentsJoined.student").populate('semester');
        
        return res.status(200).json({ petitions });
    } catch (error) {
        return res.status(500).send(error.message);
    }
}

exports.addRemarks = async (req, res) => {
    try {
        const { id } = req.params;
        const { remarks, userId } = req.body;

        const petition = await Petition.findById(id);

        const { studentsJoined } = petition;
        const recipients = studentsJoined.map(
          (studentJoined) => studentJoined.student
        );
        const message = `Remarks have been added to the petition for ${petition.course.courseCode} ${petition.course.courseDesc}.`;
        const link = "petition";
        const itemID = id;


        if (petition) {
            petition.remarks.push({ remark: remarks, createdBy: userId, dateCreated: Date.now() });

            await petition.save();
            await createNotification(recipients, link, message, itemID);


            return res.status(200).json({ petition });
        } else {
            return res.status(404).send("Petition with the specified ID does not exist");
        }
    } catch (error) {
        return res.status(500).send(error.message);
    }
}