const express = require('express');
const router = express.Router();
const {
  getJobs,
  getJob,
  getRecommended,
  createJob,
  updateJob,
  deleteJob,
  getMyJobs,
  getApplicants
} = require('../controllers/jobController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getJobs);

// Protected routes — must be before /:id to avoid conflicts
router.get('/recommended', protect, authorize('seeker'), getRecommended);
router.get('/my-jobs', protect, authorize('recruiter'), getMyJobs);

// Specific job routes
router.get('/:id', getJob);
router.get('/:id/applicants', protect, authorize('recruiter'), getApplicants);

router.post('/', protect, authorize('recruiter'), createJob);
router.put('/:id', protect, authorize('recruiter'), updateJob);
router.delete('/:id', protect, authorize('recruiter'), deleteJob);

module.exports = router;
