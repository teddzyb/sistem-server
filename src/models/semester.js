const mongoose = require("mongoose");

const semesterSchema = new mongoose.Schema(
    {
        year: {
            type: String,
            required: true,
        },
        semester: {
            type: String,
            required: true,
        },
        isCurrent: {
            type: Boolean,
            default: false,
        },
        petitionEnabled: {
            type: Boolean,
            default: false,
        },
        specialRequestEnabled: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
)

const Semester = mongoose.model("Semester", semesterSchema);
module.exports = Semester;