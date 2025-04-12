import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.SECRET_KEY;

export const authenticateJWT = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1]; // Extract token from headers

    if (!token) {
        return res.status(401).json({ message: "Access denied. No token provided." });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.cafeId = decoded.cafeId; 
        next();
    } catch (error) {
        return res.status(400).json({ message: "Invalid token." });
    }
};