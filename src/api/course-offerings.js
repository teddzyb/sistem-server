const express = require('express');
const { getCourseOfferings, getCurrentCourseOfferings } = require('../controllers/courseOfferingsController');
const router = express.Router();

router.get('/', getCurrentCourseOfferings)

router.get('/semester/:semester/:year', getCourseOfferings)

module.exports = router;