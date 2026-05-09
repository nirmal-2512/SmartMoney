import * as usersService from './users.service.js';

export const getProfile = async (req, res, next) => {
  try {
    const user = await usersService.getProfile(req.user.id);
    res.status(200).json({ user });
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const user = await usersService.updateProfile(req.user.id, req.body);
    res.status(200).json({ user });
  } catch (err) {
    next(err);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const result = await usersService.changePassword(req.user.id, req.body);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const deleteAccount = async (req, res, next) => {
  try {
    const result = await usersService.deleteAccount(req.user.id);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};