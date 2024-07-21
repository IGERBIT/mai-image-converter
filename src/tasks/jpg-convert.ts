import { readFileSync } from "fs";
import { SimpleGMConvertTask, Task, TaskState } from "../task-queue/task";
import gm from "gm";
import { Readable } from "stream";
import { FileEntry } from "../files";

export class JpgConvertTask extends SimpleGMConvertTask {

	constructor(input: FileEntry) {
		super(input, '.jpg');
	}
}



