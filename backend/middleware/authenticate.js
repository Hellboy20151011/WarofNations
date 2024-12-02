const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Benutzer-ID aus dem Token
        next();
    } catch (err) {
        console.error('Token verification failed:', err.message);
        return res.status(403).json({ error: 'Invalid token' });
    }
};
