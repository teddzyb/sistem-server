const express = require("express");
const  {submitGrades, getGradesInfo, saveGrades, createAccreditedCourses, editAccreditedCourse, deleteAccreditedCourse}  = require('../controllers/gradesController');
const router = express.Router();


router.post('/', /* upload.single('file'), */ submitGrades)

router.get('/:id', getGradesInfo)

router.post('/save', saveGrades)

router.patch('/create-accredited', createAccreditedCourses)

router.patch('/update-accredited', editAccreditedCourse)

router.patch('/delete-accredited', deleteAccreditedCourse)


module.exports = router;