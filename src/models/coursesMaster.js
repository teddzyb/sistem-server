//GENERAL 1ST AND 2ND YEAR (CIS) COURSES COLLECTION
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

const courseModel = mongoose.model("CIS_courses", coursesSchema);
module.exports = courseModel;
/*
//INFORMATION SYSTEMS COURSES COLLECTION
const coursesSchemaIS = new mongoose.Schema(
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

const courseModelIS = mongoose.model("IS-Courses", coursesSchemaIS);
module.exports = courseModelIS;

//INFORMATION TECHNOLOGY COURSES COLLECTION
const coursesSchemaIT = new mongoose.Schema(
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

const courseModelIT = mongoose.model("IT-Courses", coursesSchemaIT);
module.exports = courseModelIT;

//COMPUTER SCIENCE COURSES COLLECTION
const coursesSchemaCS = new mongoose.Schema(
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

const courseModelCS = mongoose.model("CS-Courses", coursesSchemaCS);
module.exports = courseModelCS;
*/