import { SimpleGMConvertTask } from "../task-queue/task";
import { FileEntry } from "../file-store";

export class JpgConvertTask extends SimpleGMConvertTask {

	constructor(input: FileEntry) {
		super(input, '.jpg');
	}
}



