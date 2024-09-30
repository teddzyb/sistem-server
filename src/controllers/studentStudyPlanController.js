const StudentStudyPlan = require("../models/studentStudyPlan");
const Grades = require("../models/grades");
const User = require("../models/user");
const Semester = require("../models/semester");
const SuggestedCourses = require("../models/suggestedCourses");
const {
  handleAddCourseOfferings,
  handleRemoveCourseOfferings,
} = require("./courseOfferingsController");
const { createSuggestedCourses } = require("./suggestedCourses");
const { createNotification } = require("./notificationController");

exports.updateStudyPlan = async (studentId) => {
  try {
    let studentStudyPlans = await StudentStudyPlan.find({ studentId });

    const studentTakenCourses = await Grades.findOne({
      studentId: studentId,
    });

    const suggestedCourses = await SuggestedCourses.findOne({ studentId });

    const takenCourses = studentTakenCourses?.courses;

    const currentSemester = await Semester.findOne({ isCurrent: true });

    let index = studentStudyPlans.findIndex(
      (studentStudyPlan) =>
        studentStudyPlan.semPeriod.semester.toLowerCase() ===
          currentSemester.semester.toLowerCase() &&
        studentStudyPlan.semPeriod.year.toLowerCase() ===
          currentSemester.year.toLowerCase()
    );

    if (index !== -1) {
      studentStudyPlans.splice(index, 1);
    }

    for (const studentStudyPlan of studentStudyPlans) {
      let coursesToIterate = [];

      const oldCourses = studentStudyPlan.suggestedCourses;

      suggestedCourses.suggestedCourses.forEach((suggestedCourse) => {
        if (
          suggestedCourse.isEligible === true &&
          suggestedCourse.hasTaken === false
        ) {
          coursesToIterate.push(suggestedCourse.course);
        }
      });

      takenCourses?.forEach((takenCourse) => {
        if (
          takenCourse.finalGrade === "NG" &&
          coursesToIterate.every(
            (course) => course.courseCode !== takenCourse.courseCode
          )
        ) {
          coursesToIterate.push(takenCourse);
        }
      });

      coursesToIterate = [...new Set(coursesToIterate)];

      studentStudyPlan.suggestedCourses = coursesToIterate;

      await studentStudyPlan.save();

      for (const course of coursesToIterate) {
        await handleAddCourseOfferings(
          course,
          studentStudyPlan.semPeriod.semester,
          studentStudyPlan.semPeriod.year,
          studentId
        );
      }

      for (const course of oldCourses) {
        await handleRemoveCourseOfferings(
          course,
          studentStudyPlan.semPeriod.semester,
          studentStudyPlan.semPeriod.year,
          studentId
        );
      }
    }

    console.log("Student's all study plan updated");
  } catch (error) {
    console.log(error);
  }
};

exports.createStudyPlanForCurrentSem = async (studentId) => {
  try {
    const student = await User.findOne({ idNumber: studentId });
    const currentSemester = await Semester.findOne({ isCurrent: true });

    let studentStudyPlanExist = await StudentStudyPlan.findOne({
      studentId,
      "semPeriod.semester": currentSemester.semester,
      "semPeriod.year": currentSemester.year,
    });


    const studentTakenCourses = await Grades.findOne({
      studentId: studentId,
    });

    let suggestedCourses = await SuggestedCourses.findOne({ studentId });

    if (!suggestedCourses) {
      suggestedCourses = await createSuggestedCourses(studentId, studentTakenCourses);
    }

    const takenCourses = studentTakenCourses?.courses;

    let coursesToIterate = [];
    const oldCourses = studentStudyPlanExist?.suggestedCourses;

    suggestedCourses?.suggestedCourses.forEach((suggestedCourse) => {
      if (
        suggestedCourse.isEligible === true &&
        suggestedCourse.hasTaken === false &&
        suggestedCourse.course.semester
          .toLowerCase() === currentSemester.semester.toLowerCase() &&
        parseInt(suggestedCourse.course.year) === parseInt(student.yearLevel)
      ) {
        coursesToIterate.push(suggestedCourse.course);
      }
    });


    takenCourses?.forEach((takenCourse) => {
      if (
        takenCourse.finalGrade === "NG" &&
        coursesToIterate.every(
          (course) => course.courseCode !== takenCourse.courseCode
        )
      ) {
        coursesToIterate.push(takenCourse);
      }
    });

    coursesToIterate = [...new Set(coursesToIterate)];
    for (const course of coursesToIterate) {
      await handleAddCourseOfferings(
        course,
        currentSemester.semester,
        currentSemester.year,
        studentId
      );
    }

        if (oldCourses?.length > 0) {
          for (const courses of oldCourses) {
            await handleRemoveCourseOfferings(
              courses,
              currentSemester.semester,
              currentSemester.year,
              studentId
            );
          }
        }


    if (studentStudyPlanExist) {
      studentStudyPlanExist.suggestedCourses = coursesToIterate;
      await studentStudyPlanExist.save();

      console.log("Student Study Plan updated");
      return studentStudyPlanExist;
    } else {
      const studentStudyPlan = new StudentStudyPlan({
        "semPeriod.semester": currentSemester.semester,
        "semPeriod.year": currentSemester.year,
        studentId: studentId,
        suggestedCourses: coursesToIterate,
        lastUpdatedBy: student._id,
      });

      await studentStudyPlan.save();

      console.log("Student Study Plan created");

      return studentStudyPlan;
    }
  } catch (error) {
    console.log(error);
  }
};

