const { verifyAccessToken } = require('../utils/jwt');

function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded; // attach the decoded payload so later handlers can use req.user.userId
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Token is invalid or has expired' });
  }
}

module.exports = authMiddleware;