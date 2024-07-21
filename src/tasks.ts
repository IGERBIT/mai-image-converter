import { Router, Request, Response } from "express";
import { TaskStore } from "./task-queue/task-store";
import { addFileToUser } from "./files";
import { Task, TaskStatus } from "./task-queue/task";

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

interface TaskDTO {
	caption: string,
	progress: number,
	status: string,
	error?: string,
	resultFileId?: string
	
}

function localizeStatus(status: TaskStatus): string {
	switch (status) {
		case "created": return 'Создан';
		case "processing": return 'В обработке';
		case "finished": return 'Завершён';
		case "error": return 'Ошибка';
	}
	return 'Ошибка'
}

router.get('/list', (req, res) => {
	let tasks = getUserTasks(req)

	let DTOs: TaskDTO[] = tasks.map(x => {

		let state = x.getState();
		let dto: TaskDTO = { caption: x.caption, progress: state.progress, status: localizeStatus(state.status) }
		if (state.status == 'finished') dto.resultFileId = x.getResult()?.id;

		return dto;

	});

	res.json({ tasks: DTOs })
})

export function addTaskToUser(req: Request, taskId: string) {
	let tasks = req.session.tasks || [];
	if(tasks.some(t => t == taskId)) return
	tasks.push(taskId);
	req.session.tasks = tasks;
}

export function getUserTasks(req: Request): Task[] {
	let taskIds = req.session.tasks || [];

	return taskIds.map(x => TaskStore.get(x)).filter(x => x) as Task[];
}

export { router as taskRouter }