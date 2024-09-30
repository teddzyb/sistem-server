const Prospectus = require("../models/prospectus");

exports.getProspectus = async (req, res) => {
    try {
        const { program, effectiveYear } = req.params;

        const prospectuses = await Prospectus.find();
        let prospectus
       
        if (program.includes("IT")) {
          prospectus = prospectuses.filter(
            (prospectus) => prospectus.program.includes('IT') && prospectus.effectiveYear === effectiveYear
          );
        } else if (program.includes("CS")) {
          prospectus = prospectuses.filter(
            (prospectus) =>
              prospectus.program.includes("CS") &&
              (prospectus.effectiveYear === effectiveYear)
          );
        } else if (program.includes('IS')) {
          prospectus = prospectuses.filter(
            (prospectus) =>
              prospectus.program.includes("IS") &&
              (prospectus.effectiveYear === effectiveYear)
          );
        }

        res.status(200).json({prospectus: prospectus[0]});
    } catch (error) {
        console.log(error);
    }
}

exports.getProspectuses = async (req, res) => {
    try {
        const prospectuses = await Prospectus.find();
        res.status(200).json({prospectuses});
    } catch (error) {
        console.log(error);
    }
}