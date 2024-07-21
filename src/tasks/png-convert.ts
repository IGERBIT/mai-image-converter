import { FileEntry } from "../file-store";
import { SimpleGMConvertTask } from "../task-queue/task";

export class PngConvertTask extends SimpleGMConvertTask {

	constructor(input: FileEntry) {
		super(input, '.png');
	}
}



