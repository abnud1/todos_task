import { Document } from "bson";
import { Router } from "express";
import { getUsersCollection } from "./db";
import * as argon2 from "argon2";
import { SignJWT } from "jose";
import jwtSigningKey from "./jwt";

export interface User extends Document {
  username: string;
  password: string;
}
const userRouter = Router();
userRouter.post("/signup", async (req, res) => {
  const { username, password } = req.body;
  const usersCollection = await getUsersCollection();
  await usersCollection.insertOne({
    username,
    password: (await argon2.hash(password)).toString(),
  });
  res.status(204);
  res.end();
});
userRouter.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const usersCollection = await getUsersCollection();
  const userPassword = (
    await usersCollection.findOne(
      { username },
      {
        projection: {
          _id: 0,
          password: 1,
        },
      }
    )
  )?.password;
  if (userPassword && argon2.verify(userPassword, password)) {
    const jwt = await new SignJWT({ username })
      .setProtectedHeader({
        alg: "HS256",
      })
      .setIssuedAt()
      .sign(jwtSigningKey);
    res.cookie("token", jwt, { httpOnly: true, sameSite: "strict" });
    res.end();
  } else {
    res.status(401);
    res.end();
  }
});
export default userRouter;
