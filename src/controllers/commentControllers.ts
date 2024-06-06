import { Request, Response } from "express";
import { Post } from "../models/postModel";
import { Comment } from "../models/commentModel";

export const getAllComments = async (req: Request, res: Response) => {
    try {
        const comments = await Comment.find({}).populate('authorId');
        return res.status(200).json({
            count: comments.length,
            data: comments
        });
    }
    catch (error) {
        res.status(500).send({ error });
    }
}

export const getComment = async (req: Request, res: Response) => {
    try {
        const { commentId } = req.params;
        console.log(commentId);
        const comment = await Comment.findById(commentId).populate('authorId').populate('postId');
        if (!comment) {
            return res.status(404).send({ "message": "Comment not found" })
        }
        return res.status(200).json(comment);
    }
    catch (error) {
        res.status(500).json({ error });
    }
}

export const createComment = async (req: Request, res: Response) => {
    const { commentDescription } = req.body;
    const { postId } = req.params;
    if (!commentDescription) {
        return res.status(400).send('Send all required fields');
    }
    try {
        const comment = await Comment.create({ postId, commentDescription, authorId: req.token.id });
        const newPost = await Post.findByIdAndUpdate(
            postId,
            { $push: { comments: comment._id } },
            { new: true }
        );
        res.status(200).json({ "message": "Comment Added Successfully", newPost });
    }
    catch (error) {
        return res.status(400).send(error);
    }
}

export const updateComment = async (req: Request, res: Response) => {
    const { commentDescription } = req.body;
    const { commentId } = req.params;
    if (!commentDescription) {
        return res.status(400).send('Send all required fields');
    }
    try {
        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).send({ message: "Comment not found" });
        }
        if (comment?.authorId != undefined) {
            if (req.token.id !== comment?.authorId.toString()) {
                return res.status(400).json({ "message": "Invalid User" });
            }
        }
        const result = await Comment.findOneAndUpdate(
            { _id: commentId },
            { $set: { commentDescription } },
            { new: true }
        );
        return res.status(200).send({ message: 'Comment updated successfully', result });
    }
    catch (error) {
        res.status(500).send({ error });
    }
}

export const deleteComment = async (req: Request, res: Response) => {
    try {
        const { commentId } = req.params;
        const post = await Post.findOne({ commentId });
        if (post?.authorId != undefined) {
            if (req.token.id !== post?.authorId.toString()) {
                return res.status(400).json({ "message": "Invalid User" });
            }
        }
        const deletionResult = await Comment.findByIdAndDelete(commentId);
        if (!deletionResult) {
            return res.status(404).send({ message: "Comment not found" });
        }
        const updatedPost = await Post.findByIdAndUpdate(deletionResult.postId, {
            $pull: { comments: commentId } // Remove commentId from the comments array
        });
        return res.status(200).send({ message: "Comment deleted successfully" });
    }
    catch (error) {
        console.log(error);
        res.status(500).send({ error });
    }
}