const mongoose = require('mongoose');

const UniversitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    domain: { type: String, required: true, unique: true, lowercase: true, trim: true },
    adminRef: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    // Settings
    loanDaysDefault: { type: Number, default: 7, min: 1 },
    finePerDay: { type: Number, default: 0.5, min: 0 }, // in your currency units per day
  },
  { timestamps: true }
);

module.exports = mongoose.model('University', UniversitySchema);
