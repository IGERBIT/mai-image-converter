import { Router } from "express";
import { TaskStore } from "./task-queue/task-store";
import { PngConvertTask } from "./tasks/png-convert";
import { addTaskToUser } from "./tasks";
import { JpgConvertTask } from "./tasks/jpg-convert";

const router = Router();

router.post('/png', (req, res) => {
	console.log(req.body)
	const target_file_id = req.body['target_file'];
	if (!target_file_id) return res.status(400).send('The "target_file" filed is not specified');

	let files = req.session.files || [];
	const target_file = files.find(x => x.id == target_file_id);
	if (!target_file) return res.status(400).send('The "target_file" is not found');

	let taskId = TaskStore.add(new PngConvertTask(target_file));

	addTaskToUser(req, taskId);

	res.status(200).end()
})

router.post('/jpg', (req, res) => {
	const target_file_id = req.body['target_file'];
	if (!target_file_id) return res.status(400).json({ errorMessage: 'The "target_file" filed is not specified' });

	let files = req.session.files || [];
	const target_file = files.find(x => x.id == target_file_id);
	if (!target_file) return res.status(400).json({ errorMessage: 'The "target_file" is not found' });

	let taskId = TaskStore.add(new JpgConvertTask(target_file));

	addTaskToUser(req, taskId);

	res.status(200).end()
})

export { router as convertRouter }