import express from "express";
import { Request, Response } from "express";
import mongoose from "mongoose";
import {Server} from "socket.io";
import {createServer} from "http";
import { Port, mongoDBURL } from "./config";
import { authRouter } from "./routes/authRoutes";
import { postRouter } from "./routes/postRoutes";

const app = express();
const server = createServer(app);
export const io = new Server(server);

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
    res.status(200).send('Hello Abdullah');
})

app.use('/auth', authRouter);
app.use('/post', postRouter);

io.on("connect", (socket) => {
    console.log('Hand Shake Done');
});

mongoose.connect(mongoDBURL)
    .then(() => {
        console.log('DB Connected');
        server.listen(Port, () => {
            console.log('App Running on Port:', Port);
        })
    })