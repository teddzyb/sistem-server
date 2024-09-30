const express = require('express');
const { getStudyPlan, addToStudyPlan, removeFromStudyPlan, getStudyPlanBySem, createStudyPlanForSem, removeAllFromStudyPlan } = require('../controllers/studentStudyPlanController');
const router = express.Router();

router.get('/:studentId', getStudyPlan)

router.patch('/add', addToStudyPlan)

router.patch('/remove', removeFromStudyPlan)

router.patch('/remove-all', removeAllFromStudyPlan)

router.get('/student/:year/:semester/:studentId', getStudyPlanBySem)

router.post('/', createStudyPlanForSem)

module.exports = router;