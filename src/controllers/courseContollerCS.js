const courseModelCS = require("../models/coursesSlaveCS");
// COMPUTER SCIENCE
exports.getCourse = async (req, res) => {
    try {
        const course = await courseModelCS.find().sort({courseID:1});
        return res.status(200).json({
            course
            
        });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}