const mongoose = require("mongoose");
const coursesSchema = new mongoose.Schema(
    {
        courseCode: { 
            type: String, 
        },
        courseDesc: [
            {
                type: String,
            }
        ],
    },
    {
        timestamps: true
    }
)

const courseModel = mongoose.model("IS_courses", coursesSchema);
module.exports = courseModel;