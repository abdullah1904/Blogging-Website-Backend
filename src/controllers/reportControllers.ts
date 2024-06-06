import { Request, Response } from "express";
import { Post } from "../models/postModel";
import { Report } from "../models/reportModel";

export const createReport = async (req: Request, res: Response) => {
    const { reportDescription } = req.body;
    const { postId } = req.params;
    if (!reportDescription) {
        return res.status(400).send('Send all required fields');
    }
    try {
        const report = await Report.create({ postId, reportDescription, authorId: req.token.id });
        const newPost = await Post.findByIdAndUpdate(
            postId,
            { $push: { reports: report._id } },
            { new: true }
        );
        res.status(200).json({ "message": "Report Added Successfully" });
    }
    catch (error) {
        return res.status(400).send(error);
    }
}

export const hidePost = async (req:Request, res: Response)=>{
    const { postId } = req.params;
    try{
        const newPost = await Post.findByIdAndUpdate(
            postId,
            { $push: { hideFrom: req.token.id } },
            { new: true }
        );
        res.status(200).json({ "message": "Hide Successfully"});
    }
    catch(err){
        return res.status(400).send(err);
    }
}