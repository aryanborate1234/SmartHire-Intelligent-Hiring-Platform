const Application = require('../models/Application');
const Job = require('../models/Job');

// @desc    Apply to a job
// @route   POST /api/applications
const applyToJob = async (req, res) => {
  try {
    const { jobId } = req.body;

    if (!jobId) {
      return res.status(400).json({ success: false, message: 'Job ID is required' });
    }

    const job = await Job.findById(jobId);
    if (!job || !job.isActive) {
      return res.status(404).json({ success: false, message: 'Job not found or inactive' });
    }

    const existing = await Application.findOne({ jobId, seekerId: req.user._id });
    if (existing) {
      return res.status(409).json({ success: false, message: 'You have already applied to this job' });
    }

    const application = await Application.create({
      jobId,
      seekerId: req.user._id,
      status: 'Applied'
    });

    res.status(201).json({ success: true, data: application });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get seeker's applications
// @route   GET /api/applications
const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ seekerId: req.user._id })
      .populate({
        path: 'jobId',
        select: 'title company location type salaryMin salaryMax'
      })
      .sort({ appliedAt: -1 });

    res.json({ success: true, data: applications });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update application status (recruiter)
// @route   PUT /api/applications/:id/status
const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Applied', 'Under Review', 'Shortlisted', 'Rejected'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const application = await Application.findById(req.params.id).populate('jobId');
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    // Verify recruiter owns the job
    if (application.jobId.recruiterId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    application.status = status;
    await application.save();

    res.json({ success: true, data: application });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Check if seeker applied to a specific job
// @route   GET /api/applications/check/:jobId
const checkApplication = async (req, res) => {
  try {
    const application = await Application.findOne({
      jobId: req.params.jobId,
      seekerId: req.user._id
    });

    res.json({ success: true, applied: !!application, data: application });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { applyToJob, getMyApplications, updateStatus, checkApplication };
