import { Router, Request, Response } from "express";
import { taskRouter } from "./tasks";
import { filesRouter } from "./files";
import { convertRouter as convertRouter } from "./converts";

const router = Router()

router.use('/tasks', taskRouter)
router.use('/files', filesRouter)
router.use(convertRouter)

export { router as api_router };