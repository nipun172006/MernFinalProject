const router = require('express').Router();
const { registerUniversity } = require('../controllers/onboardingController');

// Public onboarding endpoint
// POST /api/onboarding/university-register
router.post('/university-register', registerUniversity);

module.exports = router;
