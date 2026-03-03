// src/api/index.js - API Router
const express = require('express');
const router = express.Router();

router.use('/cards', require('./cards'));
router.use('/decks', require('./decks'));
router.use('/game', require('./game'));

module.exports = router;
