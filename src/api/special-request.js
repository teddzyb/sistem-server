const express = require("express");
const { getSpecialRequests, getSpecialRequestById, createSpecialRequest, updateSpecialRequest, coordinatorApprove, chairApprove, getStudentSpecialRequest, setInProgess, cancelSpecialRequest, getSpecialRequestBySemester, getStudentSpecialRequestBySem, getCurrentSpecialRequests, getSpecialRequestsByProgram, getSpecialRequestsBySemesterAndProgram } = require("../controllers/specialRequestController");
const router = express.Router();

router.get("/", getSpecialRequests)

router.post('/', createSpecialRequest)

router.patch('/:id', updateSpecialRequest)

router.patch('/coordinator-approve/:id', coordinatorApprove)

router.patch('/chair-approve/:id', chairApprove)

router.get('/student/:id', getStudentSpecialRequest)

router.patch('/in-progress/:id', setInProgess)

router.patch('/cancel/:id', cancelSpecialRequest)

router.get('/semester/:year/:semester', getSpecialRequestBySemester)

router.get('/student/:year/:semester/:id', getStudentSpecialRequestBySem)

router.get('/per-program/:program', getSpecialRequestsByProgram)

router.get('/program-current/:year/:semester/:program', getSpecialRequestsBySemesterAndProgram)

router.get("/:id", getSpecialRequestById);


module.exports = router;