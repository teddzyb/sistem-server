const Grade = require('../models/grades');
const pdfParse = require("pdf-parse");
const { createSuggestedCourses, updateFromAccreditation } = require('./suggestedCourses');
const { createStudyPlanForCurrentSem, updateStudyPlan } = require('./studentStudyPlanController');
const User = require('../models/user');
const { handleRemoveCourseOfferings } = require('./courseOfferingsController');
const SuggestedCourses = require('../models/suggestedCourses');

exports.submitGrades = async (req, res) => {
  try {
    const data = await pdfParse(req.files.file);
    const extractedData = extractData(data.text);
    const { studentId } = req.body;
    
    res.status(200).json({ data: extractedData });

  } catch (error) {
    console.error('Error handling PDF upload:', error);
    res.status(500).send('Internal Server Error');
  }
}

const handleRetainStudents = async (studentGrades) => {
  try {
    const student = await User.findOne({ idNumber: studentGrades.studentId });
    if (parseInt(student.effectiveYear) < 2023) {
      return;
    }

    // Group courses by courseCode
    let coursesGroupedByCode = studentGrades.courses.reduce((groups, course) => {
      if (!groups[course.courseCode]) {
        groups[course.courseCode] = [];
      }
      groups[course.courseCode].push(course);
      return groups;
    }, {});

    for (let courseCode in coursesGroupedByCode) {
      if (courseCode.startsWith('IS') || courseCode.startsWith('IT') || courseCode.startsWith('CS') || courseCode.startsWith('CIS')) {
        let failedCount = 0;
        let course = null; // Define course here

        // Count the failed instances for each course
        coursesGroupedByCode[courseCode].forEach((courseInGroup) => {
          if (!courseInGroup.isPassed) {
            failedCount++;
          }
          if (failedCount >= 3) {
            course = courseCode + ' ' + courseInGroup.courseDesc;
          }
        });

        // Check if the course was failed three times
        if (failedCount >= 3 && course) {
          student.isRetained = true;
          student.retentionCourse = course;
          await student.save();
          break; // Exit the loop as soon as a course is found that was failed three times
        }
      }
    }
  } catch (error){
    console.error('Error handling retain students:', error);
  }
}

