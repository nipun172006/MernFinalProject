require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const University = require('../models/University');
const BookItem = require('../models/BookItem');

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: process.env.MONGO_DB || undefined,
    });
    console.log('Connected to MongoDB for seeding');

    // Upsert University
    const domain = process.env.SEED_DOMAIN || 'example.edu';
    const uniName = process.env.SEED_UNI_NAME || 'Example University';
    let university = await University.findOne({ domain });
    if (!university) {
      university = await University.create({ name: uniName, domain });
      console.log('Created University:', university.name, domain);
    } else {
      console.log('Using existing University:', university.name, domain);
    }

    // Upsert Admin
    const adminEmail = process.env.SEED_ADMIN_EMAIL || `admin@${domain}`;
    const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'Admin@12345';
    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      admin = await User.create({ email: adminEmail, password: adminPassword, role: 'Admin', universityRef: university._id });
      console.log('Created Admin user:', adminEmail);
    } else {
      console.log('Using existing Admin user:', adminEmail);
    }

    if (!university.adminRef) {
      university.adminRef = admin._id;
      await university.save();
      console.log('Linked admin to university');
    }

    // Upsert Student
    const studentEmail = process.env.SEED_STUDENT_EMAIL || `student@${domain}`;
    const studentPassword = process.env.SEED_STUDENT_PASSWORD || 'Student@12345';
    let student = await User.findOne({ email: studentEmail });
    if (!student) {
      student = await User.create({ email: studentEmail, password: studentPassword, role: 'Student', universityRef: university._id });
      console.log('Created Student user:', studentEmail);
    } else {
      console.log('Using existing Student user:', studentEmail);
    }

    // Seed some books
    const defaults = [
      { title: 'Clean Code', ISBN: '9780132350884', totalCopies: 3 },
      { title: 'Design Patterns', ISBN: '9780201633610', totalCopies: 2 },
      { title: 'You Don\'t Know JS', ISBN: '9781491904244', totalCopies: 4 },
    ];
    for (const b of defaults) {
      const exists = await BookItem.findOne({ ISBN: b.ISBN, universityRef: university._id });
      if (!exists) {
        await BookItem.create({ ...b, universityRef: university._id });
        console.log('Added book:', b.title);
      }
    }

    console.log('\nSeed complete:');
    console.log('- University:', university.name, domain);
    console.log('- Admin:', adminEmail, '(password:', adminPassword + ')');
    console.log('- Student:', studentEmail, '(password:', studentPassword + ')');
  } catch (err) {
    console.error('Seed error:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

run();
