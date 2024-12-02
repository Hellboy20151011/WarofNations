const pool = require('../config/db');

// Gebäudekosten abrufen
exports.getBuildingCosts = async (req, res) => {
    try {
        console.log('Fetching building costs from database...');
        const buildingCosts = await pool.query(
            `SELECT id, name, cost FROM buildings`
        );

        if (buildingCosts.rows.length === 0) {
            console.error('No buildings found in the database.');
            return res.status(404).json({ error: 'No buildings found' });
        }

        const costs = buildingCosts.rows.map(building => ({
            id: building.id,
            name: building.name,
            cost: typeof building.cost === 'string' ? JSON.parse(building.cost) : building.cost,
        }));

        console.log('Processed building costs:', costs);
        res.status(200).json(costs);
    } catch (err) {
        console.error('Error fetching building costs:', err.message);
        res.status(500).json({ error: 'Failed to fetch building costs' });
    }
};

// Gebäude bauen
exports.buildBuilding = async (req, res) => {
    const { buildingId, amount } = req.body;
    const userId = req.user.id;

    try {
        console.log(`Building ${amount} units of building ID ${buildingId} for user ID ${userId}`);

        // Gebäudekosten abrufen
        const building = await pool.query(
            `SELECT cost FROM buildings WHERE id = $1`,
            [buildingId]
        );
        
        const cost = JSON.parse(building.rows[0]?.cost || '{}'); // Sichere Initialisierung
        
        console.log(`Cost for building:`, cost);

        // Ressourcen überprüfen und abziehen
        for (const [resourceName, costPerUnit] of Object.entries(cost)) {
            const totalCost = costPerUnit * amount;

            // Ressourcen des Benutzers abrufen
            const userResource = await pool.query(
                `SELECT ur.amount
                 FROM user_resources ur
                 JOIN resources r ON ur.resource_id = r.id
                 WHERE ur.user_id = $1 AND r.name = $2`,
                [userId, resourceName]
            );

            if (userResource.rows.length === 0 || userResource.rows[0].amount < totalCost) {
                return res.status(400).json({ error: `Not enough ${resourceName}` });
            }

            // Ressourcen abziehen
            await pool.query(
                `UPDATE user_resources
                 SET amount = amount - $1
                 WHERE user_id = $2 AND resource_id = (
                     SELECT id FROM resources WHERE name = $3
                 )`,
                [totalCost, userId, resourceName]
            );
            


            console.log(`Deducted ${totalCost} ${resourceName} for user ${userId}`);
        }

        // Gebäude hinzufügen oder Menge erhöhen
        await pool.query(
            `INSERT INTO user_buildings (user_id, building_id, quantity)
             VALUES ($1, $2, $3)
             ON CONFLICT (user_id, building_id)
             DO UPDATE SET quantity = user_buildings.quantity + $3`,
            [userId, buildingId, amount]
        );

        console.log(`Successfully built ${amount} of building ID ${buildingId} for user ID ${userId}`);
        res.status(200).json({ message: `Successfully built ${amount} building(s)` });
    } catch (error) {
        console.error('Error building:', error.message);
        res.status(500).json({ error: 'Failed to build building' });
    }
};


// Anzahl der Gebäude pro Benutzer abrufen
exports.getBuildingCounts = async (req, res) => {
    const userId = req.user.id;

    try {
        const buildingCounts = await pool.query(
            `SELECT b.name, ub.quantity
             FROM user_buildings ub
             JOIN buildings b ON ub.building_id = b.id
             WHERE ub.user_id = $1`,
            [userId]
        );

        res.status(200).json(buildingCounts.rows);
    } catch (err) {
        console.error('Error fetching building counts:', err.message);
        res.status(500).json({ error: 'Failed to fetch building counts' });
    }
};

// Produktionsraten basierend auf Gebäuden abrufen
exports.getProductionRates = async (req, res) => {
    const userId = req.user.id;

    try {
        const productionRates = await pool.query(
            `SELECT r.name AS resource_name, SUM(pr.rate * ub.quantity) AS total_production
             FROM user_buildings ub
             JOIN production_rates pr ON ub.building_id = pr.building_id
             JOIN resources r ON pr.resource_id = r.id
             WHERE ub.user_id = $1
             GROUP BY r.name`,
            [userId]
        );

        res.status(200).json(productionRates.rows);
    } catch (err) {
        console.error('Error fetching production rates:', err.message);
        res.status(500).json({ error: 'Failed to fetch production rates' });
    }
};

// Geldproduzierende Gebäude abrufen
exports.getMoneyProducingBuildings = async (req, res) => {
    try {
        const buildings = await pool.query(`
            SELECT 
                b.id, 
                b.name, 
                b.cost, 
                b.image, 
                b.description -- Beschreibung aus der Tabelle abrufen
            FROM buildings b
            JOIN production_rates pr ON b.id = pr.building_id
            JOIN resources r ON pr.resource_id = r.id
            WHERE r.name = 'Geld'
        `);

        const formattedBuildings = buildings.rows.map(building => ({
            id: building.id,
            name: building.name,
            cost: typeof building.cost === 'string' ? JSON.parse(building.cost) : building.cost,
            image: building.image,
            description: building.description // Beschreibung in die API-Antwort einfügen
        }));

        res.status(200).json(formattedBuildings);
    } catch (err) {
        console.error('Error fetching money-producing buildings:', err.message);
        res.status(500).json({ error: 'Failed to fetch buildings' });
    }
};


exports.getMaterialProducingBuildings = async (req, res) => {
    try {
        const buildings = await pool.query(
            `SELECT b.id, b.name, b.cost, b.image
             FROM buildings b
             JOIN production_rates pr ON b.id = pr.building_id
             JOIN resources r ON pr.resource_id = r.id
             WHERE r.name IN ('Metall', 'Stein', 'Strom', 'Treibstoff')` // Inklusive Strom für das Kraftwerk
        );

        res.status(200).json(buildings.rows);
    } catch (err) {
        console.error('Error fetching material-producing buildings:', err.message);
        res.status(500).json({ error: 'Failed to fetch buildings' });
    }
};


