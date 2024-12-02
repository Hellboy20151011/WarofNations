const pool = require('../config/db');

// Ressourcenproduktion berechnen
exports.calculateResourceProduction = async () => {
    try {
        console.log('Starting resource production calculation...');
        
        // Alle Benutzer abrufen
        const users = await pool.query(`SELECT id FROM users`);
        if (users.rows.length === 0) {
            console.log('No users found for resource production.');
            return;
        }

        // Produktion für jeden Benutzer berechnen
        for (const user of users.rows) {
            const userId = user.id;

            console.log(`Processing production for user ID: ${userId}`);

            // Produktionsraten für Ressourcen abrufen
            const productionRates = await pool.query(
                `SELECT r.name AS resource_name, SUM(pr.rate * ub.quantity)::FLOAT AS total_production
                 FROM user_buildings ub
                 JOIN production_rates pr ON ub.building_id = pr.building_id
                 JOIN resources r ON pr.resource_id = r.id
                 WHERE ub.user_id = $1
                 GROUP BY r.name`,
                [userId]
            );

            // Anzahl der Kraftwerke abrufen
            const powerPlants = await pool.query(
                `SELECT SUM(quantity) AS power_plant_count
                 FROM user_buildings
                 WHERE user_id = $1 AND building_id = (
                     SELECT id FROM buildings WHERE name = 'Kraftwerk'
                 )`,
                [userId]
            );
            const powerPlantCount = powerPlants.rows[0]?.power_plant_count || 0;

            // Stromproduktion berechnen
            const producedPower = powerPlantCount * 100;

            // Produktionsraten für Ressourcen verarbeiten
            for (const rate of productionRates.rows) {
                const { resource_name, total_production } = rate;

                if (total_production <= 0) {
                    console.log(`Skipping ${resource_name} for user ${userId}: No production.`);
                    continue;
                }

                console.log(
                    `User ID ${userId}: Producing ${total_production} ${resource_name}`
                );

                // Ressourcen in der Datenbank aktualisieren
                await pool.query(
                    `UPDATE user_resources
                     SET amount = amount + $1
                     WHERE user_id = $2 AND resource_id = (
                         SELECT id FROM resources WHERE name = $3
                     )`,
                    [total_production, userId, resource_name]
                );
            }

            // Stromressource in der Datenbank aktualisieren
            console.log(`User ID ${userId}: Producing ${producedPower} Strom`);
            await pool.query(
                `UPDATE user_resources
                 SET amount = $1
                 WHERE user_id = $2 AND resource_id = (
                     SELECT id FROM resources WHERE name = 'Strom'
                 )`,
                [producedPower, userId]
            );
        }

        console.log('Resource production calculation completed.');
    } catch (err) {
        console.error('Error during resource production calculation:', err.message);
    }
};
