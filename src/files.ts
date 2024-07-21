import { Router, Request, Response } from "express";
import fs from "fs";
import multer, {  } from "multer";
import path, { parse } from "path";
import { v4 } from "uuid";

const USER_FILES_STORAGE = '/user-files';

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

export type FileEntry = { realFilename: string, filename: string, id: string }


export function addFileToUser(req: Request, entry: FileEntry) {
	if (!entry) return
	let files = req.session.files || [];
	if (files.some(x => x.id == entry.id)) return;
	files.push(entry);
	req.session.files = files;	
}


router.post('/upload', upload.any(), (req: Request, res: Response) => {			
	var files = req.files as Express.Multer.File[];

	console.log(req);

	for (let file of files) {
		addFileToUser(req, { id: v4(), filename: file.originalname, realFilename: file.filename })
	}

	res.status(200).end();
	
})

router.get('/list', (req, res) => {
	let files = req.session.files || []
	console.group(req.session)
	res.json({ files }).status(200)
})

router.get('/:id', (req: Request, res) => {
	let id: any = req.params['id'];

	let entry = req.session.files?.find(x => x.id == id);
	if (!entry) return res.status(404).send('No such file');

	

	return res.download(path.join(USER_FILES_STORAGE, entry.realFilename), entry.filename);


})

export { router as filesRouter } 