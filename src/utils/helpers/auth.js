import jwt from 'jsonwebtoken';

import configs from '../configs/index.js';

const SECRET_KEY = configs.secretKey;

function generateTokens(payload) {

    const accessPayload = {
        ...payload,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 5, // 5 days
        iat: Math.floor(Date.now() / 1000),
    };

    const accessToken = jwt.sign(accessPayload, SECRET_KEY, { algorithm: 'HS256' });

    const refreshPayload = {
        id: payload.id,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30, // 30 days
        iat: Math.floor(Date.now() / 1000),
    };

    const refreshToken = jwt.sign(refreshPayload, SECRET_KEY, { algorithm: 'HS256' });

    return { accessToken, refreshToken };
}

function verifyToken(token) {
    try {
        const payload = jwt.verify(token, SECRET_KEY);
        return payload;
    } catch (error) {
        return null;
    }
}

export { generateTokens, verifyToken };
