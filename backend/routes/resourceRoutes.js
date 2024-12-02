const express = require('express');
const {
    getProductionRates,
    getUserResources,
    updateResourceProduction,
} = require('../controllers/resourceController'); // Import prüfen

const authenticate = require('../middleware/authenticate'); // Middleware importieren

const router = express.Router();

// Benutzerressourcen abrufen
router.get('/', authenticate, getUserResources);

// Produktionsraten abrufen
router.get('/production-rates', authenticate, getProductionRates);

// Ressourcenproduktion manuell aktualisieren
router.post('/update-production', authenticate, updateResourceProduction);

module.exports = router;
