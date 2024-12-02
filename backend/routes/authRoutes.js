const express = require('express');
const { register, login } = require('../controllers/authController'); // Korrekt importieren
const router = express.Router();

router.post('/register', register); // Route mit Controller verknüpfen
router.post('/login', login);       // Route mit Controller verknüpfen

module.exports = router;
