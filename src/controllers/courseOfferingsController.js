const CourseOfferings = require("../models/courseOfferings");
const Semester = require("../models/semester");
const StudentStudyPlan = require("../models/studentStudyPlan");
const Petition = require("../models/petition");
const Prospectus = require("../models/prospectus");
const User = require("../models/user");

exports.handleAddCourseOfferings = async (
  course,
  semester,
  year,
  studentId
) => {
  try {
    if (
      course.courseCode.includes("NSTP") ||
      course.courseCode.includes("PE") ||
      course.courseCode.includes("GE") ||
      course.courseCode.includes("EDM")
    ) {
      return;
    }

    // console.log(course)

    const student = await User.findOne({ idNumber: studentId });
    const prospectus = await Prospectus.findById(student.curriculum);

    let courseOfferingExist = await CourseOfferings.findOne({
      "semPeriod.semester": { $regex: new RegExp(`^${semester}$`, "i") },
      "semPeriod.year": { $regex: new RegExp(`^${year}$`, "i") },
    });

    if (!courseOfferingExist) {
      courseOfferingExist = new CourseOfferings({
        semPeriod: {
          semester: semester,
          year: year,
        },
        courses: [],
      });
    }

    let courseToCheck = prospectus.courses.find(
      (p) => p.courseCode === course.courseCode
    );

    courseToCheck = courseToCheck ? courseToCheck : course;
    
      const courseExist = courseOfferingExist.courses.find(
        (c) =>
          c.course.courseCode === courseToCheck.courseCode &&
          c.course.program === student.program
      );

      if (courseExist) {
        courseExist.studentCount = [...courseExist.studentCount, studentId];
      } else {

          let isRegularOffering = courseToCheck.semester.split('')[0] === semester ? true : false;

          let yearLevel = courseToCheck.year;
                     
        const newCourse = {
          course: {
            courseCode: courseToCheck.courseCode,
            courseDesc: courseToCheck.courseDesc,
            program: student.program,
          },
          isRegularOffering,
          yearLevel,
          studentCount: [studentId],
        };
        courseOfferingExist.courses.push(
          newCourse
        );

      }

      await courseOfferingExist.save();
      return courseOfferingExist;
  } catch (error) {
    console.log(error);
  }
};

exports.handleRemoveCourseOfferings = async (
  course,
  semester,
  year,
  studentId
) => {
  try {
    const courseOfferingExist = await CourseOfferings.findOne({
      "semPeriod.semester": { $regex: new RegExp(`^${semester}$`, "i") },
      "semPeriod.year": { $regex: new RegExp(`^${year}$`, "i") },
    });
    const student = await User.findOne({ idNumber: studentId });
    if (courseOfferingExist) {
      const courseExist = courseOfferingExist.courses?.find(
        (c) => c.course.courseCode === course.courseCode && c.course.program === student.program
      );
      if (courseExist) {
        if (courseExist.studentCount.length > 1) {
          courseExist.studentCount = courseExist.studentCount.filter(
            (s) => s !== studentId
          );
        } else {
            courseOfferingExist.courses = courseOfferingExist.courses.filter(
              (c) => c.course.courseCode !== course.courseCode
            );
        }
        await courseOfferingExist.save();
        return courseOfferingExist;
      }
    }
  } catch (error) {
    console.log(error);
  }
};

