import { Router, Request, Response } from "express";
import fs from "fs";
import multer, {  } from "multer";
import path, { parse } from "path";
import { v4 } from "uuid";
import { FileEntry, FileStore } from "./file-store";

export const USER_FILES_STORAGE = '/user-files';

export function getFilePath(filename: string) {
	return path.join(USER_FILES_STORAGE, filename);
}

const router = Router();
if (!fs.existsSync(USER_FILES_STORAGE)) {
	fs.mkdirSync(USER_FILES_STORAGE);
}
for (let fileToDelete of (fs.readdirSync(USER_FILES_STORAGE, {}) as string[])) fs.unlinkSync(path.join(USER_FILES_STORAGE, fileToDelete));

const upload = multer({ 
	storage: multer.diskStorage({
		destination(req, file, callback) {
			callback(null, USER_FILES_STORAGE);
		},
		filename(req, file, callback) {
			try {
				let fileIndex = (req.session.nextFileIndex || 1);


				const prefix = `${Date.now()}-${Math.round(Math.random() * 1E9)}-`;
				let parts = parse(file.originalname);
				const file_name = `${parts.name}_${req.session.id}_${fileIndex}${parts.ext}`;
				callback(null, file_name);
				req.session.nextFileIndex = fileIndex + 1;
			} catch (error) {
				callback(error as Error, '');
			}
		},
	})
})




export function addFileToUser(req: Request, id: string) {
	if (!id) return
	let files = req.session.files || [];
	if (files.some(x => x == id)) return;
	files.push(id);
	req.session.files = files;	
}


export function getUserFilesEntries(req: Request): FileEntry[] {
	return (req.session.files || []).map(x => FileStore.get(x)).filter(x => x) as FileEntry[];
}

router.post('/upload', upload.any(), (req: Request, res: Response) => {			
	var files = req.files as Express.Multer.File[];

	for (let file of files) {
		var entry = FileStore.register(file.originalname, file.filename);
		addFileToUser(req, entry.id);
	}

	res.status(200).end();
})

router.get('/list', (req, res) => {
	
	let files = getUserFilesEntries(req);


	res.json({ files }).status(200)
})

router.get('/:id', (req: Request, res) => {
	let id: any = req.params['id'];

	let entry = FileStore.get(id);
	if (!entry) return res.status(404).send('No such file');

	return res.download(getFilePath(entry.realFilename), entry.filename);
})

export { router as filesRouter } 