const express = require('express');
const { getAllGenres, getPagedGenres, addGenre } = require('./controllers/genreController');

const router = express.Router();

router.get('/genres', getAllGenres);
router.get('/genres-paged', getPagedGenres);
router.post('/genres', addGenre);

module.exports = router;
