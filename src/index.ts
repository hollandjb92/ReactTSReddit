import { ApolloServer } from 'apollo-server-express';
import connectRedis from "connect-redis";
import cors from 'cors';
import express from "express";
import session from 'express-session';
import Redis from 'ioredis';
import "reflect-metadata";
import { buildSchema } from 'type-graphql';
import { createConnection } from 'typeorm';
import { COOKIE_NAME, __prod__ } from './constants';
import { Post } from './entities/Post';
import { User } from './entities/User';
import { HelloResolver } from './resolvers/hello';
import { PostResolver } from './resolvers/post';
import { UserResolver } from './resolvers/user';

const main = async () => {
	const conn = await createConnection({
		type: "postgres",
		database: "redditclone2",
		username: "postgres",
		password: "password",
		logging: true,
		synchronize: true,
		entities: [Post, User]
	});


	const app = express();

	const RedisStore = connectRedis(session)
	const redis = new Redis();

	app.use(cors({
		origin: 'http://localhost:3000',
		credentials: true
	}))
	
	app.use(
		session({
			name: COOKIE_NAME,
			store: new RedisStore({ client: redis, disableTouch: true}),
			cookie: {
				maxAge: 1000 * 60 * 60 * 24 * 365 * 5,  // last for 5 years
				httpOnly: true,
				secure: __prod__, //cookie only works in https in prod
				sameSite: "lax"
			},
			saveUninitialized: false,
			secret: 'thisisourlittlesecret',
			resave: false,
		})
	)

	const apolloServer = new ApolloServer({
		schema: await buildSchema({
			resolvers:[HelloResolver, PostResolver, UserResolver],
			validate: false,
		}),
		context: ({req, res}) => ({req, res, redis})
	});

	apolloServer.applyMiddleware({app, cors: false });

	app.listen(4000, ()=> {
		console.log("Server running on Port 4000");
	});
}

main().catch(err => {
	console.error(err);
});


