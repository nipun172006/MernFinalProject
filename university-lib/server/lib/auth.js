const jwt = require('jsonwebtoken');

function generateAuthToken(payload) {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET not set');
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });
}

function verifyAuthToken(token) {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET not set');
  return jwt.verify(token, process.env.JWT_SECRET);
}

module.exports = { generateAuthToken, verifyAuthToken };
