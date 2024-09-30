const SuggestedCourses = require("../models/suggestedCourses");
const Grades = require("../models/grades");
const Prospectus = require("../models/prospectus");
const User = require("../models/user");
const StudentStudyPlan = require("../models/studentStudyPlan");

exports.updateFromAccreditation = async (courseAccredited, equivalentCourse, studentId) => {
  try {
    const suggestedCourses = await SuggestedCourses.findOne({ studentId: studentId });

    suggestedCourses.suggestedCourses.forEach((suggestedCourse) => {
      if (suggestedCourse.course.courseCode === courseAccredited.courseCode) {
        suggestedCourse.subjectTaken = equivalentCourse.course,
        suggestedCourse.grade = equivalentCourse.finalGrade
        suggestedCourse.isPassed = equivalentCourse.isPassed
        suggestedCourse.hasTaken = true
        suggestedCourse.isEligible = false
      }
    })
    
    await suggestedCourses.save();
    console.log("Suggested courses updated successfully")

  } catch (error) {
    console.log(error);
  }
};

exports.createSuggestedCourses = async (studentId, gradesFiles) => {
  try {
     const studentTakenCourses = await Grades.findOne({ studentId: studentId });
     const student = await User.findOne({ idNumber: studentId });
     
    let takenCourses = []
    let studentProgram 
    let allCourses = []
    let accreditedCourses = []

      if (!studentTakenCourses) {
        gradesFiles?.accreditedCourses &&
        gradesFiles?.accreditedCourses.forEach((accreditedCourse) => {
          accreditedCourses.push(accreditedCourse.accreditedCourse)
        })
        allCourses = gradesFiles?.courses.concat(accreditedCourses);
        takenCourses = allCourses;
        studentProgram = gradesFiles.studentProgram
      } else {
        studentTakenCourses?.accreditedCourses &&
        studentTakenCourses?.accreditedCourses.forEach((accreditedCourse) => {
          accreditedCourses.push(accreditedCourse.accreditedCourse)
        })
        allCourses = studentTakenCourses?.courses.concat(accreditedCourses);  
        takenCourses = allCourses
        studentProgram = studentTakenCourses.studentProgram
      }
      
     let prospectus 

    if (student.curriculum){
      prospectus = await Prospectus.findById(student.curriculum);
    } else {
      const prospectuses = await Prospectus.find();
      prospectus = prospectuses.filter((prospectus) =>
        prospectus.program.includes(studentProgram)
        && 
        prospectus.effectiveYear === student.effectiveYear
      )[0];
    }

    const suggestedCoursesExists = await SuggestedCourses.findOne({studentId: studentId})
      // Array to store courses that meet the iteration criteria
    let coursesToIterate = [];

    let passedCourses = [];

    if (!suggestedCoursesExists) {
            prospectus?.courses?.forEach((course) => {
              // Check if the course is not in the removedCourses
              let hasTaken = false;
              // let grade = null
              let isEligible = true;
              let subjectTaken = null;
              let grade = null;
              let isPassed = null;

              takenCourses?.forEach((takenCourse) => {
                if (!course.courseCode.includes("ELEC")) {
                  if (
                    (course.courseCode === takenCourse.courseCode ||
                      // course.courseDesc === takenCourse.courseDesc ||
                      (course.equivalents &&
                        course.equivalents.includes(takenCourse.courseCode))) &&
                    takenCourse.isPassed
                  ) {
                    passedCourses.push(course);
                    hasTaken = true;
                    isEligible = false;
                    subjectTaken =
                    takenCourse.courseCode + " " + takenCourse.courseDesc;
                    grade = takenCourse.finalGrade;
                    isPassed = takenCourse.isPassed;
                  }
                }
              });

              const subjectRequisitesMet = course.requisites && course.requisites?.every((requisite) =>
                passedCourses?.some(
                  (removedCourse) => removedCourse.courseCode === requisite
                )
              )? true : false;

              const yearRequisitesMet = course.requisites &&
                course.requisites[0]?.includes("YEAR") &&
                student.yearLevel != undefined &&
                parseInt(course.requisites[0][0]) <=
                  parseInt(student.yearLevel[0]) ? true : false;

              const coursesOfSameYear = parseInt(course.year) <= parseInt(student.yearLevel) && !course.requisites ? true : false;

              if ( !subjectRequisitesMet && !yearRequisitesMet && !coursesOfSameYear) {
                isEligible = false;
              }

              const c = {
                course,
                isEligible,
                hasTaken,
                subjectTaken,
                grade,
                isPassed,
              };

              coursesToIterate.push(c);
            });
    } else {
      suggestedCoursesExists.suggestedCourses.forEach((suggestedCourse) => {
        let hasTaken = false;
        let isEligible = true;
        let subjectTaken = null;
        let grade = null;
        let isPassed = null;
        
          takenCourses?.forEach((takenCourse) => {
            if (!suggestedCourse.course.courseCode.includes("ELEC")) {
            if (
              (suggestedCourse.course.courseCode === takenCourse.courseCode ||
              // suggestedCourse.course.courseDesc === takenCourse.courseDesc ||
              (suggestedCourse.course.equivalents && suggestedCourse.course.equivalents.includes(takenCourse.courseCode))) &&
              takenCourse.isPassed
            ) {
              passedCourses.push(suggestedCourse.course);
              hasTaken = true;
              subjectTaken = takenCourse.courseCode + " " + takenCourse.courseDesc;
              grade = takenCourse.finalGrade;
              isPassed = takenCourse.isPassed;
              isEligible = false;
            }
          }
          })

          const subjectRequisitesMet = suggestedCourse.course.requisites && suggestedCourse.course.requisites?.every((requisite) => 
            passedCourses?.some(
              (removedCourse) => removedCourse.courseCode === requisite
            )
          )? true : false;

          const yearRequisitesMet = suggestedCourse.course.requisites &&
            suggestedCourse.course.requisites[0]?.includes("YEAR") &&
            student.yearLevel != undefined &&
            parseInt(suggestedCourse.course.requisites[0][0]) <=
              parseInt(student.yearLevel[0]) ? true : false;

          const coursesOfSameYear = parseInt(suggestedCourse.course.year) <= parseInt(student.yearLevel) && !suggestedCourse.course.requisites ? true : false;

          if ( !subjectRequisitesMet && !yearRequisitesMet && !coursesOfSameYear) {
            isEligible = false;
          }


        if (suggestedCourse.hasTaken) {
          hasTaken = suggestedCourse.hasTaken;
           isEligible = suggestedCourse.isEligible;
           subjectTaken = suggestedCourse.subjectTaken;
           grade = suggestedCourse.grade;
           isPassed = suggestedCourse.isPassed;
        }


        const c = {
          course: suggestedCourse.course,
          isEligible,
          hasTaken,
          subjectTaken,
          grade,
          isPassed,
        };

        coursesToIterate.push(c);
      })
    }


    if (!suggestedCoursesExists) {
      const suggestedCourses = new SuggestedCourses({
        studentId: studentId,
        suggestedCourses: coursesToIterate,
      });

      await suggestedCourses.save();

      console.log("Suggested courses created successfully");
      return suggestedCourses
    } else {
        suggestedCoursesExists.suggestedCourses = coursesToIterate

        await suggestedCoursesExists.save();
        console.log("Suggested courses updated successfully")
    }

   
  } catch (error) {
    console.log(error);
  }
};

exports.getSuggestedCourses = async (req, res) => {
    try {
        const { studentId } = req.params;
        const student = await User.findOne({ idNumber: studentId });

      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }

        let suggestedCourses = await SuggestedCourses.findOne({ studentId: studentId });

        if (!suggestedCourses) {
            const grades = await Grades.findOne({ studentId: studentId });
           suggestedCourses = await this.createSuggestedCourses(studentId, grades);
        }

        res.status(200).json({ suggestedCourses });
        
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message })
    }
}