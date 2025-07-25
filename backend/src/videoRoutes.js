
const express = require('express');
const multer = require('multer');
const { getAll, getOne, getPagedFiltered, downloadNewVideo, getComments, addComment } = require('./controllers/videoController');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.get('/videos', getAll);
router.get('/videos/:id', getOne);
router.get('/videos-paged', getPagedFiltered);
router.post('/videos', upload.single('video'), downloadNewVideo);
router.get('/videos/:id/comments', getComments);
router.post('/videos/:id/comments', addComment);

module.exports = router;
