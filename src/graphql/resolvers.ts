import { UserInputError } from "apollo-server-core";

import path from "path";
import fs from "fs";
import { GraphQLUpload } from "graphql-upload";
import { Resolvers } from "../generated/graphql";
import { Icontext } from "../types/types";
// export interface Icontext extends Context {
//   res: OutgoingMessage;
//   req: IncomingMessage;
//   // createToken: (user: User) => string;
// }

export const resolvers: Resolvers<Icontext> = {
  Query: {
    hello: async (_, __, ___) => {
      return "hello worlde";
    },
  },
  Upload: GraphQLUpload,
  Mutation: {
    uploadFile: async (_, { file }) => {
      if (!file) {
        throw new UserInputError("No file Provided");
      }
      const { createReadStream, filename, mimetype, encoding } = await file;
      const whitelist = ["image/jpeg", "image/jpg", "image/png"];
      const found = whitelist.find((type) => type === mimetype);
      if (!found) {
        throw new UserInputError("Invalid File Type");
      }
      const stream = createReadStream();
      const pathName = path.join(
        process.cwd(),
        `dist/public/images/${filename}`
      );
      await stream.pipe(fs.createWriteStream(pathName));
      return {
        url: `http://localhost:4000/images/${filename}`,
      };
    },
  },
};
