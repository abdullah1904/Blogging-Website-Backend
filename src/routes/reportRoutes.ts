import { Router } from "express";
import {requireAuth} from "../middleware/requireAuth";
import { createReport, hidePost } from "../controllers/reportControllers";


const reportRouter = Router();
reportRouter.use(requireAuth);
reportRouter.post('/:postId',createReport);
reportRouter.post('/hide/:postId',hidePost);


export {reportRouter}
