const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');
const BookItem = require('../models/BookItem');
const AdminNotification = require('../models/AdminNotification');

// All routes here are protected and require Admin role
router.use(auth, role('Admin'));

// POST /api/admin/books - create a new book for admin's university
router.post('/books', async (req, res) => {
  try {
    const { title, author, ISBN, coverImageUrl, description, totalCopies } = req.body;
    if (!title || !ISBN || totalCopies == null) {
      return res.status(400).json({ message: 'title, ISBN, totalCopies required' });
    }

    const book = await BookItem.create({
      title,
      author,
      ISBN,
      coverImageUrl,
      description,
      totalCopies: Number(totalCopies),
      universityRef: req.user.universityRef,
    });

    return res.status(201).json(book);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/admin/books - list all books for admin's university
router.get('/books', async (req, res) => {
  try {
    const books = await BookItem.find({ universityRef: req.user.universityRef })
      .populate('activeLoans')
      .lean({ virtuals: true });

    // Ensure availableCopies is correct even with lean + virtual populate
    const enriched = (books || []).map((b) => {
      const borrowed = Array.isArray(b.activeLoans) ? b.activeLoans.length : 0;
      const total = Number(b.totalCopies || 0);
      const available = Math.max(0, total - borrowed);
      return { ...b, availableCopies: available, totalCopies: total };
    });

    return res.json(enriched);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

// Bulk import books via CSV text
// POST /api/admin/books/import  { csvText: string }
router.post('/books/import', async (req, res) => {
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
      if (!title || !ISBN || !(totalCopies >= 0)) continue;

      const existing = await BookItem.findOne({ ISBN, universityRef: req.user.universityRef });
      if (existing) {
        existing.title = title;
        existing.author = author;
        existing.coverImageUrl = coverImageUrl;
        existing.description = description;
        existing.totalCopies = totalCopies;
        await existing.save();
        updated++;
      } else {
        await BookItem.create({ title, author, ISBN, coverImageUrl, description, totalCopies, universityRef: req.user.universityRef });
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
