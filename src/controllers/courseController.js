const courseModel = require("../models/coursesMaster");
/*
const courseModelIS = require("../models/coursesMaster");
const courseModelIT = require("../models/coursesMaster");
const courseModelCS = require("../models/coursesMaster");
*/


//CIS COURSES
exports.getCourse = async (req, res) => {
    try {
        const course = await courseModel.find().sort({courseID:1});
        return res.status(200).json({
            course
            
        });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
/*
// INFORMATION SYSTEMS
exports.getCourse = async (req, res) => {
    try {
        const course = await courseModelIS.find();
        return res.status(200).json({
            course
            
        });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
// INFORMATION TECHNOLOGY
exports.getCourse = async (req, res) => {
    try {
        const course = await courseModelIT.find();
        return res.status(200).json({
            course
            
        });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
// COMPUTER SCIENCE
exports.getCourse = async (req, res) => {
    try {
        const course = await courseModelCS.find();
        return res.status(200).json({
            course
            
        });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
*/