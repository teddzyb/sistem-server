const User = require("../models/user");
const xlsx = require("xlsx");
const { updateStudentPopulation } = require("./studentPopulationController");
const Semester = require("../models/semester");

exports.signInUser = async (req, res) => {
  try {
    const { email } = req.params;

    let user = await User.findOne({ email });

    if (!user) {
      return res.status(404).send("User not authorized.");
    } else if (!user.isActive) {
      return res
        .status(403)
        .send(
          "Sorry, your account has been DEACTIVATED. Please contact the administrator"
        );
    }

    return res.status(200).json({
      user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find();
    return res.status(200).json({ users });
  } catch (error) {
    return res.status(500).send(error.message);
  }
};

exports.getStudentUsers = async (req, res) => {
  try {
    const users = await User.find({ user_type: "student" });
    return res.status(200).json({ users });
  } catch (error) {
    return res.status(500).send(error.message);
  }
};

exports.getStudentsByProgram = async (req, res) => {
  try {
    const { program } = req.params;
    let students = await User.find({ user_type: "student" });
    students = students.filter(
      (student) =>
        student.program.replace(/\s/g, "") === program.replace(/\s/g, "")
    );
    return res.status(200).json({ students });
  } catch (error) {
    return res.status(500).send(error.message);
  }
};

exports.getFacultyUsers = async (req, res) => {
  try {
    const users = await User.find({ user_type: "faculty" });
    return res.status(200).json({ users });
  } catch (error) {
    return res.status(500).send(error.message);
  }
};

exports.addFacultyUser = async (req, res) => {
  try {
    const { email, firstName, lastName, position } = req.body;

    const user = await User.create({
      email,
      firstName,
      lastName,
      position,
      user_type: "faculty",
    });

    return res.status(201).json({ user });
  } catch (error) {
    return res.status(500).send(error.message);
  }
};

exports.updateStudentUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { program, yearLevel, firstName, lastName, email } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      {
        _id: id,
      },
      {
        program,
        yearLevel,
        firstName,
        lastName,
        email,
        
      },
      { new: true }
    );

    return res.status(200).json({
      updatedUser,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.updateFacultyUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { position, firstName, lastName, email } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      {
        _id: id,
      },
      {
        position,
        firstName,
        lastName,
        email,
      },
      { new: true }
    );

    return res.status(200).json({
      updatedUser,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.setUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const updatedUserStatus = await User.findByIdAndUpdate(
      {
        _id: id,
      },
      {
        isActive,
      },
      { new: true }
    );

    return res.status(200).json({
      updatedUserStatus,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.getRetainedStudents = async (req, res) => {
  try {
    const users = await User.find({ isRetained: true });

    // users.map(user => {
    //     user.isActive = false;
    //     user.save();
    // })

    return res.status(200).json({ users });
  } catch (error) {
    return res.status(500).send(error.message);
  }
};

exports.allowStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await User.findOne({ idNumber: id });

    student.isRetained = false;

    await student.save();

    return res.status(200).json({ student });
  } catch (error) {
    return res.status(500).send(error.message);
  }
};

exports.getUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);

    return res.status(200).json({ user });
  } catch (error) {
    return res.status(500).send(error.message);
  }
};

exports.importStudentUsers = async (req, res) => {
  try {
    let extractedData;
    const { semester, year } = req.body;
    if (req.files.file.name.endsWith(".xlsx") || req.files.file.name.endsWith(".xls")) {
      extractedData = extractDataFromExcel(req.files.file.data);
    } else {
      throw new Error("Unsupported file format");
    }

    const currentSemester = await Semester.findOne({
      isCurrent: true,
    });

    if (
      semester === currentSemester.semester &&
      year === currentSemester.year
    ) {

    const students = await User.find({ user_type: "student" });

    // await User.insertMany(extractedData);
    for (const data of extractedData) {
      if(data && (data.program === 'BS IT' || data.program === 'BS IS' || data.program === 'BS CS')){

        const student = await User.findOne({ email: data.email });
        if (!student) {
          await User.create(data);
        } else {
          student.program = data.program;
          student.effectiveYear = data.effectiveYear;
          student.yearLevel = data.yearLevel ? data.yearLevel : student.yearLevel;
          await student.save();
        }
      }
    }

      for (const student of students) {
          const found = extractedData.find(
            (data) =>  data && data.email === student.email
          );
          if (!found) {
            student.isActive = false;
            student.hasVerified = false
          } else {
            student.isActive = true;
            student.hasVerified = true
          }
          await student.save();
        }

        console.log('Successfully updated student details')
    }

    await updateStudentPopulation(semester, year, extractedData);

    res.status(201).json({extractedData})
  } catch (error) {
    console.error("Error handling file upload:", error);
    res.status(500).send("Internal Server Error");
  }
};

const extractDataFromExcel = (fileBuffer) => {
  const workbook = xlsx.read(fileBuffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(sheet)

  const extractedData = data.map((row) => {
    //   let userStatus = false;
    //   if (row['UserStatus'] === true || row['UserStatus'] === 'Active') {
    //     userStatus = true;
    //   }else{
    //     userStatus = false;
    //   }

    // row["__EMPTY"] student id
    // row["__EMPTY_3"] last name
    // row["__EMPTY_6"] first name
    // row["__EMPTY_10"] program
    // row["__EMPTY_17"] effective year
    // row["__EMPTY_19"] year level
    if (row.__EMPTY || row['Student ID']) {

    const email = row.__EMPTY ? row.__EMPTY.trim().toString()+'@usc.edu.ph' : row['Student ID']?.toString()+'@usc.edu.ph'

    return {
      idNumber: row.__EMPTY ? row.__EMPTY.trim().toString() : row['Student ID']?.toString(),
      firstName: row["__EMPTY_6"] ? row["__EMPTY_6"] : row['First Name'],
      lastName: row["__EMPTY_3"] ? row["__EMPTY_3"] : row['Last Name'],
      email: email,
      user_type: "student", // Default to 'student' if not provided
      program: row["__EMPTY_10"] ? row["__EMPTY_10"] : row['Program'],
      effectiveYear: row["__EMPTY_17"] ? row["__EMPTY_17"].toString() : row['Effective Year']?.toString(),
      yearLevel: row["__EMPTY_19"] ? row["__EMPTY_19"].toString() : row['Year Level']?.toString(),
      //isActive: true,
      isRetained: false,
      hasVerified: false,
    };
  }
  });

  console.log('Successfully extracted data from excel file')
  return extractedData;
};

exports.getByIdNumber = async (req, res) => {
  try {
    const { idNumber } = req.params;
    const user = await User.findOne({ idNumber }).populate("curriculum");

    return res.status(200).json({ user });
  } catch (error) {
    console.log(error);
    return res.status(500).send(error.message);
  }
};

exports.updateStudentInfo = async (req, res) => {
  try {
    // const { id } = req.params;
    const {
      firstName,
      lastName,
      email,
      yearLevel,
      program,
      curriculum,
      idNumber,
    } = req.body;
    const user = await User.findOne({ idNumber });

    // user.hasVerified = true;
    user.firstName = firstName;
    user.lastName = lastName;
    user.email = email;
    user.yearLevel = yearLevel;
    user.program = program;
    user.curriculum = curriculum;
    await user.save();

    return res.status(200).json({ user });
  } catch (error) {
    console.log(error);
    return res.status(500).send(error.message);
  }
};

exports.verifyStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findOne({ idNumber: id });

    user.hasVerified = true;

    await user.save();

    return res.status(200).json({ user });
  } catch (error) {
    console.log(error);
    return res.status(500).send(error.message);
  }
};
