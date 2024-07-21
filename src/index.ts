/// <reference path="types.d.ts" />
import express from "express";
import dotenv from "dotenv"
import session from "express-session";
import { api_router } from "./api";
import bodyParser from "body-parser";

dotenv.config();


const app = express();
const port = process.env.PORT || 8080;

app.use(express.static('public'))

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.use(session({
	secret: "mai-secret",
	cookie: { secure: false },
	resave: true,
	saveUninitialized: true,
}))

app.use("/api", api_router)

app.listen(port, () => {
	console.log(`[server]: Server is running at http://localhost:${port}`);
});


declare module "express-session" {
	interface SessionData {
		files: string[]
		tasks: string[],
		nextFileIndex: number
	}
}