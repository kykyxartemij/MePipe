
const express = require('express');
const multer = require('multer');
const { getAll, getOne, getPagedFiltered, downloadNewVideo } = require('./controllers/videoController');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.get('/videos', getAll);
router.get('/videos/:id', getOne);
router.get('/videos-paged', getPagedFiltered);
router.post('/videos', upload.single('video'), downloadNewVideo);

module.exports = router;
