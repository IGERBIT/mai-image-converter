import { v4 } from "uuid"

export interface FileEntry {
	id: string,
	realFilename: string,
	filename: string,
	createdAt: Date
}

class Store {
	
	private _files: Map<string, FileEntry> = new Map();

	public register(filename: string, realFilename: string): FileEntry {
		let entry: FileEntry = {
			id: v4(),
			filename: filename,
			realFilename: realFilename,
			createdAt: new Date()
		}

		this._files.set(entry.id, entry);

		return entry;
	}


	public get(id: string) {
		return this._files.get(id);
	}
}


export const FileStore = new Store();