exports.getStudyPlan = async (req, res) => {
  try {
    const { studentId } = req.params;
    const student = await User.findOne({ idNumber: studentId });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const currentSemester = await Semester.findOne({ isCurrent: true });

    let studentStudyPlan = await StudentStudyPlan.findOne({
      studentId,
      "semPeriod.semester": currentSemester.semester,
      "semPeriod.year": currentSemester.year,
    }).populate("lastUpdatedBy");

    if (!studentStudyPlan) {
      studentStudyPlan = await this.createStudyPlanForCurrentSem(studentId);
    }


    res.status(200).json({ studentStudyPlan });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addToStudyPlan = async (req, res) => {
  try {
    const { course, studyPlanId, updatedBy } = req.body;

    let message = '';
    const link = "study plan";
    const itemID = studyPlanId;
    let recipients;

    const studentStudyPlan = await StudentStudyPlan.findById(studyPlanId);
    const c = ({
      courseCode,
      courseDesc,
      units,
      year,
      requisites,
      equivalents,
    } = course);

    studentStudyPlan.suggestedCourses.push(c);
    studentStudyPlan.lastUpdatedBy = updatedBy;

    await handleAddCourseOfferings(
      c,
      studentStudyPlan.semPeriod.semester,
      studentStudyPlan.semPeriod.year,
      studentStudyPlan.studentId
    );

    await studentStudyPlan.save();
    const student = await User.findOne({ idNumber: studentStudyPlan.studentId });
    const user = await User.findById(updatedBy)
    if(updatedBy && user.user_type === 'faculty'){
      message = `The course ${c.courseCode} - ${c.courseDesc} has been ADDED by [${user.firstName} ${user.lastName}] in ${studentStudyPlan.semPeriod.semester} ${studentStudyPlan.semPeriod.year} study plan.`;
      recipients = [student._id];
      await createNotification(recipients, link, message, itemID);
    }

    res.status(201).json({ studentStudyPlan });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.removeFromStudyPlan = async (req, res) => {
  try {
    const { course, studyPlanId, updatedBy } = req.body;

    let message = '';
    const link = "study plan";
    const itemID = studyPlanId;
    let recipients;

    const studentStudyPlan = await StudentStudyPlan.findById(studyPlanId);
    studentStudyPlan.suggestedCourses =
      studentStudyPlan.suggestedCourses.filter(
        (suggestedCourse) => suggestedCourse.courseCode !== course.courseCode
      );

      studentStudyPlan.lastUpdatedBy = updatedBy;

    await handleRemoveCourseOfferings(
      course,
      studentStudyPlan.semPeriod.semester,
      studentStudyPlan.semPeriod.year,
      studentStudyPlan.studentId
    );

    await studentStudyPlan.save();
    const student = await User.findOne({ idNumber: studentStudyPlan.studentId });
    const user = await User.findById(updatedBy)
    if(updatedBy && user.user_type === 'faculty'){
      message = `The course ${course.courseCode} ${course.courseDesc} has been REMOVED by [${user.firstName} ${user.lastName}] in ${studentStudyPlan.semPeriod.semester} ${studentStudyPlan.semPeriod.year} study plan.`;
      recipients = [student._id];
      await createNotification(recipients, link, message, itemID);
    }
    res.status(200).json({ studentStudyPlan });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.removeAllFromStudyPlan = async (req, res) => {
  try {
    const { studyPlanId, updatedBy } = req.body;
    const studentStudyPlan = await StudentStudyPlan.findById(studyPlanId);

    const courses = studentStudyPlan.suggestedCourses;
    studentStudyPlan.suggestedCourses = [];
    studentStudyPlan.lastUpdatedBy = updatedBy;

    for (const course of courses) {
      await handleRemoveCourseOfferings(
        course,
        studentStudyPlan.semPeriod.semester,
        studentStudyPlan.semPeriod.year,
        studentStudyPlan.studentId
      );
    }

    await studentStudyPlan.save();
    res.status(200).json({ studentStudyPlan });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }

}

exports.getStudyPlanBySem = async (req, res) => {
  try {
    const { studentId, semester, year } = req.params;
    const studentStudyPlan = await StudentStudyPlan.findOne({
      studentId,
      "semPeriod.semester": semester,
      "semPeriod.year": year,
    }).populate("lastUpdatedBy");

    res.status(200).json({ studentStudyPlan });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

exports.createStudyPlanForSem = async (req, res) => {
  try {
    const { studentId, semester, year } = req.body;
    const suggestedCourses = await SuggestedCourses.findOne({ studentId });
    const student = await User.findOne({ idNumber: studentId });

    let courses = [];
    suggestedCourses.suggestedCourses.forEach((item) => {
      if (item.isEligible === true && item.hasTaken === false && item.course.semester
          .toLowerCase() === semester.toLowerCase() &&
        parseInt(item.course.year) === parseInt(student.yearLevel)) {
        courses.push(item.course);
      }
    });

    const studentStudyPlan = new StudentStudyPlan({
      studentId,
      "semPeriod.semester": semester,
      "semPeriod.year": year,
      suggestedCourses: courses,
      lastUpdatedBy: student._id
    });

    for (const course of courses) {
      await handleAddCourseOfferings(course, semester, year, studentId);
    }

    await studentStudyPlan.save();

    res.status(201).json({ studentStudyPlan });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};