exports.getCourseOfferings = async (req, res) => {
  try {
    const { semester, year } = req.params;
    let courseOfferings = await CourseOfferings.findOne({
      "semPeriod.semester": semester,
      "semPeriod.year": year,
    });

    if (!courseOfferings) {
      courseOfferings = await createCurrentCourseOfferings({ semester, year });
    }

        let noStudents = courseOfferings.courses.filter(
          (course) => course.studentCount.length === 0
        );


        if (noStudents.length > 0) {
      noStudents.forEach((course) => {
        courseOfferings.courses = courseOfferings.courses.filter(
          (c) => c.course.courseCode !== course.course.courseCode
        );
      });

      await courseOfferings.save(); 
    }


    res.status(200).send(courseOfferings);
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
};

const createCurrentCourseOfferings = async (semester) => {
  try {
    const studyPlans = await StudentStudyPlan.find({
      "semPeriod.semester": semester.semester,
      "semPeriod.year": semester.year,
    });
    const petitions = await Petition.find({ semester: semester._id }).populate(
      "studentsJoined.student"
    );

    // const prospectuses = await Prospectus.find();

    let currentCourses = []

    // prospectuses.forEach(prospectus => {
    //   prospectus.courses.forEach(course => {
    //     const courseExist = 
    //     currentCourses.length > 0 &&
    //     currentCourses.find(
    //       (c) =>
    //         c.course.courseCode === course.courseCode &&
    //         c.course.courseDesc === course.courseDesc &&
    //         c.course.program === prospectus.program.match(/\((.*?)\)/)[1]
    //     );

    //     if (
    //       !courseExist
    //     && 
    //     course.semester.toLowerCase() === semester.semester.toLowerCase() &&
    //       !course.courseCode.includes("NSTP") &&
    //       !course.courseCode.includes("PE") &&
    //       !course.courseCode.includes("GE") &&
    //       !course.courseCode.includes("EDM") 
    //     ){
    //       currentCourses.push({
    //         course: {
    //           courseCode: course.courseCode,
    //           courseDesc: course.courseDesc,
    //           program: prospectus.program.match(/\((.*?)\)/)[1],
    //         },
    //         studentCount: [],
    //         isRegularOffering: true,
    //         yearLevel: course.year,
    //       });
    //     }
    //   })
    // })

    let courses = [...currentCourses];
    let isRegularOffering;
    let yearLevel;
    let program

    for (const studyPlan of studyPlans) {
      for (const course of studyPlan.suggestedCourses) {
    // You can use async operations here and await them
        if (
          !course.courseCode.includes("NSTP") &&
          !course.courseCode.includes("PE") &&
          !course.courseCode.includes("GE") &&
          !course.courseCode.includes("EDM")
        ) {
          const student = await User.findOne({idNumber: studyPlan.studentId });
          program = student.program;
        const courseExist = courses.find(
          (c) =>
            c.course.courseCode === course.courseCode &&
            c.course.courseDesc === course.courseDesc &&
            c.course.program === program
        );

        if (courseExist && studyPlan.studentId) {
          courseExist.studentCount = [
            ...courseExist.studentCount,
            studyPlan.studentId,
          ];
        } else {
          const code = course.courseCode.split(" ")[1];
          const prospectus = await Prospectus.findById(student.curriculum);
          
          isRegularOffering = code[1] === semester.semester[0] ? true : false;
          if (!isRegularOffering ){
            isRegularOffering = 
              prospectus.courses.some(
                (p) =>
                  p.semester.toLowerCase() === semester.semester.toLowerCase() && p.courseCode === course.courseCode
              )
          }

            let courseExist = prospectus.courses.find(
              (p) => p.courseCode === course.courseCode
            );
            if (courseExist) {
              yearLevel = courseExist.year
            }

          courses.push({
            course: {
              courseCode: course.courseCode,
              courseDesc: course.courseDesc,
              program: program,
            },
            studentCount: [studyPlan.studentId],
            isRegularOffering,
            yearLevel: yearLevel,
          });
        }
      }
      }
    }

    // petitions?.forEach((petition) => {
    //   const courseExist = courses.find(
    //     (c) =>
    //       c.course.courseCode === petition.course.courseCode &&
    //       c.course.courseDesc === petition.course.courseDesc 
    //   );

    //   let students = petition.studentsJoined
    //     .filter((student) => student.student.idNumber != null)
    //     .map((student) => student.student.idNumber);
    //   if (courseExist) {
    //     students = students.filter( student => !courseExist.studentCount.includes(student))
    //     courseExist.studentCount = [...courseExist.studentCount, ...students];
    //   } else {
    //     isRegularOffering = false
    //         for (let prospectus of prospectuses) {
    //           let course = prospectus.courses.find(
    //             (course) => course.courseCode === petition.course.courseCode
    //           );
    //           if (course) {
    //             yearLevel = course.year;
    //             program = prospectus.program.match(/\((.*?)\)/)[1];
    //           }
    //         }

    //     courses.push({
    //       course: {
    //         courseCode: petition.course.courseCode,
    //         courseDesc: petition.course.courseDesc,
    //         program: program,
    //       },
    //       studentCount: [...students],
    //       isRegularOffering,
    //       yearLevel: yearLevel,
    //     });
    //   }
    // });

    const courseOfferings = new CourseOfferings({
      semPeriod: {
        semester: semester.semester,
        year: semester.year,
      },
      courses: courses,
    });

    await courseOfferings.save();

    console.log("Created current course offerings");

    return courseOfferings;
  } catch (error) {
    console.log(error);
  }
};

exports.getCurrentCourseOfferings = async (req, res) => {
  try {
    const semester = await Semester.findOne({ isCurrent: true });
    let courseOfferings = await CourseOfferings.findOne({
      "semPeriod.semester": semester.semester,
      "semPeriod.year": semester.year,
    });

    if (!courseOfferings) {
      courseOfferings = await createCurrentCourseOfferings(semester);
    }

    let noStudents = courseOfferings.courses.filter(
      (course) => course.studentCount.length === 0
    );

    if (noStudents.length > 0) {
      noStudents.forEach((course) => {
        courseOfferings.courses = courseOfferings.courses.filter(
          (c) => c.course.courseCode !== course.course.courseCode
        );
      });
      
      await courseOfferings.save();
    }

    res.status(200).send(courseOfferings);
  } catch (error) {
    res.status(400).send(error);
  }
};

