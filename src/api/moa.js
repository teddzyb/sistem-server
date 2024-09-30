const express = require("express");
const { createMOA, getMOA, updateMOA, deleteMOA, createMOATypes, getMOATypes, updateMOATypes, deleteMOATypes } = require('../controllers/moaController');
const router = express.Router();

// const upload = multer({ storage: multer.memoryStorage() });

router.post('/', createMOA)

router.get('/', getMOA)

router.patch('/:id', updateMOA)

router.delete('/:id', deleteMOA)

router.get('/types', getMOATypes)

router.post('/types', createMOATypes)

router.patch('/types/:id', updateMOATypes)

router.delete('/types/:id', deleteMOATypes)

module.exports = router;