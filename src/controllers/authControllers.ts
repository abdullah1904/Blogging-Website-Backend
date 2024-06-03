import { Request, Response } from "express";
import { genSalt, hash, compare } from "bcrypt";
import { createTransport } from "nodemailer";
import { generate } from "otp-generator";
import jwt, { sign } from "jsonwebtoken";
import { User } from "../models/userModel";
import { secretString1, secretString2 } from "../config";
import { Verification } from "../models/verificationModel";
import { decodedToken } from "../middleware/requireAuth";

const createAccessToken = (id: string) => {
    return sign({ id }, secretString1, { expiresIn: '10s' });
}

const createRefreshToken = (id: string) => {
    return sign({id}, secretString2, {expiresIn: '7d'});
}

const generateOTP = async () => {
    return await generate(6);
}

const generateTokenForVerification = (email: string) => {
    return sign({ email }, secretString1, { expiresIn: '3m' });
}

export const loginUser = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ "message": "Send all required fields: email, password" });
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ "message": "User not found" });
        }
        const match = await compare(password, user.password);
        if (!match) {
            return res.status(400).json({ "message": "Incorrect Password" });
        }
        const accessToken = createAccessToken(user._id.toString());
        const refreshToken = createRefreshToken(user._id.toString());
        res.status(200).json({ "message": "User Login Successfully", email, accessToken, refreshToken });
    }
    catch (error) {
        return res.status(500).json({ error });
    }
}

export const signupUser = async (req: Request, res: Response) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).send('Send All Required Fields');
        }
        const exists = await User.findOne({ username });
        if (exists) {
            return res.status(400).json({ "message": "Email already exists" });
        }
        const salt = await genSalt(10);
        const hashedPassword = await hash(password, salt);
        const user = await User.create({ username, email, password: hashedPassword });
        const accessToken = createAccessToken(user._id.toString());
        const refreshToken = createRefreshToken(user._id.toString());
        res.status(200).json({ "message": "User Signup Successfully", email, accessToken, refreshToken });
    }
    catch (err) {
        return res.status(500).json({ err });
    }
}

export const resetPassword = async (req: Request, res: Response) => {
    try {
        const { oldPassword, newPassword } = req.body;
        if (!oldPassword || !newPassword) {
            return res.status(400).send('Send All Required Fields');
        }
        const userId = req.token.id;
        const user = await User.findOne({ userId });
        if (user?.password != null) {
            const match = await compare(user?.password, oldPassword);
            if (!match) {
                return res.status(400).json({ "message": "Incorrect Password" });
            }
        }
        const salt = await genSalt(10);
        const newHashedPassword = await hash(newPassword, salt);
        const updatedUserData = await User.findByIdAndUpdate(userId, { ...user, password: newHashedPassword });
        const token = createAccessToken(updatedUserData?.id.toString());
        res.status(200).json({ "message": "Password Reset Successfully", email: updatedUserData?.email, token });
    }
    catch (err: any) {
        console.log(err.message);
        return res.status(500).json({ err });
    }
}

export const sendOTP = async (req: Request, res: Response) => {
    const Email = req.body.email;
    if (!Email) {
        return res.status(400).send('Send All Required Fields');
    }
    const record = await Verification.findOne({ email: Email });
    if (record) {
        return res.status(400).json({ "message":"OTP already sent"});
    }
    const verifyOTP = await generateOTP();
    const verifyToken = await generateTokenForVerification(Email);
    const transporter = createTransport({
        service: 'gmail',
        auth: {
            user: '2022cs525@student.uet.edu.pk',
            pass: 'btof ryus etxz ewzb'
        }
    });
    const mailOptions = {
        from: '2022cs525@student.uet.edu.pk',
        to: Email,
        subject: 'OTP for Forget Password',
        text: `OTP is: ${verifyOTP}`
    };
    const verificationRecord = await Verification.create({
        email: Email,
        OTP: verifyOTP,
        token: verifyToken
    });
    transporter.sendMail(mailOptions, async (error, info) => {
        if (error) {
            return res.status(500).json({ error });
        } else {
            try {
                res.status(200).json({ "message": `OTP is send to the ${req.body.email}` });
            }
            catch (error) {
                return res.status(500).json({ error });
            }
        }
    });
}

export const verifyOTP = async (req: Request, res: Response) => {
    try {
        const { email, OTP } = req.body;
        if (!email || !OTP) {
            return res.status(400).send('Send All Required Fields');
        }
        const verificationRecord = await Verification.findOne({ email });
        if (!verificationRecord) {
            res.status(400).json({ "message": 'No OTP sended on given email' });
        }
        if (OTP !== verificationRecord?.OTP) {
            return res.status(400).json({ 'message': 'Invalid OTP' });
        }
        const transporter = createTransport({
            service: 'gmail',
            auth: {
                user: '2022cs525@student.uet.edu.pk',
                pass: 'btof ryus etxz ewzb'
            }
        });
        const mailOptions = {
            from: '2022cs525@student.uet.edu.pk',
            to: email,
            subject: 'Verification Token for Forget Password',
            text: `Verification Token is: ${verificationRecord?.token}`
        };
        transporter.sendMail(mailOptions, async (error, info) => {
            if (error) {
                return res.status(500).json({ error });
            } else {
                res.status(200).json({ "message": `OTP Verified. Verification Token is send to the ${email}` });
            }
        });
    }
    catch (error) {
        return res.status(500).json({ error });
    }
}

export const forgetPassword = async (req: Request, res: Response) => {
    try {
        const { token, newPassword } = req.body;
        if (!token || !newPassword) {
            return res.status(400).send('Send All Required Fields');
        }
        const verificationRecord = await Verification.findOne({ token });
        if (token !== verificationRecord?.token) {
            return res.status(400).json({ "message": "Incorrect Token" });
        }
        const user = await User.findOne({email: verificationRecord?.email});
        const salt = await genSalt(10);
        const newHashedPassword = await hash(newPassword, salt);
        const newUserData = await User.findOneAndUpdate({email: user?.email},{password: newHashedPassword});
        await verificationRecord?.deleteOne();
        res.status(200).json({ "message": "Token Verified and Password Updated Successfully" });
    }
    catch (error) {
        return res.status(500).json({ error });
    }
}

export const refreshToken = (req:Request, res:Response)=>{
    const {token} = req.body;
    if(!token){
        return res.status(404).send('Send Refresh Token');
    }
    const decoded = jwt.verify(token,secretString2) as decodedToken;
    const newAccessToken = createAccessToken(decoded.id);
    res.status(200).json({"accessToken": newAccessToken});
}