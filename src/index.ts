import { config } from "dotenv";
config();
import { initDatabase } from "./db";
import express from "express";
import cookieParser from "cookie-parser";
import userRouter from "./users";
import todosRouter from "./todos";
import jwtSigningKey from "./jwt";
import { jwtVerify } from "jose";
const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(async (req, res, next) => {
  if (req.path.includes("/login") || req.path.includes("signup")) {
    next();
  } else if (req.cookies?.["token"]) {
    const token: string = req.cookies["token"];
    const { payload } = await jwtVerify(token, jwtSigningKey);
    if (payload) {
      req.username = payload.username as string;
      next();
    } else {
      res.status(401);
      res.end();
    }
  } else {
    res.status(401);
    res.end();
  }
});
app.use("/user", userRouter);
app.use("/todos", todosRouter);
initDatabase().then(() => {
  app.listen(process.env.PORT);
  console.log(`Listening on port ${process.env.PORT}`);
});
