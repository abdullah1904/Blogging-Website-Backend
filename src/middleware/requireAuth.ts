import { Request, Response, NextFunction } from "express";
import { JwtPayload, TokenExpiredError, verify } from "jsonwebtoken";
import { secretString1 } from "../config";

export interface decodedToken extends JwtPayload {
    id: string
}

declare global {
    namespace Express {
        interface Request {
            token: decodedToken;
        }
    }
}

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
    const { authorization } = req.headers;
    if (!authorization) {
        return res.status(401).json({ "error": "Authorization token required" });
    }
    const token = authorization.replace('Bearer ', "");
    try {
        verify(token, secretString1, (err, decoded) => {
            if (err) {
                if (err instanceof TokenExpiredError) {
                    res.status(400).send('Token Expired');
                }
            } else {
                req.token = decoded as decodedToken;
                next();
            }
        });
    } catch (error) {
        console.log(error);
        res.status(401).json({ "error": 'Request isn\'t authorized' });
    }
};