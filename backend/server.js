const express = require('express');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const resourceController = require('./controllers/resourceController'); // Ressourcen-Controller
const cron = require('node-cron'); // Für geplante Aufgaben
const pool = require('./config/db');

require('dotenv').config();

const app = express();
app.use(express.json());

// Statische Dateien bereitstellen
app.use(express.static(path.join(__dirname, '../frontend')));

// Routen einbinden
app.use('/api/auth', authRoutes);
app.use('/api', dashboardRoutes);

// API-Endpunkt für manuelle Ressourcenproduktion
app.post('/api/produce-resources', async (req, res) => {
    try {
        console.log('Producing resources manually...');
        await resourceController.calculateResourceProduction();
        res.status(200).json({ message: 'Resource production completed successfully.' });
    } catch (error) {
        console.error('Error during manual resource production:', error.message);
        res.status(500).json({ error: 'Failed to produce resources.' });
    }
});

// Periodische Ressourcenproduktion (z. B. jede Stunde)
cron.schedule('*/1 * * * *', () => {
    console.log('Running scheduled resource production...');
    resourceController.calculateResourceProduction();
});

const PORT = process.env.PORT || 5000;

// Teste die Datenbankverbindung
pool.connect()
    .then(() => {
        console.log('Database connected successfully');
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch(err => console.error('Database connection error:', err.message));

// Fehlerbehandlungsmiddleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
});
