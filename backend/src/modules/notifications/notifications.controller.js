import * as notificationsService from './notifications.service.js';

export const getAllNotifications = async (req, res, next) => {
  try {
    const notifications = await notificationsService.getAllNotifications(req.user.id);
    res.status(200).json({ notifications });
  } catch (err) {
    next(err);
  }
};

export const getUnreadCount = async (req, res, next) => {
  try {
    const result = await notificationsService.getUnreadCount(req.user.id);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const notification = await notificationsService.markAsRead(req.user.id, req.params.id);
    res.status(200).json({ notification });
  } catch (err) {
    next(err);
  }
};

export const markAllAsRead = async (req, res, next) => {
  try {
    const result = await notificationsService.markAllAsRead(req.user.id);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const deleteNotification = async (req, res, next) => {
  try {
    const result = await notificationsService.deleteNotification(req.user.id, req.params.id);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};