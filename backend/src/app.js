
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const app = express();

app.use(cors({
  credentials: true,
  origin: ['http://localhost:3000', 'http://localhost:5173'],
}));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/uploads', express.static('uploads'));


const videoRoutes = require('./videoRoutes');
const genreRoutes = require('./genreRoutes');
app.use('/api', videoRoutes);
app.use('/api', genreRoutes);

module.exports = app;
