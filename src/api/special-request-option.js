const express = require("express");
const { getSpecialRequests, updateSpecialRequest, createSpecialRequest, deleteSpecialRequest } = require("../controllers/specialRequestOptionController");
const router = express.Router();

router.get("/", getSpecialRequests)

router.patch("/:id", updateSpecialRequest)

router.post('/', createSpecialRequest)

router.delete('/:id', deleteSpecialRequest)

module.exports = router;
