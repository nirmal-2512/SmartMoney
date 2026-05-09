import { Notification } from '../../database/models/index.js';

export const getAllNotifications = async (userId) => {
  const notifications = await Notification.findAll({
    where: { userId },
    order: [['createdAt', 'DESC']],
  });
  return notifications;
};

export const markAsRead = async (userId, notificationId) => {
  const notification = await Notification.findOne({
    where: { id: notificationId, userId },
  });

  if (!notification) {
    const err = new Error('Notification not found');
    err.status = 404;
    err.code = 'NOTIFICATION_NOT_FOUND';
    throw err;
  }

  await notification.update({ isRead: true });
  return notification;
};

export const markAllAsRead = async (userId) => {
  await Notification.update(
    { isRead: true },
    { where: { userId, isRead: false } }
  );
  return { message: 'All notifications marked as read' };
};

export const deleteNotification = async (userId, notificationId) => {
  const notification = await Notification.findOne({
    where: { id: notificationId, userId },
  });

  if (!notification) {
    const err = new Error('Notification not found');
    err.status = 404;
    err.code = 'NOTIFICATION_NOT_FOUND';
    throw err;
  }

  await notification.destroy();
  return { message: 'Notification deleted successfully' };
};

export const getUnreadCount = async (userId) => {
  const count = await Notification.count({
    where: { userId: userId, isRead: false },
  });
  return { unreadCount: count };
};

export const createNotification = async ({
  userId,
  type,
  title,
  body,
  referenceId = null,
  referenceType = null,
}) => {
  const notification = await Notification.create({
    userId,
    type,
    title,
    body,
    referenceId,
    referenceType,
  });
  return notification;
};