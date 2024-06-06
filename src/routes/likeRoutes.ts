import { Router } from "express";
import {requireAuth} from "../middleware/requireAuth";
import { createLike, deleteLike } from "../controllers/likeControllers";

const likeRouter = Router();
likeRouter.use(requireAuth);
likeRouter.post('/:postId',createLike);
likeRouter.delete('/:likeId', deleteLike);

export {likeRouter}
