const User = require('../models/User');
const University = require('../models/University');
const { generateAuthToken } = require('../lib/auth');

function extractDomain(email) {
  const parts = String(email).toLowerCase().split('@');
  return parts.length === 2 ? parts[1] : '';
}

exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

    const emailDomain = extractDomain(email);
    const university = await University.findOne({ domain: emailDomain });
    if (!university) return res.status(400).json({ message: 'Email domain not associated with any University' });

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(409).json({ message: 'User already exists' });

    const user = await User.create({
      email: email.toLowerCase(),
      password,
      role: 'Student',
      universityRef: university._id,
    });

    const token = generateAuthToken({ id: user._id, role: user.role, universityRef: user.universityRef });
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 86400000,
    });

    return res.status(201).json({ id: user._id, email: user.email, role: user.role });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const ok = await user.comparePassword(password);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    const token = generateAuthToken({ id: user._id, role: user.role, universityRef: user.universityRef });
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 86400000,
    });

    return res.json({ id: user._id, email: user.email, role: user.role });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.logout = async (req, res) => {
  res.clearCookie('auth_token');
  return res.json({ message: 'Logged out' });
};

exports.status = async (req, res) => {
  // req.user is set by authMiddleware
  return res.json(req.user);
};
