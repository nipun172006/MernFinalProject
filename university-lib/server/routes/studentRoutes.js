const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const BookItem = require('../models/BookItem');
const Loan = require('../models/Loan');

router.use(auth);

// GET /api/student/books/all
router.get('/books/all', async (req, res) => {
  try {
    const filter = { universityRef: req.user.universityRef }
    // Genre filter: genres param can be comma-separated list
    const genresParam = (req.query.genres || '').trim()
    if (genresParam) {
      const list = genresParam.split(',').map((g) => g.trim()).filter(Boolean)
      if (list.length) filter.genres = { $in: list }
    }

    let query = BookItem.find(filter)
      
    const books = await query
      .populate('activeLoans')
      .lean({ virtuals: true });

    const dayMs = 24 * 60 * 60 * 1000;
    let enriched = books.map((b) => {
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

    // Sorting
    const sort = String(req.query.sort || '').toLowerCase()
    if (sort === 'rating') enriched.sort((a,b) => (b.rating||0) - (a.rating||0))
    else if (sort === 'popularity') enriched.sort((a,b) => (b.borrowCount||0) - (a.borrowCount||0))

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

    // Genre filter
    const genresParam = (req.query.genres || '').trim()
    if (genresParam) {
      const list = genresParam.split(',').map((g) => g.trim()).filter(Boolean)
      if (list.length) filter.genres = { $in: list }
    }

    const books = await BookItem.find(filter).populate('activeLoans').lean({ virtuals: true });

    const dayMs = 24 * 60 * 60 * 1000;
    let enriched = books.map((b) => {
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

    // Sorting
    const sort = String(req.query.sort || '').toLowerCase()
    if (sort === 'rating') enriched.sort((a,b) => (b.rating||0) - (a.rating||0))
    else if (sort === 'popularity') enriched.sort((a,b) => (b.borrowCount||0) - (a.borrowCount||0))

    return res.json(enriched);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/student/genres - distinct genres for current university
router.get('/genres', async (req, res) => {
  try {
    const list = await BookItem.distinct('genres', { universityRef: req.user.universityRef })
    const cleaned = (list || []).filter(Boolean).map((g) => String(g)).sort((a,b) => a.localeCompare(b))
    return res.json(cleaned)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Server error' })
  }
})
