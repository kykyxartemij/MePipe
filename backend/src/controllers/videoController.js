
const express = require('express');
const cors = require('cors');   

let videos = [
  { id: 1, title: 'First Video', url: '/uploads/video1.mp4', description: 'This is the first video' },
  { id: 2, title: 'Second Video', url: '/uploads/video2.mp4', description: 'This is the second video' },
];

let comments = [
  { id: 1, videoId: 1, text: 'Great video!' },
  { id: 2, videoId: 1, text: 'Thanks for sharing!' },
  { id: 3, videoId: 2, text: 'Nice content!' },
];

const getAll = (req, res) => {
  res.json(videos);
};

const getOne = (req, res) => {
  const video = videos.find(v => v.id === parseInt(req.params.id));
  if (!video) return res.status(404).json({ error: 'Видео не найдено' });
  res.json(video);
};

const getPagedFiltered = (req, res) => {
  const { page = 1, pageSize = 5, title = '' } = req.query;
  let filtered = videos.filter(v => v.title.toLowerCase().includes(title.toLowerCase()));
  const start = (page - 1) * pageSize;
  const paged = filtered.slice(start, start + parseInt(pageSize));
  res.json({
    total: filtered.length,
    page: parseInt(page),
    pageSize: parseInt(pageSize),
    videos: paged
  });
};

const downloadNewVideo = (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Нет файла' });
  const newVideo = {
    id: videos.length + 1,
    title: req.body.title || `Видео ${videos.length + 1}`,
    url: `/uploads/${req.file.filename}`,
    description: req.body.description || ''
  };
  videos.push(newVideo);
  res.status(201).json(newVideo);
};

const getComments = (req, res) => {
  const videoId = parseInt(req.params.id);
  const videoComments = comments.filter(c => c.videoId === videoId);
  res.json(videoComments);
};

const addComment = (req, res) => {
  const videoId = parseInt(req.params.id);
  const newComment = {
    id: comments.length + 1,
    videoId: videoId,
    text: req.body.text
  };
  comments.push(newComment);
  res.status(201).json(newComment);
};

module.exports = { getAll, getOne, getPagedFiltered, downloadNewVideo, getComments, addComment };
