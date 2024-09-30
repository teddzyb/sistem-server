const express = require("express");
const { getSuggestedCourses } = require("../controllers/suggestedCourses");
const router = express.Router();

router.get("/:studentId", getSuggestedCourses)

module.exports = router;