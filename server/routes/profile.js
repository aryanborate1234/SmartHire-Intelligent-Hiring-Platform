const express = require('express');
const router = express.Router();
const {
  getSeekerProfile,
  updateSeekerProfile,
  getRecruiterProfile,
  updateRecruiterProfile,
  upload
} = require('../controllers/profileController');
const { protect, authorize } = require('../middleware/auth');

router.get('/seeker', protect, authorize('seeker'), getSeekerProfile);
router.put('/seeker', protect, authorize('seeker'), upload.single('resume'), updateSeekerProfile);

router.get('/recruiter', protect, authorize('recruiter'), getRecruiterProfile);
router.put('/recruiter', protect, authorize('recruiter'), updateRecruiterProfile);

module.exports = router;
