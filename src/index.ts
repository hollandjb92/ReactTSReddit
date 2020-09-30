import { MyContext } from './types';
import { UserResolver } from './resolvers/user';
import "reflect-metadata";
import { PostResolver } from './resolvers/post';
import { HelloResolver } from './resolvers/hello';
import { __prod__ } from './constants';
import { MikroORM } from '@mikro-orm/core';
import microConfig from "./mikro-orm.config";
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql'

import redis from 'redis';
import session from 'express-session';
import connectRedis from "connect-redis"
 


import express from "express";

const main = async () => {
	const orm = await MikroORM.init(microConfig);
	await orm.getMigrator().up();

	const app = express();

	const RedisStore = connectRedis(session)
	const redisClient = redis.createClient()
	
	app.use(
		session({
			name: "qid",
			store: new RedisStore({ client: redisClient, disableTouch: true}),
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
		context: ({req, res}): MyContext => ({em: orm.em.fork(), req, res})
	});

	apolloServer.applyMiddleware({app});

	app.listen(4000, ()=> {
		console.log("Server running on Port 4000");
	});
}

main().catch(err => {
	console.error(err);
});


