import { Request, Response } from "express";
import { Post } from "../models/postModel"
import { User } from "../models/userModel";
import { io } from "..";

export const getAllPosts = async (req: Request, res: Response) => {
    try {
        const posts = await Post.find({}).populate('authorId');
        return res.status(200).json({
            count: posts.length,
            data: posts
        });
    }
    catch (error) {
        res.status(500).send({ error });
    }
}

export const getPost = async (req: Request, res: Response) => {
    try {
        const { id: postId } = req.params;
        const post = await Post.findById(postId).populate('authorId');
        if(!post){
            return res.status(404).send({"message": "Post not found"})
        }
        return res.status(200).json(post);
    }
    catch (error) {
        res.status(500).json({ error });
    }
}

export const createPost = async (req: Request, res: Response) => {
    try {
        const { postTitle, postDescription } = req.body;
        if (!postTitle || !postDescription) {
            return res.status(400).json({ "message": "Send all required fields: Title, Description" });
        }
        const newPost = { postTitle, postDescription, authorId: req.token.id };
        const post = await Post.create(newPost);
        const author = await User.findById(post.authorId);
        io.sockets.emit('New Post',`New Post by ${author?.username}`);
        return res.status(201).json({ newPost });
    }
    catch (error) {
        res.status(500).json({ error });
    }
}

export const updatePost = async (req: Request, res: Response) => {
    try {
        if (!req.body.postTitle || !req.body.postDescription) {
            return res.status(400).json({ "message": "Send all required fields: Title, Description" });
        }
        const { id: postId } = req.params;
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).send({ message: "Post not found" });
        }
        if(post?.authorId != undefined){    
            if (req.token.accessToken !== post?.authorId.toString()) {
                return res.status(400).json({ "message": "Invalid User" });
            }
        }
        const result = await Post.findByIdAndUpdate(postId, req.body);
        return res.status(200).send({ message: 'Post updated successfully' });
    }
    catch (error) {
        res.status(500).send({ error });
    }
}

export const deletePost = async (req: Request, res: Response) => {
    try {
        const { id: postId } = req.params;
        const post = await Post.findById(postId);
        if(post?.authorId != undefined){    
            if (req.token.accessToken !== post?.authorId.toString()) {
                return res.status(400).json({ "message": "Invalid User" });
            }
        }
        const result = await Post.findByIdAndDelete(postId);
        if (!result) {
            return res.status(404).send({ message: "Post not found" });
        }
        return res.status(200).send({ message: "Post deleted successfully" });
    }
    catch (error) {
        console.log(error);
        res.status(500).send({ error });
    }
}