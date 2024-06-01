import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { secretString } from "../config";
import { User } from "../models/userModel";

export interface decodedToken extends JwtPayload{
    id: string;
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
        jwt.verify(token, secretString,(err,decoded)=>{
            req.token = decoded as decodedToken;
        });
        next();
    } catch (error) {
        console.log(error);
        res.status(401).json({ "error": 'Request isn\'t authorized' });
    }
};