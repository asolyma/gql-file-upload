import { makeExecutableSchema } from "@graphql-tools/schema";
import {
  ApolloServerPluginDrainHttpServer,
  ApolloServerPluginLandingPageGraphQLPlayground,
} from "apollo-server-core";
import { ApolloServer } from "apollo-server-express";
import cookieParser from "cookie-parser";
import express from "express";
import http from "http";
import { resolvers } from "./graphql/resolvers.js";
import { typeDefs } from "./graphql/typeDefs.js";
import { createToken, getUserFromToken } from "./lib/auth";
import {
  graphqlUploadExpress, // A Koa implementation is also exported.
} from "graphql-upload";
import path from "path";

async function startApolloServer(t: any, r: any) {
  const app = express();
  app.use(express.static(path.join(__dirname, "public")));
  app.use(graphqlUploadExpress());
  app.use(cookieParser());

  const httpServer = http.createServer(app);
  const schema = makeExecutableSchema({
    typeDefs: [typeDefs],
    resolvers,
  });

  const server = new ApolloServer({
    schema: schema,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      ApolloServerPluginLandingPageGraphQLPlayground(),
    ],
    context({ req, res }) {
      let user;
      const token = req.cookies?.T_ACCESS_TOKEN || req.headers?.authorization;

      if (token) {
        user = getUserFromToken(token);
      }
      return { req, res, createToken, user };
    },
  });

  await server.start();
  server.applyMiddleware({
    app,
    cors: { origin: "http://localhost:3000", credentials: true },
  });
  await new Promise<void>((resolve) =>
    httpServer.listen({ port: 4000 }, resolve)
  );
  console.log(`Server ready at http://localhost:4000${server.graphqlPath}`);
}

startApolloServer(typeDefs, resolvers).then(() => {
  console.log(" 🚀🚀🚀 Cheers🍺");
});
