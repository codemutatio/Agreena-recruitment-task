import { Router } from "express";
import auth from "./auth.routes";
import farm from "./farm.routes";
import user from "./user.routes";

const routes = Router();

routes.use("/auth", auth);
routes.use("/farms", farm);
routes.use("/users", user);

export default routes;
