const Bookmark = require('../models/Bookmark');
const Job = require('../models/Job');

// @desc    Add bookmark
// @route   POST /api/bookmarks/:jobId
const addBookmark = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    const existing = await Bookmark.findOne({ userId: req.user._id, jobId: req.params.jobId });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Job already bookmarked' });
    }

    await Bookmark.create({ userId: req.user._id, jobId: req.params.jobId });
    res.status(201).json({ success: true, message: 'Job bookmarked' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Remove bookmark
// @route   DELETE /api/bookmarks/:jobId
const removeBookmark = async (req, res) => {
  try {
    const bookmark = await Bookmark.findOneAndDelete({
      userId: req.user._id,
      jobId: req.params.jobId
    });

    if (!bookmark) {
      return res.status(404).json({ success: false, message: 'Bookmark not found' });
    }

    res.json({ success: true, message: 'Bookmark removed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get all bookmarks
// @route   GET /api/bookmarks
const getBookmarks = async (req, res) => {
  try {
    const bookmarks = await Bookmark.find({ userId: req.user._id }).populate({
      path: 'jobId',
      select: 'title company location type salaryMin salaryMax requiredSkills'
    });

    res.json({ success: true, data: bookmarks });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { addBookmark, removeBookmark, getBookmarks };
