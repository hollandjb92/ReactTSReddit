import "reflect-metadata";
import { PostResolver } from './resolvers/post';
import { HelloResolver } from './resolvers/hello';
import { __prod__ } from './constants';
import { MikroORM } from '@mikro-orm/core';
import microConfig from "./mikro-orm.config";
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql'

import express from "express";

const main = async () => {
	const orm = await MikroORM.init(microConfig);
	await orm.getMigrator().up();

	const app = express();

	const apolloServer = new ApolloServer({
		schema: await buildSchema({
			resolvers:[HelloResolver, PostResolver],
			validate: false,
		}),
		context: () => ({em: orm.em})
	});

	apolloServer.applyMiddleware({app});

	app.listen(4000, ()=> {
		console.log("Server running on Port 4000");
	});
}

main().catch(err => {
	console.error(err);
});


