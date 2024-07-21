import { SimpleGMConvertTask } from "../task-queue/task";
import { FileEntry } from "../file-store";

export class GifConvertTask extends SimpleGMConvertTask {
	constructor(input: FileEntry) {
		super(input, '.gif');
	}
}



