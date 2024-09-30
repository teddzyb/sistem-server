const Notification = require('../models/notification');

exports.createNotification = async (recipients, link, message, itemID) => {
    try {
        const notification = await Notification.create({
            message,
            link,
            recipients : recipients?.map((recipient) => ({ recipient })),
            itemID,
            dateCreated: Date.now()
        });
        
        console.log('notification created');
    } catch (error) {
        console.log(error);
    }
}

exports.getNotifications = async (req, res) => {
    try {
        const { id } = req.params;
        let allNotifications = await Notification.find({ "recipients.recipient": id }).sort({ dateCreated: -1 });

        const notifications = allNotifications.filter((notification) => {
            return notification.recipients.some((recipient) => {
                return recipient.recipient?.toString() === id && !recipient.isRead;
            });
        });

        return res.status(200).json({ notifications });
    } catch (error) {
        return res.status(500).send(error.message);
    }
}

exports.markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const { recipientID } = req.body;
        const notification = await Notification.findById(id);

        if (notification) {
            notification.recipients.forEach((recipient) => {
                if (recipient.recipient?.toString() === recipientID) {
                  recipient.isRead = true;
                }
            });

            await notification.save();

            return res.status(200).json({ notification });
        } else {
            return res.status(404).send("Notification with the specified ID does not exist");
        }
    } catch (error) {
        return res.status(500).send(error.message);
    }
}