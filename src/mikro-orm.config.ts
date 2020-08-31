require("dotenv").config();

import { Post } from "./entities/Post";
import { __prod__ } from "./constants";
import { MikroORM } from "@mikro-orm/core";
import path from 'path';

console.log("dirname: ", __dirname);
export default {
	migrations:{
		path: path.join(__dirname, './migrations'),
		pattern: /^[\w-]+\d+\.[tj]s$/,
	},
	entities: [Post],
	dbName: "redditclone",
	user: "postgres",
	password: process.env.PG_PASSWORD,
	debug: !__prod__,
	type: "postgresql"
} as Parameters<typeof MikroORM.init>[0];