import { Router } from "express";
import {requireAuth} from "../middleware/requireAuth";
import {createComment, deleteComment, getAllComments, getComment, updateComment} from "../controllers/commentControllers";

const commentRouter = Router();

commentRouter.use(requireAuth);
commentRouter.get('/',getAllComments);
commentRouter.get('/:commentId',getComment);
commentRouter.post('/:postId',createComment);
commentRouter.put('/:commentId', updateComment);
commentRouter.delete('/:commentId', deleteComment);

export {commentRouter};