const express = require("express");
const { getCourse } = require('../controllers/courseControllerIS');
const router = express.Router();

router.get('/', getCourse)

module.exports = router;