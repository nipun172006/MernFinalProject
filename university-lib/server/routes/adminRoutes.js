const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');
const BookItem = require('../models/BookItem');
const AdminNotification = require('../models/AdminNotification');
const University = require('../models/University');
const { adminMutationsLimiter, csvImportLimiter } = require('../middleware/rateLimiters');
const { validateBookCreate, validateBookUpdate, validateSettingsUpdate } = require('../middleware/validate');

// All routes here are protected and require Admin role
router.use(auth, role('Admin'));

// POST /api/admin/books - create a new book for admin's university
router.post('/books', adminMutationsLimiter, async (req, res) => {
  try {
    const { ok, errors, value } = validateBookCreate(req.body)
    if (!ok) return res.status(400).json({ message: errors.join(', ') })

    const book = await BookItem.create({
      ...value,
      universityRef: req.user.universityRef,
    });

    return res.status(201).json(book);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/admin/books?page=&limit= - list books with pagination
router.get('/books', async (req, res) => {
  try {
    let page = Math.max(1, Number(req.query.page || 1))
    let limit = Math.max(1, Math.min(100, Number(req.query.limit || 12)))

    const filter = { universityRef: req.user.universityRef }
    const total = await BookItem.countDocuments(filter)
    const books = await BookItem.find(filter)
      .sort({ title: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('activeLoans')
      .lean({ virtuals: true });

    // Ensure availableCopies is correct even with lean + virtual populate
    const enriched = (books || []).map((b) => {
      const borrowed = Array.isArray(b.activeLoans) ? b.activeLoans.length : 0;
      const total = Number(b.totalCopies || 0);
      const available = Math.max(0, total - borrowed);
      return { ...b, availableCopies: available, totalCopies: total };
    });

    const totalPages = Math.max(1, Math.ceil(total / limit))
    return res.json({ items: enriched, page, limit, total, totalPages });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Bulk import books via CSV text
// POST /api/admin/books/import  { csvText: string }
router.post('/books/import', csvImportLimiter, async (req, res) => {
  try {
    const { csvText } = req.body || {};
    if (!csvText || typeof csvText !== 'string') {
      return res.status(400).json({ message: 'csvText is required as a string' });
    }
    // Very simple CSV parser: split lines, first line headers
    const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length < 2) return res.status(400).json({ message: 'CSV requires a header row and at least one data row' });
    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
    const idx = (name) => headers.indexOf(name);
    const required = ['title', 'isbn', 'totalcopies'];
    for (const r of required) if (idx(r) === -1) return res.status(400).json({ message: `Missing required column: ${r}` });

    let created = 0;
    let updated = 0;
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',');
      const title = (cols[idx('title')] || '').trim();
      const author = (cols[idx('author')] || '').trim();
      const ISBN = (cols[idx('isbn')] || '').trim();
      const coverImageUrl = (cols[idx('coverimageurl')] || '').trim();
      const description = (cols[idx('description')] || '').trim();
      const totalCopies = Number((cols[idx('totalcopies')] || '0').trim());
      const genresStr = idx('genres') !== -1 ? (cols[idx('genres')] || '').trim() : ''
      const ratingStr = idx('rating') !== -1 ? (cols[idx('rating')] || '').trim() : ''
      const genres = genresStr ? genresStr.split(/[;|,]/g).map((g) => g.trim()).filter(Boolean) : []
      const rating = ratingStr ? Math.max(0, Math.min(5, Number(ratingStr))) : undefined
      if (!title || !ISBN || !(totalCopies >= 0)) continue;

      const existing = await BookItem.findOne({ ISBN, universityRef: req.user.universityRef });
      if (existing) {
        existing.title = title;
        existing.author = author;
        existing.coverImageUrl = coverImageUrl;
        existing.description = description;
        existing.totalCopies = totalCopies;
        existing.genres = genres;
        if (rating !== undefined && Number.isFinite(rating)) existing.rating = rating;
        await existing.save();
        updated++;
      } else {
        await BookItem.create({ title, author, ISBN, coverImageUrl, description, totalCopies, genres, ...(rating!==undefined?{rating}:{}), universityRef: req.user.universityRef });
        created++;
      }
    }

    return res.json({ created, updated });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/admin/notifications?limit=20 - recent notifications for this university
router.get('/notifications', async (req, res) => {
  try {
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const list = await AdminNotification.find({ universityRef: req.user.universityRef })
      .populate({ path: 'userRef', select: 'email name' })
      .populate({ path: 'bookItemRef', select: 'title ISBN' })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    // Normalize response to always include key fields
    const normalized = (list || []).map((n) => ({
      _id: n._id,
      type: n.type,
      createdAt: n.createdAt,
      message: n.message,
      userEmail: n.userRef?.email || null,
      userName: n.userRef?.name || null,
      bookTitle: n.bookItemRef?.title || null,
      bookISBN: n.bookItemRef?.ISBN || null,
    }));

    return res.json(normalized);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /api/admin/university/settings - update loan/fine settings for this university
router.patch('/university/settings', async (req, res) => {
  try {
    const updates = {}
    const { loanDaysDefault, finePerDay } = req.body || {}
    const { ok, errors, value } = validateSettingsUpdate(req.body || {})
    if (!ok) return res.status(400).json({ message: errors.join(', ') })
    if (Object.keys(value).length === 0) return res.status(400).json({ message: 'No valid fields to update' })

    const uni = await University.findByIdAndUpdate(
      req.user.universityRef,
      { $set: value },
      { new: true, projection: 'loanDaysDefault finePerDay name domain' }
    ).lean()
    if (!uni) return res.status(404).json({ message: 'University not found' })
    return res.json(uni)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Server error' })
  }
})

// PUT /api/admin/books/:id - update editable fields of a book in this university
router.put('/books/:id', adminMutationsLimiter, async (req, res) => {
  try {
    const { id } = req.params
    const { ok, errors, value } = validateBookUpdate(req.body || {})
    if (!ok) return res.status(400).json({ message: errors.join(', ') })
    if (Object.keys(value).length === 0) return res.status(400).json({ message: 'No valid fields to update' })

    const book = await BookItem.findOneAndUpdate(
      { _id: id, universityRef: req.user.universityRef },
      { $set: value },
      { new: true }
    )
    if (!book) return res.status(404).json({ message: 'Book not found' })
    return res.json(book)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Server error' })
  }
})

// DELETE /api/admin/books/:id - remove a book from this university
router.delete('/books/:id', adminMutationsLimiter, async (req, res) => {
  try {
    const { id } = req.params
    const book = await BookItem.findOneAndDelete({ _id: id, universityRef: req.user.universityRef })
    if (!book) return res.status(404).json({ message: 'Book not found' })
    return res.json({ deleted: true })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Server error' })
  }
})

// Ensure export is at the bottom so all routes are mounted
module.exports = router;
