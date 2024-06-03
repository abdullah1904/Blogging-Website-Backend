import { Router } from "express";
import {signupUser, loginUser, resetPassword, sendOTP, verifyOTP, forgetPassword, refreshToken} from "../controllers/authControllers";
import {requireAuth} from "../middleware/requireAuth";

const authRouter = Router();

authRouter.post('/login',loginUser);
authRouter.post('/signup',signupUser);
authRouter.post('/forget/sendOTP',sendOTP);
authRouter.post('/forget/verifyOTP',verifyOTP);
authRouter.post('/forget',forgetPassword);
authRouter.post('/reset',requireAuth,resetPassword);
authRouter.post('/refresh',refreshToken);



export {authRouter};