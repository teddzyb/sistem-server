const express = require('express');
const { getNotifications, markAsRead } = require('../controllers/notificationController');
const router = express.Router();

router.get('/:id', getNotifications)

router.patch('/:id', markAsRead);

module.exports = router;