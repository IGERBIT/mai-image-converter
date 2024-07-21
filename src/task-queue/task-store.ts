import { Task } from "./task"
import { v4 } from "uuid";

class Store {
	private _tasks: Map<string, Task> = new Map();

	public add(task: Task): string {
		let id = v4();
		this._tasks.set(id, task)

		task.start()

		return id;
	}

	public get(id: string): Task | null {
		return this._tasks.get(id) ?? null;
	}

	public flush() {
		let itemsToDelete: string[] = [];


		for (let [key, value] of this._tasks) {

			var state = value.getState();
			if ((state.status == "finished" || state.status == "error") && (Date.now() - value.updatedAt.getTime()) > (30 * 60_000)) {
				itemsToDelete.push(key);
			}
		}

		for (let keyToDelete of itemsToDelete) {
			this._tasks.delete(keyToDelete);
		}

	}
}

export const TaskStore = new Store();