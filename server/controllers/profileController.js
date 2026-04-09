const multer = require('multer');
const path = require('path');
const fs = require('fs');
const SeekerProfile = require('../models/SeekerProfile');
const RecruiterProfile = require('../models/RecruiterProfile');

// Multer config for resume upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `resume_${req.user._id}_${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// @desc    Get seeker profile
// @route   GET /api/profile/seeker
const getSeekerProfile = async (req, res) => {
  try {
    const profile = await SeekerProfile.findOne({ userId: req.user._id });
    if (!profile) return res.status(404).json({ success: false, message: 'Profile not found' });
    res.json({ success: true, data: profile });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update seeker profile
// @route   PUT /api/profile/seeker
const updateSeekerProfile = async (req, res) => {
  try {
    const { skills, experience, location, bio } = req.body;

    const updateData = {};
    if (skills !== undefined) {
      updateData.skills = Array.isArray(skills) ? skills : skills.split(',').map((s) => s.trim()).filter(Boolean);
    }
    if (experience !== undefined) updateData.experience = experience;
    if (location !== undefined) updateData.location = location;
    if (bio !== undefined) updateData.bio = bio;

    // Handle resume upload
    if (req.file) {
      updateData.resumeUrl = `/uploads/${req.file.filename}`;
      updateData.resumeOriginalName = req.file.originalname;
    }

    const profile = await SeekerProfile.findOneAndUpdate(
      { userId: req.user._id },
      { $set: updateData },
      { new: true, upsert: true }
    );

    res.json({ success: true, data: profile });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get recruiter profile
// @route   GET /api/profile/recruiter
const getRecruiterProfile = async (req, res) => {
  try {
    const profile = await RecruiterProfile.findOne({ userId: req.user._id });
    if (!profile) return res.status(404).json({ success: false, message: 'Profile not found' });
    res.json({ success: true, data: profile });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update recruiter profile
// @route   PUT /api/profile/recruiter
const updateRecruiterProfile = async (req, res) => {
  try {
    const { companyName, website, description } = req.body;

    const profile = await RecruiterProfile.findOneAndUpdate(
      { userId: req.user._id },
      { $set: { companyName, website, description } },
      { new: true, upsert: true }
    );

    res.json({ success: true, data: profile });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getSeekerProfile,
  updateSeekerProfile,
  getRecruiterProfile,
  updateRecruiterProfile,
  upload
};
