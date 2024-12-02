const pool = require('../config/db');

exports.getDashboardData = async (req, res) => {
    const userId = req.user.id; // Benutzer-ID aus Middleware
    console.log('Fetching dashboard data for user ID:', userId);

    try {
        // Ressourcen abrufen
        const resources = await pool.query(
            `SELECT r.name, ur.amount
             FROM user_resources ur
             JOIN resources r ON ur.resource_id = r.id
             WHERE ur.user_id = $1`,
            [userId]
        );

        if (resources.rows.length === 0) {
            console.warn(`No resources found for user ID: ${userId}`);
        }
        console.log('Fetched resources:', resources.rows);

        // Gebäude abrufen
        const buildings = await pool.query(
            `SELECT b.name, ub.quantity
             FROM user_buildings ub
             JOIN buildings b ON ub.building_id = b.id
             WHERE ub.user_id = $1`,
            [userId]
        );

        if (buildings.rows.length === 0) {
            console.warn(`No buildings found for user ID: ${userId}`);
        }
        console.log('Fetched buildings:', buildings.rows);

        // Antwort senden
        res.status(200).json({
            resources: resources.rows.length > 0 ? resources.rows : [],
            buildings: buildings.rows.length > 0 ? buildings.rows : [],
        });
    } catch (err) {
        console.error('Error fetching dashboard data:', err.message);
        res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
};
