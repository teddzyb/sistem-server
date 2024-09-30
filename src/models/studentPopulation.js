const mongoose = require("mongoose");

const studentPopulationSchema = new mongoose.Schema(
    {
        semPeriod:{
            semester: {
                type: String,
                required: true
            },
            academicYear: {
                type: String,
                required: true
            },
        },
        studentsPerProgram: [
            {
                program: {
                    type: String,
                    required: true
                },
                population: {
                    type: Number,
                    required: true
                },
            studentsByYearLevel: [
                {
                    yearLevel: {
                        type: String,
                        required: true
                    },
                    population: {
                        type: Number,
                        required: true
                    }
                }
            ]
            }
        ]
    },
    {
        timestamps: true
    }
)

const StudentPopulation = mongoose.model("StudentPopulation", studentPopulationSchema);
module.exports = StudentPopulation;