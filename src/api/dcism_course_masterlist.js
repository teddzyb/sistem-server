const express = require("express");
const { getCourse } = require('../controllers/courseController');
const router = express.Router();

router.get('/', getCourse)

module.exports = router;