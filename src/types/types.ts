import { Context } from "apollo-server-core";
import { IncomingMessage, OutgoingMessage } from "http";
enum Role {
  admin = "ADMIN",
  user = "USER",
}
type User = {
  id: string;
  email: string;
  role: Role;
};
export interface Icontext extends Context {
  user: User;
  res: OutgoingMessage;
  req: IncomingMessage;
}
