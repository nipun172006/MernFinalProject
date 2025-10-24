const University = require('../models/University');
const User = require('../models/User');
const { generateAuthToken } = require('../lib/auth');

function normalizeDomain(domain) {
  return String(domain || '')
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/\/$/, '');
}

exports.registerUniversity = async (req, res) => {
  try {
  const { universityName, domain, adminEmail, adminPassword, loanDaysDefault, finePerDay } = req.body || {};
    if (!universityName || !domain || !adminEmail || !adminPassword) {
      return res.status(400).json({ message: 'universityName, domain, adminEmail, adminPassword are required' });
    }

    const cleanedDomain = normalizeDomain(domain);
    const emailDomain = (String(adminEmail).toLowerCase().split('@')[1] || '').trim();
    if (emailDomain !== cleanedDomain) {
      return res.status(400).json({ message: 'Admin email domain must match the university domain' });
    }

    // Create or retrieve University
    let university = await University.findOne({ domain: cleanedDomain });
    if (university) {
      return res.status(409).json({ message: 'A university with this domain already exists' });
    }

    university = await University.create({
      name: universityName.trim(),
      domain: cleanedDomain,
      loanDaysDefault: Number(loanDaysDefault) > 0 ? Number(loanDaysDefault) : undefined,
      finePerDay: Number(finePerDay) >= 0 ? Number(finePerDay) : undefined,
    });

    // Create Admin
    const existing = await User.findOne({ email: adminEmail.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: 'Admin user email already exists' });
    }

    const admin = await User.create({
      email: adminEmail.toLowerCase(),
      password: adminPassword,
      role: 'Admin',
      universityRef: university._id,
    });

    university.adminRef = admin._id;
    await university.save();

    // Sign-in as Admin
    const token = generateAuthToken({ id: admin._id, role: admin.role, universityRef: admin.universityRef });
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 86400000,
    });

    return res.status(201).json({ id: admin._id, email: admin.email, role: admin.role });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};
