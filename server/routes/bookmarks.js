const express = require('express');
const router = express.Router();
const { addBookmark, removeBookmark, getBookmarks } = require('../controllers/bookmarkController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getBookmarks);
router.post('/:jobId', protect, addBookmark);
router.delete('/:jobId', protect, removeBookmark);

module.exports = router;
