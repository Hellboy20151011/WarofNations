const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

exports.register = async (req, res) => {
    const { username, password } = req.body;

    const client = await pool.connect();

    try {
        console.log('Registering user:', username);

        // Beginne eine Transaktion
        await client.query('BEGIN');

        // Passwort hashen
        const hashedPassword = await bcrypt.hash(password, 10);

        // Benutzer erstellen
        const userResult = await client.query(
            `INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id`,
            [username, hashedPassword]
        );

        const userId = userResult.rows[0]?.id;

        if (!userId) {
            throw new Error('User creation failed, ID not returned');
        }

        console.log('User created with ID:', userId);

        // Ressourcen initialisieren
        console.log('Initializing resources for user...');
        const resources = await client.query(`SELECT id, name FROM resources`);
        const defaultAmount = 0; // Startressourcen auf 0 setzen

        for (const resource of resources.rows) {
            await client.query(
                `INSERT INTO user_resources (user_id, resource_id, amount)
                 VALUES ($1, $2, $3)`,
                [userId, resource.id, defaultAmount]
            );
        }
        console.log('Resources initialized for user:', username);

        // Startgebäude initialisieren
        console.log('Initializing start buildings...');
        const startBuildings = [
            { name: 'Kraftwerk', quantity: 1 },
            { name: 'Schmelzofen', quantity: 1 },
            { name: 'Steinbruch', quantity: 1 },
            { name: 'Kleine Bank', quantity: 1 },

        ];

        for (const building of startBuildings) {
            console.log(`Initializing building: ${building.name}`);

            const buildingData = await client.query(
                `SELECT id FROM buildings WHERE name = $1`,
                [building.name]
            );

            if (buildingData.rows.length === 0) {
                console.error(`Building "${building.name}" not found in the database.`);
                continue;
            }

            const buildingId = buildingData.rows[0].id;

            await client.query(
                `INSERT INTO user_buildings (user_id, building_id, quantity, is_initial_setup)
                 VALUES ($1, $2, $3, TRUE)
                 ON CONFLICT (user_id, building_id)
                 DO UPDATE SET quantity = user_buildings.quantity + $3`,
                [userId, buildingId, building.quantity]
            );
        }

        // Dynamische Berechnung von Strom basierend auf der Anzahl der Kraftwerke
        const powerPlant = startBuildings.find(building => building.name === 'Kraftwerk');
        const producedPower = powerPlant ? powerPlant.quantity * 100 : 0;

        await client.query(
            `UPDATE user_resources
             SET amount = $1
             WHERE user_id = $2 AND resource_id = (
                 SELECT id FROM resources WHERE name = 'Strom'
             )`,
            [producedPower, userId]
        );

        console.log(`User ID ${userId} initialized with ${producedPower} Strom.`);

        // Token generieren
        const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Transaktion abschließen
        await client.query('COMMIT');

        res.status(201).json({
            message: 'User registered successfully!',
            token,
            resources: resources.rows.map(resource => ({
                name: resource.name,
                amount: resource.name === 'Strom' ? producedPower : defaultAmount,
            })),
            buildings: startBuildings,
        });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error during registration:', err.message);
        res.status(400).json({ error: 'User registration failed' });
    } finally {
        client.release();
    }
};



// Login-Controller bleibt unverändert
exports.login = async (req, res) => {
    const { username, password } = req.body;

    try {
        // Benutzer abrufen
        const userResult = await pool.query(
            `SELECT id, password FROM users WHERE username = $1`,
            [username]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = userResult.rows[0];

        // Passwort prüfen
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Token generieren
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Ressourcen und Gebäude abrufen
        const resources = await pool.query(
            `SELECT r.name, ur.amount
             FROM user_resources ur
             JOIN resources r ON ur.resource_id = r.id
             WHERE ur.user_id = $1`,
            [user.id]
        );

        const buildings = await pool.query(
            `SELECT b.name, ub.quantity
             FROM user_buildings ub
             JOIN buildings b ON ub.building_id = b.id
             WHERE ub.user_id = $1`,
            [user.id]
        );

        res.status(200).json({
            token,
            resources: resources.rows, // Ressourcenliste
            buildings: buildings.rows  // Gebäudeliste
        });
    } catch (err) {
        console.error('Error during login:', err.message);
        res.status(500).json({ error: 'Login failed' });
    }
};
