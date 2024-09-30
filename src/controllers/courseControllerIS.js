const courseModelIS = require("../models/coursesSlaveIS");

// INFORMATION SYSTEMS
exports.getCourse = async (req, res) => {
    try {
        const course = await courseModelIS.find().sort({courseID:1});;
        return res.status(200).json({
            course
            
        });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}