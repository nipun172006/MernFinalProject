const { verifyAuthToken } = require('../lib/auth');

module.exports = function authMiddleware(req, res, next) {
  try {
    const token = req.cookies?.auth_token;
    if (!token) return res.status(401).json({ message: 'Unauthorized' });
    const payload = verifyAuthToken(token);
    if (!payload) return res.status(401).json({ message: 'Unauthorized' });
    // Expect payload to contain id, role, universityRef
    req.user = { id: payload.id, role: payload.role, universityRef: payload.universityRef };
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
};
