const express = require('express');
const { getProspectus, getProspectuses } = require('../controllers/prospectusController');
const router = express.Router();

router.get('/:program/:effectiveYear', getProspectus);

router.get('/', getProspectuses);

module.exports = router;