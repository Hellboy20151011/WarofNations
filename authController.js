const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

exports.register = async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const newUser = await pool.query(
            'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *',
            [username, hashedPassword]
        );

         // Initialisiere Ressourcen für den neuen Benutzer
         await pool.query(
            'INSERT INTO resources (user_id, money, stone, metal, power, fuel, money_production, stone_production, metal_production, power_production, fuel_production) VALUES ($1, 0, 0, 0, 0, 0, 10, 5, 5, 2, 3)',
            [newUser.rows[0].id]
        );
        
        res.status(201).json({ message: 'User registered!' });
    } catch (err) {
        res.status(400).json({ error: 'User registration failed' });
    }
};

exports.login = async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await pool.query(
            'SELECT * FROM users WHERE username = $1',
            [username]
        );

        if (user.rows.length === 0) return res.status(400).json({ error: 'User not found' });

        const validPassword = await bcrypt.compare(password, user.rows[0].password);

        if (!validPassword) return res.status(400).json({ error: 'Invalid credentials' });

        const token = jwt.sign({ id: user.rows[0].id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (err) {
        res.status(500).json({ error: 'Login failed' });
    }
};
