const express = require("express");
// const multer = require('multer');
const {
  signInUser,
  getUsers,
  getStudentUsers,
  getFacultyUsers,
  updateStudentUser,
  updateFacultyUser,
  setUserStatus,
  getRetainedUsers,
  getRetainedStudents,
  getUser,
  importStudentUsers,
  getByIdNumber,
  addFacultyUser,
  verifyStudentUser,
  updateStudentInfo,
  verifyStudent,
  allowStudent,
  getStudentsByProgram,
} = require("../controllers/userController");
const router = express.Router();

/* const storage = multer.memoryStorage();
const upload = multer({ storage: storage }); */

router.get("/sign-in/:email", signInUser);

router.get('/all-users', getUsers)

router.get('/all-students', getStudentUsers)

router.get('/all-faculties', getFacultyUsers)

router.get('/retained-students', getRetainedStudents)

router.get('/:program', getStudentsByProgram)

router.patch('/update-student/:id', updateStudentUser)

router.patch('/update-faculty/:id', updateFacultyUser)

router.post('/faculty', addFacultyUser)

router.patch('/update-user-status/:id', setUserStatus)


router.patch('/allow-student/:id', allowStudent)

router.get('/user/:userId', getUser)

router.post('/',  importStudentUsers);

router.get('/id/:idNumber', getByIdNumber)

router.patch('/student-update', updateStudentInfo)

router.patch('/verify-student/:id', verifyStudent)

module.exports = router;