const express = require("express"); 
const { getStudentPopulation } = require("../controllers/studentPopulationController");
const router = express.Router();

router.get("/", getStudentPopulation);

module.exports = router;