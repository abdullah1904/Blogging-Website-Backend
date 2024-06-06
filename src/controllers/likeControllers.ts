import { Post } from "../models/postModel";
import { Request, Response } from "express";

export const createLike = async (req: Request, res: Response) => {
    const { postId } = req.params;
    try {
        const post = Post.find({likes: {$ne: req.token.id}});
        if(!!post){
            return res.status(400).send('Post already liked by you');
        }
        await Post.findByIdAndUpdate(
            postId,
            { $push: { likes: req.token.id } },
            { new: true }
        );
        res.status(200).json({ "message": "Post liked Successfully" });
    }
    catch (error) {
        return res.status(400).send(error);
    }
}

export const deleteLike = async (req: Request, res: Response) => {
    try {
        const { postId } = req.params;
        const post = await Post.findOne({ postId });
        if (post?.authorId != undefined) {
            if (post.likes.includes(Object(req.token.id))) {
                return res.status(400).json({ "message": "Invalid User" });
            }
        }
        const updated = await Post.findByIdAndUpdate(postId, {
            $pull: { likes: Object(req.token.id)} // Remove commentId from the comments array
        });
        return res.status(200).send({ message: "Liked deleted successfully", updated });
    }
    catch (error) {
        console.log(error);
        res.status(500).send({ error });
    }
}