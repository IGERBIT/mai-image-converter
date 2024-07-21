import { getFilePath as getUserFilePath } from "../files";
import { v4 } from "uuid";
import { parse } from "path";
import { Readable } from "stream";
import _gm from "gm"
import { FileEntry, FileStore } from "../file-store";
const gm = _gm.subClass({ imageMagick: '7+' })


export type TaskState = { progress: number, status: TaskStatus, }
export type TaskStatus = 'created' | 'processing' | 'finished' | 'error'

export abstract class Task {

	public createdAt: Date;
	public updatedAt: Date;


	public abstract get caption(): string;
	
	constructor() {
		this.createdAt = new Date();
		this.updatedAt = new Date();
	}

	public abstract start(): void;
	public abstract getState(): TaskState;
	public abstract getResult(): FileEntry | null;

	public notifyUpdate() {
		this.updatedAt = new Date();
	}

	
}

export abstract class SimpleGMConvertTask extends Task {

	protected _inputFile: FileEntry;
	protected _outputEntry!: FileEntry;
	protected _progress: number = 0;

	protected _done: boolean = false;
	protected _started: boolean = false;
	protected _error: Error | undefined;
	protected _inputFileExt: string;

	private _ext: string;

	public get caption(): string {
		
		let capitalInExt = this._inputFileExt.replace('.', '').toUpperCase();
		let capitalOutExt = this._ext.replace('.', '').toUpperCase();
		return `${capitalInExt} -> ${capitalOutExt} conversion of ${this._inputFile.filename}`;
	}


	constructor(inFile: FileEntry, outFileExt: string) {
		super();

		this._inputFile = inFile;
		this._inputFileExt = parse(this._inputFile.realFilename).ext;
		this._ext = outFileExt;
		this.createOutputEntry();
	}

	public start(): void {
		try {
			this._started = true;
			gm(getUserFilePath(this._inputFile.realFilename)).write(getUserFilePath(this._outputEntry.realFilename), this.onResultHandler.bind(this));
		} catch (error) {
			if (error instanceof Error) this._error = error;
		}
	}

	public getState(): TaskState {
		if (this._error) return { progress: 0, status: 'error' };
		
		
		if (this._done) return { progress: 1, status: 'finished' };
		if (this._started) return { progress: this._progress, status: 'processing' };

		return { progress: 0, status: 'created' }
	}
	

	protected setProgress(value: number) {
		this._progress = value;
		this.notifyUpdate();
	}

	protected onResultHandler(err: Error | null, stdout: Readable, stderr: Readable, cmd: string) {
		console.log(this, arguments)
		if (err) {
			this._error = err;
			return;
		}

		this._done = true;
		this.notifyUpdate()
	}


	public getResult() {
		if (!this._done) return null;

		return this._outputEntry || null;
	}


	protected createOutputEntry() {
		var parts = parse(this._inputFile.filename);
		var rParts = parse(this._inputFile.realFilename);
		this._outputEntry = FileStore.register(`${parts.name}_converted${this._ext}`, `${rParts.name}_converted${this._ext}`)
	}

}