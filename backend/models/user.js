const pool = require('../config/db');

const User = {
    create: async (username, passwordHash) => {
        const result = await pool.query(
            `INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *`,
            [username, passwordHash]
        );
        return result.rows[0];
    },

    findByUsername: async (username) => {
        const result = await pool.query(
            `SELECT * FROM users WHERE username = $1`,
            [username]
        );
        return result.rows[0];
    }
};

module.exports = User;
