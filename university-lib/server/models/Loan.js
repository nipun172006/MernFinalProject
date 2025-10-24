const mongoose = require('mongoose');

const LoanSchema = new mongoose.Schema(
  {
    bookItemRef: { type: mongoose.Schema.Types.ObjectId, ref: 'BookItem', required: true },
    studentRef: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    dueDate: { type: Date, required: true },
    returnDate: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Loan', LoanSchema);
