import jwt from 'jsonwebtoken';

const authenticateUser = (req, res, next) => {
    let token = req.headers['authorization'];

    if (!token) {
        return res.status(401).json({ errors: 'Token not provided' });
    }

    token = token.split(' ')[1];  // Remove "Bearer" part

    try {
        const tokenData = jwt.verify(token, process.env.JWT_SECRET);  // Verify and decode the token
        req.currentUser = { userId: tokenData.userId, role: tokenData.role };  // Set user info in request
        next();  // Continue to the next middleware or route handler
    } catch (error) {
        return res.status(401).json({ error: error.message });
    }
};


export default authenticateUser;