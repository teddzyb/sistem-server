const courseModelIT = require("../models/coursesSlaveIT");

// INFORMATION TECHNOLOGY
exports.getCourse = async (req, res) => {
    try {
        const course = await courseModelIT.find().sort({courseID:1});
        return res.status(200).json({
            course   
        });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}