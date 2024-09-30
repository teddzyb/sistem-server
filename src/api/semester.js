const express = require("express");
const { createSemester, enablePetition, disablePetition, enableSpecialRequest, disableSpecialRequest, getSemester, getSemesters } = require("../controllers/semesterController");
const router = express.Router();

router.get('/', getSemester)

router.post('/', createSemester)

router.patch("/enable-petition/:id", enablePetition);

router.patch("/disable-petition/:id", disablePetition);

router.patch('/enable-special-request/:id', enableSpecialRequest)

router.patch("/disable-special-request/:id", disableSpecialRequest);

router.get("/all", getSemesters);

module.exports = router;