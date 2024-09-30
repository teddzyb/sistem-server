const express = require("express");
const { getCourse } = require('../controllers/courseContollerCS');
const router = express.Router();

router.get('/', getCourse)

module.exports = router;