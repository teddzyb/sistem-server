const Semester = require("../models/semester");
const User = require("../models/user");

exports.getSemester =  async (req, res) => {
    try {
        const semester = await Semester.findOne({ isCurrent: true })

        if (!semester) {
            return res.status(404).send('Semester not found');
        }

        res.status(200).json(semester);
    } catch (error) {
        res.status(400).send(error);
    }

}

exports.createSemester = async (req, res) => {
    try {
        const { year, semester } = req.body;

        let semesterExists = await Semester.findOne({ year, semester });

        await Semester.updateMany({}, { isCurrent: false, petitionEnabled: false, specialRequestEnabled: false});

        if (semesterExists) {
            semesterExists.isCurrent = true;
            await semesterExists.save();
        } else{
            const newSemester = new Semester(
                {
                    year,
                    semester,
                    isCurrent: true,
                }
            );

            await newSemester.save();
        }

        enableBannedStudents();

        res.status(201).send('Semester created successfully');
    } catch (error) {
        res.status(400).send(error);
    }
}

exports.enablePetition = async (req, res) => {
    try {
        const { id } = req.params;
        const semester = await Semester.findById(id);

        if (!semester) {
            return res.status(404).send('Semester not found');
        }

        semester.petitionEnabled = true;

        await semester.save();

        res.status(200).send('Petition enabled successfully');
    } catch (error) {
        res.status(400).send(error)
    }
}

exports.disablePetition = async (req, res) => {
    try {
        const { id } = req.params;
        const semester = await Semester.findById(id);

        if (!semester) {
            return res.status(404).send('Semester not found');
        }

        semester.petitionEnabled = false;

        await semester.save();

        res.status(200).send('Petition disabled successfully');
    } catch (error) {
        res.status(400).send(error)
    }
}

exports.enableSpecialRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const semester = await Semester.findById(id);

        if (!semester) {
            return res.status(404).send('Semester not found');
        }

        semester.specialRequestEnabled = true;

        await semester.save();


        res.status(200).send('Special request enabled successfully');
    } catch (error) {
        res.status(400).send(error)
    }
}

exports.disableSpecialRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const semester = await Semester.findById(id);

        if (!semester) {
            return res.status(404).send('Semester not found');
        }

        semester.specialRequestEnabled = false;

        await semester.save();


        res.status(200).send('Special request disabled successfully');
    } catch (error) {
        res.status(400).send(error)
    }
}

exports.getSemesters = async (req, res) => {
    try {
        const semesters = await Semester.find();

        if (!semesters) {
            return res.status(404).send('Semesters not found');
        }

        res.status(200).json({semesters});
    } catch (error) {
        res.status(400).send(error);
    }
}

const enableBannedStudents = async () => {
    try {
        const bannedStudents = await User.find({ banToPetition: true });

        for (let student of bannedStudents) {
            student.banToPetition = false;
            await student.save();
        }
    
        console.log('Banned students enabled')
    } catch (error) {
        console.log(error)
    }
}