import jwt from 'jsonwebtoken';
import { User } from '../../database/models/index.js';

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: { code: 'UNAUTHORIZED', message: 'No token provided' },
      });
    }

    const token = authHeader.split(' ')[1];
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    const user = await User.findByPk(payload.sub);
    if (!user || user.deletedAt) {
      return res.status(401).json({
        error: { code: 'UNAUTHORIZED', message: 'User not found' },
      });
    }

    const { passwordHash, deletedAt, ...safeUser } = user.toJSON();
    req.user = safeUser;
    next();
  } catch (err) {
    return res.status(401).json({
      error: { code: 'UNAUTHORIZED', message: 'Invalid or expired token' },
    });
  }
};

export default authenticate;