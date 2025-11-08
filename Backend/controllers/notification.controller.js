import Notification from "../models/notification.model.js";

export const getAllNotifications = async (req, res) => {
    const userId = req.user._id;

    try {

        if (!userId) return res.status(401).json({ message: "Unauthorized" });

        const notifications = await Notification.find({to : userId}).sort({createdAt: -1}).populate({
            path: "from",
            select: "username profileImg"
        })

        await Notification.updateMany({to: userId, read: false}, {read: true});
        res.status(200).json(notifications);

    }catch (error) {
        console.log("Error in getting notifications:", error);
        res.status(500).json({ message: "Server error" });
    }

}


export const deleteNotification = async (req, res) => {
    const userId  = req.user._id;

    try {

        await Notification.deleteMany({to: userId});
        res.status(200).json({ message: "Notifications deleted successfully" });

    }catch (error) {
        console.log("Error in deleting notification:", error);
        res.status(500).json({ message: "Server error" });
    }
}

export const deleteOneNotification = async (req, res) => {
    const userId = req.user._id
    const {id: notificationId} = req.params;

    try {
        if(!userId) return res.status(401).json({ message: "Unauthorized" });
        const notification = await Notification.findOneAndDelete({ _id: notificationId, to: userId });
        if (!notification) return res.status(404).json({ message: "Notification not found" });
        res.status(200).json({ message: "Notification deleted successfully" });
    }catch (error) {
        console.log("Error in deleting notification:", error);
        res.status(500).json({ message: "Server error" });  
    }
}