const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const BookItem = require('../models/BookItem');
const Loan = require('../models/Loan');

router.use(auth);

// GET /api/student/books/all
router.get('/books/all', async (req, res) => {
  try {
    const books = await BookItem.find({ universityRef: req.user.universityRef })
      .populate('activeLoans')
      .lean({ virtuals: true });

    const dayMs = 24 * 60 * 60 * 1000;
    const enriched = books.map((b) => {
      const borrowed = Array.isArray(b.activeLoans) ? b.activeLoans.length : 0;
      const available = Math.max(0, (b.totalCopies || 0) - borrowed);
      let minDue = null;
      if (Array.isArray(b.activeLoans)) {
        for (const l of b.activeLoans) {
          if (!l?.dueDate) continue;
          const d = new Date(l.dueDate);
          if (!minDue || d < minDue) minDue = d;
        }
      }
      const nextAvailableInDays = available > 0 ? 0 : (minDue ? Math.max(0, Math.ceil((minDue - Date.now()) / dayMs)) : null);
      return { ...b, availableCopies: available, nextAvailableInDays, soonestDueDate: minDue };
    });

    return res.json(enriched);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

// GET /api/student/books/available
router.get('/books/available', async (req, res) => {
  try {
    const books = await BookItem.find({ universityRef: req.user.universityRef })
      .populate('activeLoans')
      .lean({ virtuals: true });

    const available = books.filter((b) => (b.availableCopies || 0) > 0);
    return res.json(available);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/student/books/predictions
router.get('/books/predictions', async (req, res) => {
  try {
    const pipeline = [
      // Only active loans
      { $match: { returnDate: null } },
      // Lookup to book items to filter by student's university
      {
        $lookup: {
          from: 'bookitems',
          localField: 'bookItemRef',
          foreignField: '_id',
          as: 'book',
        },
      },
      { $unwind: '$book' },
      { $match: { 'book.universityRef': req.user.universityRef } },
      // Group by book to find soonest dueDate
      {
        $group: {
          _id: '$bookItemRef',
          title: { $first: '$book.title' },
          ISBN: { $first: '$book.ISBN' },
          minDueDate: { $min: '$dueDate' },
        },
      },
      { $sort: { minDueDate: 1 } },
    ];

    const results = await Loan.aggregate(pipeline);
    return res.json(results);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/student/books/search?q=term
router.get('/books/search', async (req, res) => {
  try {
    const q = String(req.query.q || '').trim();
    const filter = { universityRef: req.user.universityRef };
    if (q) {
      const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      Object.assign(filter, { $or: [{ title: rx }, { author: rx }, { ISBN: rx }] });
    }

    const books = await BookItem.find(filter).populate('activeLoans').lean({ virtuals: true });

    const dayMs = 24 * 60 * 60 * 1000;
    const enriched = books.map((b) => {
      const available = Math.max(0, (b.totalCopies || 0) - (Array.isArray(b.activeLoans) ? b.activeLoans.length : 0));
      let minDue = null;
      if (Array.isArray(b.activeLoans) && b.activeLoans.length > 0) {
        for (const l of b.activeLoans) {
          if (!l.dueDate) continue;
          const d = new Date(l.dueDate);
          if (!minDue || d < minDue) minDue = d;
        }
      }
      const nextAvailableInDays = available > 0 ? 0 : (minDue ? Math.max(0, Math.ceil((minDue - Date.now()) / dayMs)) : null);
      return { ...b, availableCopies: available, nextAvailableInDays, soonestDueDate: minDue };
    });

    return res.json(enriched);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});
