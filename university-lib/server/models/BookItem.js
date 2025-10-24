const mongoose = require('mongoose');

const BookItemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    author: { type: String, trim: true, default: '' },
    ISBN: { type: String, required: true, trim: true },
    coverImageUrl: { type: String, trim: true, default: '' },
    description: { type: String, trim: true, default: '' },
    totalCopies: { type: Number, required: true, min: 0 },
    borrowCount: { type: Number, default: 0 },
    universityRef: { type: mongoose.Schema.Types.ObjectId, ref: 'University', required: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual populate for active loans
BookItemSchema.virtual('activeLoans', {
  ref: 'Loan',
  localField: '_id',
  foreignField: 'bookItemRef',
  match: { returnDate: null },
});

// availableCopies computed from totalCopies minus activeLoans length
BookItemSchema.virtual('availableCopies').get(function () {
  const borrowed = Array.isArray(this.activeLoans) ? this.activeLoans.length : 0;
  return Math.max(0, (this.totalCopies || 0) - borrowed);
});

module.exports = mongoose.model('BookItem', BookItemSchema);
