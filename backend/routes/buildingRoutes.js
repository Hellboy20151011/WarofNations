const express = require('express');
const { 
    getBuildingCosts,
    buildBuilding,
    getBuildingCounts,
    getProductionRates,
    getMoneyProducingBuildings,
    getMaterialProducingBuildings // Hier die neue Funktion hinzufügen
} = require('../controllers/buildingController');

const authenticate = require('../middleware/authenticate');

const router = express.Router();

// Routen definieren
router.get('/costs', authenticate, getBuildingCosts);
router.post('/build', authenticate, buildBuilding);
router.get('/counts', authenticate, getBuildingCounts);
router.get('/production-rates', authenticate, getProductionRates);
router.get('/money', authenticate, getMoneyProducingBuildings);
router.get('/material', authenticate, getMaterialProducingBuildings);

module.exports = router;
