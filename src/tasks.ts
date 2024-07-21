import { Router, Request, Response } from "express";
import { TaskStore } from "./task-queue/task-store";
import { addFileToUser } from "./files";
import { Task } from "./task-queue/task";

const router = Router();


router.get('/status/{id}', (req: Request, res: Response) => {

	let task = TaskStore.get(req.params['id']);

	if (!task) {
		res.status(404);
		return;
	}

	return res.json(task.getState())
})

router.get('/status/:id/result', (req: Request, res: Response) => {

	let task = TaskStore.get(req.params['id']);

	if (!task) {
		res.status(404);
		return;
	}

	if (task.getState().status == 'finished') {
		addFileToUser(req, task.getResult()!);
	}

	return res.json()
})

router.get('/list', (req, res) => {
	let tasks = req.session.tasks || []
	console.log(tasks)
	res.json({ tasks })
})

export function addTaskToUser(req: Request, taskId: string) {
	let tasks = req.session.tasks || [];
	if(tasks.some(t => t == taskId)) return
	tasks.push(taskId);
	req.session.tasks = tasks;

	console.log(`task ${taskId} added to ${req.sessionID} session`)
	console.log(req.session.tasks)
}

export function getUserTasks(req: Request): Task[] {
	let taskIds = req.session.tasks || [];

	return taskIds.map(TaskStore.get).filter(x => x) as Task[];
}

export { router as taskRouter }