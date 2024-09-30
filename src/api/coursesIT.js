const express = require("express");
const { getCourse } = require('../controllers/courseControllerIT');
const router = express.Router();

router.get('/', getCourse)

module.exports = router;