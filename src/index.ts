import express from "express";
import { Request, Response } from "express";
import cors from "cors";
import mongoose from "mongoose";
import {Server} from "socket.io";
import {createServer} from "http";
import { Port, mongoDBURL } from "./config";
import { authRouter } from "./routes/authRoutes";
import { postRouter } from "./routes/postRoutes";
import { commentRouter } from "./routes/commentRoutes";
import { likeRouter } from "./routes/likeRoutes";
import { reportRouter } from "./routes/reportRoutes";

const app = express();
const server = createServer(app);
export const io = new Server(server, {
    cors: {origin: 'http://localhost:3000'}
});

app.use(express.json());
app.use(cors())

app.get('/', (req: Request, res: Response) => {
    res.status(200).send('Hello Abdullah');
})

app.use('/auth', authRouter);
app.use('/post', postRouter);
app.use('/like',likeRouter);
app.use('/comment',commentRouter);
app.use('/report',reportRouter);


export const socket = io.on("connect", (socket) => {
    console.log('Hand Shake Done');
});

mongoose.connect(mongoDBURL)
    .then(() => {
        console.log('DB Connected');
        server.listen(Port, () => {
            console.log('App Running on Port:', Port);
        })
    })