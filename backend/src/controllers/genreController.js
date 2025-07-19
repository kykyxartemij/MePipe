let genres = [
  { id: '1', name: 'Gaming' },
  { id: '2', name: 'Music' },
  { id: '3', name: 'Culture' },
  { id: '4', name: 'Horror' },
  { id: '5', name: 'Sports' },
  { id: '6', name: 'Movies' },
  { id: '7', name: 'Podcasts' },
  { id: '8', name: 'Jams' },
  { id: '9', name: 'Sketch Show' },
  { id: '10', name: 'Anime' },
  { id: '11', name: 'Action & Adventure' },
];

const getAllGenres = (req, res) => {
  res.json(genres);
};

const getPagedGenres = (req, res) => {
  const { page = 1, pageSize = 10, name = '' } = req.query;
  let filtered = genres.filter(g => g.name.toLowerCase().includes(name.toLowerCase()));
  const start = (page - 1) * pageSize;
  const paged = filtered.slice(start, start + parseInt(pageSize));
  res.json({
    total: filtered.length,
    page: parseInt(page),
    pageSize: parseInt(pageSize),
    genres: paged
  });
};

const addGenre = (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Genre name is required' });
  if (genres.find(g => g.name.toLowerCase() === name.toLowerCase())) {
    return res.status(409).json({ error: 'This genre already exists' });
  }
  const newGenre = { id: String(genres.length + 1), name };
  genres.push(newGenre);
  res.status(201).json(newGenre);
};

module.exports = { getAllGenres, getPagedGenres, addGenre };
