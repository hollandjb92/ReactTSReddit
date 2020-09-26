require("dotenv").config();
import { User } from './entities/User';
import { Post } from "./entities/Post";
import { __prod__ } from "./constants";
import { MikroORM } from "@mikro-orm/core";
import path from 'path';

export default {
	migrations:{
		path: path.join(__dirname, './migrations'),
		pattern: /^[\w-]+\d+\.[tj]s$/,
	},
	entities: [Post, User],
	dbName: process.env.PG_DATABASE,
	user: process.env.PG_USER,
	password: process.env.PG_PASSWORD,
	debug: !__prod__,
	type: "postgresql"
} as Parameters<typeof MikroORM.init>[0];