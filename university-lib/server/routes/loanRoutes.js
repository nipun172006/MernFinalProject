const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const BookItem = require('../models/BookItem');
const Loan = require('../models/Loan');
const University = require('../models/University');
const AdminNotification = require('../models/AdminNotification');

router.use(auth);

// POST /api/loans/checkout
router.post('/checkout', async (req, res) => {
  try {
    const { bookItemId, durationDays } = req.body;
    if (!bookItemId) return res.status(400).json({ message: 'bookItemId required' });

    const book = await BookItem.findOne({ _id: bookItemId, universityRef: req.user.universityRef })
      .populate('activeLoans');
    if (!book) return res.status(404).json({ message: 'Book not found' });

    const borrowed = book.activeLoans ? book.activeLoans.length : 0;
    const available = (book.totalCopies || 0) - borrowed;
    if (available <= 0) return res.status(400).json({ message: 'No copies available' });

  // Determine loan duration from university setting
    const uni = await University.findById(req.user.universityRef).lean();
    const requested = Number(durationDays);
    const baseDays = Math.max(1, Number(uni?.loanDaysDefault || 7));
    // Allow user-specified duration within 7 to 28 days by default
    const days = Number.isFinite(requested) && requested > 0
      ? Math.max(1, Math.min(28, Math.round(requested)))
      : baseDays;
  const dueDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    const loan = await Loan.create({
      bookItemRef: book._id,
      studentRef: req.user.id,
      dueDate,
    });

    // Increment popularity
    await BookItem.updateOne({ _id: book._id }, { $inc: { borrowCount: 1 } });

    // Create admin notification
    try {
      const who = req.user?.email || req.user?.name || 'A student'
      const msg = `${who} borrowed "${book.title}" (${book.ISBN || 'no ISBN'})`
      await AdminNotification.create({
        universityRef: req.user.universityRef,
        userRef: req.user.id,
        bookItemRef: book._id,
        type: 'borrow',
        message: msg,
      })
    } catch (e) {
      console.warn('Failed to create admin notification:', e?.message || e)
    }

    return res.status(201).json(loan);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/loans/return/:loanId
router.post('/return/:loanId', async (req, res) => {
  try {
    const { loanId } = req.params;
    const loan = await Loan.findById(loanId).populate({
      path: 'bookItemRef',
      select: 'universityRef title ISBN',
    });
    if (!loan) return res.status(404).json({ message: 'Loan not found' });

    // Authorization: student can only return their own; Admins can return any within same university
    const isOwner = String(loan.studentRef) === String(req.user.id);
    const sameUni = String(loan.bookItemRef.universityRef) === String(req.user.universityRef);

    if (!(isOwner || (req.user.role === 'Admin' && sameUni))) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    if (loan.returnDate) return res.status(400).json({ message: 'Already returned' });

    loan.returnDate = new Date();
    await loan.save();

  // Calculate fine if overdue
    let fine = 0;
    if (loan.returnDate > loan.dueDate) {
      const uni = await University.findById(req.user.universityRef).lean();
      const perDay = Math.max(0, Number(uni?.finePerDay || 0));
      const dayMs = 24 * 60 * 60 * 1000;
      const daysLate = Math.ceil((loan.returnDate - loan.dueDate) / dayMs);
      fine = daysLate * perDay;
    }
    // Create admin notification for return
    try {
      const who = req.user?.email || req.user?.name || 'A student'
      const msg = `${who} returned "${loan.bookItemRef?.title || 'a book'}" (${loan.bookItemRef?.ISBN || 'no ISBN'})`
      await AdminNotification.create({
        universityRef: req.user.universityRef,
        userRef: req.user.id,
        bookItemRef: loan.bookItemRef?._id || loan.bookItemRef,
        type: 'return',
        message: msg,
      })
    } catch (e) {
      console.warn('Failed to create admin return notification:', e?.message || e)
    }

    return res.json({ ...loan.toObject(), fineCharged: fine });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/loans/mine - list current user's loans
router.get('/mine', async (req, res) => {
  try {
    const loans = await Loan.find({ studentRef: req.user.id })
      .populate({ path: 'bookItemRef', select: 'title ISBN author coverImageUrl' })
      .sort({ createdAt: -1 });
    return res.json(loans);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
