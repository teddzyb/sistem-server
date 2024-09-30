const Semester = require("../models/semester");
const StudentPopulation = require("../models/studentPopulation");
const User = require("../models/user");

exports.createStudentPopulation = async (semester, year, students) => {
    try {
        // let students = await User.find({ user_type: "student" });

        // students = students.filter((student) => student.isActive );

        let IT  = students.filter((student) => student && student.program?.replace(/\s/g, '') === "BSIT");
        let IS  = students.filter((student) => student && student.program?.replace(/\s/g, '') === "BSIS");
        let CS  = students.filter((student) => student && student.program?.replace(/\s/g, '') === "BSCS");

        const studentPopulation = await StudentPopulation.create({
          semPeriod: {
            semester: semester,
            academicYear: year,
          },
          studentsPerProgram: [
            {
              program: "BS IT",
              population: IT.length,
              studentsByYearLevel: [
                {
                  yearLevel: "1",
                  population: IT.filter((student) => student.yearLevel === "1")
                    .length,
                },
                {
                  yearLevel: "2",
                  population: IT.filter((student) => student.yearLevel === "2")
                    .length,
                },
                {
                  yearLevel: "3",
                  population: IT.filter((student) => student.yearLevel === "3")
                    .length,
                },
                {
                  yearLevel: "4",
                  population: IT.filter((student) => student.yearLevel === "4")
                    .length,
                },
              ],
            },
            {
              program: "BS IS",
              population: IS.length,
              studentsByYearLevel: [
                {
                  yearLevel: "1",
                  population: IS.filter((student) => student.yearLevel === "1")
                    .length,
                },
                {
                  yearLevel: "2",
                  population: IS.filter((student) => student.yearLevel === "2")
                    .length,
                },
                {
                  yearLevel: "3",
                  population: IS.filter((student) => student.yearLevel === "3")
                    .length,
                },
                {
                  yearLevel: "4",
                  population: IS.filter((student) => student.yearLevel === "4")
                    .length,
                },
              ],
            },
            {
              program: "BS CS",
              population: CS.length,
              studentsByYearLevel: [
                {
                  yearLevel: "1",
                  population: CS.filter((student) => student.yearLevel === "1")
                    .length,
                },
                {
                  yearLevel: "2",
                  population: CS.filter((student) => student.yearLevel === "2")
                    .length,
                },
                {
                  yearLevel: "3",
                  population: CS.filter((student) => student.yearLevel === "3")
                    .length,
                },
                {
                  yearLevel: "4",
                  population: CS.filter((student) => student.yearLevel === "4")
                    .length,
                },
              ],
            },
          ],
        });


        return  studentPopulation 
    } catch (error) {
        console.log(error)
    }
}

exports.updateStudentPopulation = async (semester, year, students) => {
    try {
        let studentPopulation = await StudentPopulation.findOne({semPeriod: {semester: semester, academicYear: year}});
        if (!studentPopulation){
           studentPopulation = await this.createStudentPopulation(semester, year, students);
        } else {
            // let students = await User.find({ user_type: "student" });

            // students = students.filter((student) => student.isActive );

            let IT  = students.filter((student) => student && student.program?.replace(/\s/g, '') === "BSIT");
            let IS  = students.filter((student) => student && student.program?.replace(/\s/g, '') === "BSIS");
            let CS  = students.filter((student) => student && student.program?.replace(/\s/g, '') === "BSCS");

            studentPopulation.studentsPerProgram = [
                {
                    program: "BS IT",
                    population: IT.length,
                    studentsByYearLevel: [
                    {
                        yearLevel: "1",
                        population: IT.filter((student) => student.yearLevel === "1")
                        .length,
                    },
                    {
                        yearLevel: "2",
                        population: IT.filter((student) => student.yearLevel === "2")
                        .length,
                    },
                    {
                        yearLevel: "3",
                        population: IT.filter((student) => student.yearLevel === "3")
                        .length,
                    },
                    {
                        yearLevel: "4",
                        population: IT.filter((student) => student.yearLevel === "4")
                        .length,
                    },
                    ],
                },
                {
                    program: "BS IS",
                    population: IS.length,
                    studentsByYearLevel: [
                    {
                        yearLevel: "1",
                        population: IS.filter((student) => student.yearLevel === "1")
                        .length,
                    },
                    {
                        yearLevel: "2",
                        population: IS.filter((student) => student.yearLevel === "2")
                        .length,
                    },
                    {
                        yearLevel: "3",
                        population: IS.filter((student) => student.yearLevel === "3")
                        .length,
                    },
                    {
                        yearLevel: "4",
                        population: IS.filter((student) => student.yearLevel === "4")
                        .length,
                    },
                    ],
                },
                {
                    program: "BS CS",
                    population: CS.length,
                    studentsByYearLevel: [
                    {
                        yearLevel: "1",
                        population: CS.filter((student) => student.yearLevel === "1")
                        .length,
                    },
                    {
                        yearLevel: "2",
                        population: CS.filter((student) => student.yearLevel === "2")
                        .length,
                    },
                    {
                        yearLevel: "3",
                        population: CS.filter((student) => student.yearLevel === "3")
                        .length,
                    },
                    {
                        yearLevel: "4",
                        population: CS.filter((student) => student.yearLevel === "4")
                        .length,
                    },
                    ],
                },
                ];

            await studentPopulation.save();
        }

    } catch (error){
        console.log(error)
    }
}

exports.getStudentPopulation = async (req, res) => {
    try {
        const currentSemester = await Semester.findOne({ isCurrent: true });
        let studentPopulation = await StudentPopulation.find();

        // if (!studentPopulation.find((studentPopulation) => studentPopulation.semPeriod.semester === currentSemester.semester && studentPopulation.semPeriod.academicYear === currentSemester.year)){
        //    studentPopulation = await this.createStudentPopulation(currentSemester.semester, currentSemester.year);
        // }

        res.status(200).json({ studentPopulation });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}