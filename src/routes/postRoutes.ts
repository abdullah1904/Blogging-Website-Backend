import express from "express";
import { requireAuth } from "../middleware/requireAuth";
import { createPost, deletePost, getAllPosts, getPost, updatePost } from "../controllers/postControllers";

const postRouter = express.Router();

postRouter.use(requireAuth);
postRouter.get('/',getAllPosts);
postRouter.get('/:id',getPost);
postRouter.post('/',createPost);
postRouter.put('/:id',updatePost);
postRouter.delete('/:id',deletePost);

export {postRouter};