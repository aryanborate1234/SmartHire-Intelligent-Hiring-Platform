const Job = require('../models/Job');
const Application = require('../models/Application');
const SeekerProfile = require('../models/SeekerProfile');
const { getRecommendedJobs } = require('../utils/matchScore');

// @desc    Get all jobs (with search, filter, pagination)
// @route   GET /api/jobs
const getJobs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { isActive: true };

    // Text search
    if (req.query.search) {
      filter.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { company: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Location filter
    if (req.query.location) {
      filter.location = { $regex: req.query.location, $options: 'i' };
    }

    // Job type filter
    if (req.query.type) {
      filter.type = req.query.type;
    }

    // Salary filter
    if (req.query.salaryMin) {
      filter.salaryMax = { $gte: parseInt(req.query.salaryMin) };
    }

    // Skills filter
    if (req.query.skills) {
      const skills = req.query.skills.split(',').map((s) => s.trim());
      filter.requiredSkills = { $in: skills.map((s) => new RegExp(s, 'i')) };
    }

    const total = await Job.countDocuments(filter);
    const jobs = await Job.find(filter)
      .populate('recruiterId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      data: jobs,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get single job with similar jobs
// @route   GET /api/jobs/:id
const getJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('recruiterId', 'name email');
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    // Find similar jobs based on shared skills
    const similarJobs = await Job.find({
      _id: { $ne: job._id },
      isActive: true,
      requiredSkills: { $in: job.requiredSkills }
    })
      .limit(4)
      .sort({ createdAt: -1 });

    res.json({ success: true, data: job, similarJobs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get recommended jobs for seeker
// @route   GET /api/jobs/recommended
const getRecommended = async (req, res) => {
  try {
    const profile = await SeekerProfile.findOne({ userId: req.user._id });
    if (!profile || !profile.skills.length) {
      return res.json({ success: true, data: [] });
    }

    const jobs = await Job.find({ isActive: true }).populate('recruiterId', 'name email');
    const recommended = getRecommendedJobs(profile.skills, jobs);

    res.json({ success: true, data: recommended });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Create a job (recruiter)
// @route   POST /api/jobs
const createJob = async (req, res) => {
  try {
    const { title, company, location, salaryMin, salaryMax, type, requiredSkills, description } = req.body;

    if (!title || !company || !location || !description) {
      return res.status(400).json({ success: false, message: 'Please fill all required fields' });
    }

    const job = await Job.create({
      title,
      company,
      location,
      salaryMin: salaryMin || 0,
      salaryMax: salaryMax || 0,
      type: type || 'Full-time',
      requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : [],
      description,
      recruiterId: req.user._id
    });

    res.status(201).json({ success: true, data: job });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update a job
// @route   PUT /api/jobs/:id
const updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    if (job.recruiterId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const updated = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete a job
// @route   DELETE /api/jobs/:id
const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    if (job.recruiterId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await Job.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Job deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get recruiter's own jobs
// @route   GET /api/jobs/my-jobs
const getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ recruiterId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: jobs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get applicants for a specific job
// @route   GET /api/jobs/:id/applicants
const getApplicants = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    if (job.recruiterId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const applicants = await Application.find({ jobId: req.params.id })
      .populate('seekerId', 'name email')
      .sort({ appliedAt: -1 });

    res.json({ success: true, data: applicants });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getJobs,
  getJob,
  getRecommended,
  createJob,
  updateJob,
  deleteJob,
  getMyJobs,
  getApplicants
};