exports.saveGrades = async (req, res) => {
  try {
    const { studentId, grades, toUpdatePerformance } = req.body;

    let gradesData
    let oldGrades = []

    const isGradeExist = await Grade.findOne({ studentId });
    if (isGradeExist) {

      let addedCourses = [];
        isGradeExist.courses.forEach((grade) => {
          if (grade.semester === 'COURSE ACCREDITED' || grade.isAddedManually) {
            addedCourses.push(grade);
          }
        });

        isGradeExist.courses = grades.courses.map((grade) => ({
          semester: grade.semester,
          courseCode: grade.courseCode,
          courseDesc: grade.courseDesc,
          units: grade.units,
          finalGrade: grade.finalGrade,
          isPassed: grade.isPassed,
          isAddedManually: grade.isAddedManually,
        }));
        addedCourses = [...new Set(addedCourses)];
        isGradeExist.courses = isGradeExist.courses.concat(addedCourses);
        
        await isGradeExist.save();
        gradesData = isGradeExist;
      }
    else {
      const pdfData = new Grade({
        studentProgram: grades.studentProgram,
        studentName: grades.studentName,
        year: grades.year,
        courses: grades.courses.map((grade) => ({
          semester: grade.semester,
          courseCode: grade.courseCode,
          courseDesc: grade.courseDesc,
          units: grade.units,
          finalGrade: grade.finalGrade,
          isPassed: grade.isPassed,
          isAddedManually: grade.isAddedManually,
        })),
        studentId,
      });
      await pdfData.save();
      gradesData = pdfData;
    }

    await handleRetainStudents(gradesData);

    await createSuggestedCourses(studentId, gradesData);
    await createStudyPlanForCurrentSem(studentId)
    await updateStudyPlan(studentId);

    res.status(200).json({grades:gradesData})

  } catch (error) {
    console.error('Error saving grades:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

// exports.saveGrades = async (req, res) => {
//   try {
//     const { studentId, grades } = req.body;
//     const existingGrade = await Grade.findOne({ studentId });

//     if (existingGrade) {
//       const regularCourses = [];
//       const accreditedCourses = [];
//       const existingAccreditedCourses = new Set(existingGrade.accredited.map(course => course.courseCode));
//       grades.courses.forEach(course => {
//         if (course.semester === 'COURSE ACCREDITED' && ! existingAccreditedCourses.has(course.courseCode)) {
//           accreditedCourses.push(course);
//         } else {
//           regularCourses.push(course);
//         }
//       });
//       existingGrade.grades = regularCourses;
//       if (existingGrade.accredited.length === 0) {
//         existingGrade.accredited = accreditedCourses;
//       }
       
//         //update accredited courses
//         existingGrade.accredited = accreditedCourses.concat(existingGrade.accredited);

//       await existingGrade.save();
//     } else {
//       const uniqueAccreditedCourses = Array.from(new Set(grades.courses.filter(course => course.semester === 'COURSE ACCREDITED').map(course => course.courseCode)));
//       const newGrade = new Grade({
//         studentProgram: grades.studentProgram,
//         year: grades.year,
//         grades: grades.courses.filter(course => course.semester !== 'COURSE ACCREDITED'),
//         accredited: grades.courses.filter(course => course.semester === 'COURSE ACCREDITED' && uniqueAccreditedCourses.includes(course.courseCode)),
//         studentId,
//       });
//       await newGrade.save();
//     }

//     await createSuggestedCourses(studentId);
//     await createStudyPlan(studentId);
//     await createPerformanceReport();

//     res.status(200).send('Grades saved successfully');
//   } catch (error) {
//     console.error('Error saving grades:', error);
//     res.status(500).json({ message: 'Internal Server Error' });
//   }
// }



exports.getGradesInfo = async (req, res) => {
  try {
    const { id } = req.params;

    const grade = await Grade.findOne({studentId:id});
    
    if (!grade) {
      return res.status(404).json({ message: 'Grade not found' });
    }

    res.status(200).json({ grade });
  } catch (error) {
    console.error('Error fetching grade:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}; 

/* exports.getGradesInfo = async (req, res) => {
  try {
    
    const grades = await Grade.find();

    res.status(200).json({ grades });
  } catch (error) {
    console.error('Error fetching grades:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
 */
function extractData(text) {
  const programPattern = /BACHELOR OF SCIENCE IN (.+?)[\r\n]/;
  const programMatch = text.match(programPattern);
  const studentProgram = programMatch ? programMatch[1].trim() : null;

  const prospectus = /Effective SY: (\d{4}\s*-\s*\d{4})/;
  const prospectusMatch = text.match(prospectus);
  const year = prospectusMatch ? prospectusMatch[1].trim() : null;

  const takeYear = /(\bFIRST|SECOND) SEMESTER (\d{4}\s*-\s*\d{4})|(\bSUMMER) (\d{4})/g;
  const semesterIdx = text.search(takeYear);

  const nameText = text.substring(text.indexOf(year) + year.length, semesterIdx);
  const namePattern = /^[A-ZÑ,]+(?:-?[A-ZÑ,]+)*\s[A-ZÑ]+(?:\s[A-ZÑ]+)?/m;
  const names = nameText.match(namePattern);
  const studentName = names ? names.join(' ').trim() : null;

  let match;

  const courses = [];

  const processCourse = (semester, code, desc, grade, units) => {
    const cleanedDesc = desc
      .trim()
      .replace(/\d+\.\d+\.\d+\.0Ι/, "")
      .replace(/.*\./, "");
    const noZero = cleanedDesc.replace(/^0/, "");
    /* const verdict = grade === 'A+' || grade === 'A' || grade === 'A-'|| grade === 'B+'|| grade === 'B'|| grade === 'B-'|| grade === 'C+'|| grade === 'C' 
    || (grade !== 'F' && !["NC", "INC", "NG", "W"].includes(grade)); */
    const verdict = grade === '1.0' || (grade !== '0' && !["NC", "INC", "NG", "W"].includes(grade));

    return {
      semester: semester,
      courseCode: code,
      courseDesc: noZero,
      units: units,
      finalGrade: grade,
      isPassed: verdict,
    };
  };


  const combinedPattern = new RegExp(
              /* FINAL */                 /* MIDTERM */                        /* UNITS */
    "((\\d\\.\\d|NC|INC|NG|W|5\\.0)?(\\d\\.\\d|NC|INC|NG|W|5\\.0)?(\\d\\.\\d)?(.+?)" +                
    "(AA|AAE|AC|AD|ANTH|ANTH\\s[A-Z]{2}|ADV|AR|BEN|BHR|BIO|CE|CEA|CED|CE|CEA|CHE|CHEA|" + 
    "CHEL|CHEM|CNM|COMM|CPE|CPEA|ECED|ECN|EDUC|ECE|ECEA|EE|EEA|EM|ELS|FAD|FOS|HIST|HM|HPC|IE|IEA|IN|IRF|"+         
    "LA|LEL|LIT|MBIO|ME|MEA|MED|NCM|ND|PEL|PHAR|PHAD|PHARM|PHARCARE|PHCH|PHIL|PHY|POS|PSY|PSYC|SNED|SOC|SOAN|"+
    "SOAN\\s[A-Z]{2}|TPE"+
       /* dcism */
      "|CIS|IS|IT|CS|MATH|MAT)\\s(\\d{3,4}[NLW]{0,2}))|" +
       /* special cases such as all chars no digit course codes */
            /* FINAL */                 /* MIDTERM */                        /* UNITS */
    "((\\d\\.\\d|NC|INC|NG|W|5\\.0)?(\\d\\.\\d|NC|INC|NG|W|5\\.0)?(\\d\\.\\d)(.+?)(GE-[A-Z]+[' ']+[A-Z]+|GE-[A-Z]+|NSTP\\s\\d|FILIPINO\\s\\d(N?)|EDM\\s\\d|FRNC\\s\\d|SPAN\\s\\d))|"+ /* GE NSTP EDM AND FRNC, SPAN */
    "((\\d\\.\\d|NC|INC|NG|W|5\\.0)?(\\d\\.\\d|NC|INC|NG|W|5\\.0)?(\\d\\.\\d)(.+?)(CPD\\s[A-Z]\\s\\d{3}|BP-[A-Z&]+\\s\\d{2}|BP-[A-Z]-[A-Z]|BP-[A-Z]\\s\\d?|"+
    "CBA\\s[A-Z]-[A-Z]|DHT\\s\\d{2}|ECN\\s[A-Z]\\s[A-Z]{2}\\s\\d{3}|ECN\\s[A-Z]\\s\\d{3}|BAC\\s[A-Z]|ANTHRO\\s\\d{3}"+
     "MME\\s\\d{3}|ES-[A-Z]|GEW\\s\\d{3}|COED\\s[A-Z]|DISS[A-Z]|THC-[A-Z]))",
    "g"
  );


  while ((match = takeYear.exec(text)) !== null) {
    const semester = match[0];
      
    const nextSemesterIndex = match.index + semester.length;
    let coursesText = "";
    if (match.index !== -1) {
      let semesterIndex = text.indexOf("SEMESTER", nextSemesterIndex);
      const summerIndex = text.indexOf("SUMMER", nextSemesterIndex);
      
      if (summerIndex !== -1 && (semesterIndex === -1 || summerIndex < semesterIndex)) {
        semesterIndex = summerIndex;
      }
      coursesText = text.substring(nextSemesterIndex, semesterIndex !== -1 ? semesterIndex : text.length);
    }

    if(coursesText.includes("Accredited Course(s)")){
      coursesText = coursesText.substring(0, coursesText.indexOf("Accredited Course(s)"))
    }

    let courseMatch;

    /*   INDICATORS:
    courseMatch[1] entire data parsed from regex pattern starting with courseCode with 4 digit combination ex. "1.7INC3.0COLLECTION MANAGEMENT OF INFORMATION RESOURCESIS 3104"
    courseMatch[2] FINAL grade from courseCode with 4 digit combination 
    courseMatch[3] MIDTERM grade from courseCode with 4 digit combination (ignore)
    courseMatch[4] # units of the course from courseCode with 4 digit combination  
    courseMatch[5] description of course with 4 digit combination
    courseMatch[6] courseCode "CIS, IS, IT"
    courseMatch[7] 4 digit combination "2101, 1101, 3203"
    courseMatch[8] entire data parsed from regex pattern for special cases such as "GE", "NSTP" and courses outside DCISM
    courseMatch[9] FINAL grade from special cases
    courseMatch[10] MIDTERM grade from special cases (ignore)
    courseMatch[11] # units of the course from special cases
    courseMatch[12] description of course from special cases
    courseMatch[13] courseCode of special cases returning alphanumeric values
    */
    while ((courseMatch = combinedPattern.exec(coursesText)) !== null) {
      const isMajorCourse = courseMatch[1] !== undefined;
      let grade = isMajorCourse ? courseMatch[2] : courseMatch[9];
      const desc = isMajorCourse ? courseMatch[5] : courseMatch[12];
      const code = isMajorCourse ? courseMatch[6] + " " + courseMatch[7] : courseMatch[13];
      const units = isMajorCourse ? courseMatch[4] : courseMatch[11]

      if(grade === 'INC' || grade === 'NG' || grade === 'W'){
          //as is
      }
      else{
       const actualGrade = parseFloat(grade);
       grade = (actualGrade <= 3.0) ? '1.0' : '0';
      /*   if(actualGrade >= 1.0 && actualGrade <= 1.1){
          grade = 'A+'
        }
        else if(actualGrade >= 1.2 && actualGrade <= 1.4){
          grade = 'A'
        }
        else if(actualGrade >= 1.5 && actualGrade <= 1.7){
          grade = 'A-'
        }
        else if(actualGrade >= 1.8 && actualGrade <= 2.0){
          grade = 'B+'
        }
        else if(actualGrade >= 2.1 && actualGrade <= 2.3){
          grade = 'B'
        }
        else if(actualGrade >= 2.4 && actualGrade <= 2.6){
          grade = 'B-'
        }
        else if(actualGrade >= 2.7 && actualGrade <= 2.9){
          grade = 'C+'
        }
        else if(actualGrade === 3.0){
          grade = 'C'
        }
        else{
          grade = 'F'
        }
        */
      } 
      courses.push(processCourse(semester, code, desc, grade, units));
      
    }
  }

  return {
    studentProgram,
    studentName,
    year: year,
    courses: courses,
  };
}

exports.createAccreditedCourses = async (req, res) => {
  try {
    const { studentId, accreditedCourse, equivalentCourse, file, schoolName } =
      req.body;
    const grade = await Grade.findOne({ studentId });

    if (!grade) {
      return res.status(404).json({ message: "Grade not found" });
    }

    const courseExist = grade.accreditedCourses.find((course) => course.accreditedCourse.courseCode === accreditedCourse.courseCode);

    if (courseExist) {
      return res.status(400).json({ message: "Course already exists" });
    }

    const course = {
      accreditedCourse: {
        courseCode: accreditedCourse.courseCode,
        courseDesc: accreditedCourse.courseDesc,
        isPassed: true,
      },
      equivalentCourse: {
        course: equivalentCourse.course,
        units: equivalentCourse.units,
        finalGrade: equivalentCourse.finalGrade,
        schoolTaken: schoolName,
      },
      file: {
        filePath: file.filePath,
        fileUrl: file.fileUrl,
      },
    };

    grade.accreditedCourses.push(course);
    await grade.save();

    // await createSuggestedCourses(studentId, grade);
    await updateFromAccreditation(accreditedCourse, equivalentCourse, studentId);
    await createStudyPlanForCurrentSem(studentId)
    await updateStudyPlan(studentId)

    res.status(200).json({ message: "Accredited course created successfully" });
  } catch (error) {
    console.error("Error creating accredited courses:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.editAccreditedCourse = async (req, res) => {
  try {
    const { studentId, id, accreditedCourse, equivalentCourse, file, schoolName } =
      req.body;
    const grade = await Grade.findOne({ studentId });

    const courseEdited = grade.accreditedCourses.find((course) => course._id == id);

    grade.accreditedCourses.remove(id);

    const courseExist = grade.accreditedCourses.find((course) => course.accreditedCourse.courseCode === accreditedCourse.courseCode);

    if (courseExist) {
      return res.status(400).json({ message: "Course already exists" });
    }

    grade.accreditedCourses.push({
      accreditedCourse: {
        courseCode: accreditedCourse.courseCode,
        courseDesc: accreditedCourse.courseDesc,
        isPassed: true,
      },
      equivalentCourse: {
        course: equivalentCourse.course,
        units: equivalentCourse.units,
        finalGrade: equivalentCourse.finalGrade,
        schoolTaken: schoolName,
      },
      file: {
        filePath: file.filePath,
        fileUrl: file.fileUrl,
      },
    });

    await grade.save();

    // await createSuggestedCourses(studentId, grade);

    let suggestedCourses = await SuggestedCourses.findOne({ studentId })

    if (suggestedCourses) {
      suggestedCourses.suggestedCourses = suggestedCourses.suggestedCourses.map(
        (course) => {
          if (course.course.courseCode === courseEdited.accreditedCourse.courseCode) {
            course.subjectTaken =
              equivalentCourse.course;
            course.grade = equivalentCourse.finalGrade;
          }
          return course; // return the course object for each iteration
        }
      );

      await suggestedCourses.save();
    }

    await createStudyPlanForCurrentSem(studentId);
    await updateStudyPlan(studentId);


    res.status(200).json({ message: "Accredited course edited successfully" });

  } catch (error) {
    console.error("Error editing accredited courses:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

exports.deleteAccreditedCourse = async (req, res) => {
  try {
    const { studentId, id, courseCode } = req.body;
    const grade = await Grade.findOne({studentId});

    grade.accreditedCourses.remove(id);

    await grade.save();

    const suggestedCourses = await SuggestedCourses.findOne({ studentId });

    if (suggestedCourses) {
      suggestedCourses.suggestedCourses = suggestedCourses.suggestedCourses.map((course) => {
        if (course.course.courseCode === courseCode) {
          course.isEligible = true;
          course.hasTaken = false;
          course.isPassed = false;
          course.subjectTaken = "";
          course.grade = "";
        }
        return course;
      });

      await suggestedCourses.save();
    }

    //await createSuggestedCourses(studentId, grade);
    await createStudyPlanForCurrentSem(studentId);
    await updateStudyPlan(studentId);

    res.status(200).json({ message: "Accredited course deleted successfully", grade });

  } catch (error) {
    console.error("Error deleting accredited courses:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

