const express = require('express');
const router = express.Router();
const { applyToJob, getMyApplications, updateStatus, checkApplication } = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('seeker'), applyToJob);
router.get('/', protect, authorize('seeker'), getMyApplications);
router.get('/check/:jobId', protect, authorize('seeker'), checkApplication);
router.put('/:id/status', protect, authorize('recruiter'), updateStatus);

module.exports = router;
