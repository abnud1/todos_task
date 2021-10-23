import { ObjectId } from "bson";
import { Router } from "express";
import { getTodosCollection } from "./db";
export interface Todo {
  title: string;
  description: string;
  completion_date?: Date;
  create_date: Date;
  update_date?: Date;
  status: "completed" | "new";
  username: string;
}
const todosRouter = Router();
todosRouter.post("/", async (req, res) => {
  const todosCollection = await getTodosCollection();
  await todosCollection.insertOne({
    username: req.username!!,
    title: req.body.title,
    description: req.body.description,
    status: "new",
    create_date: new Date(),
  });
  res.status(204);
  res.end();
});
todosRouter.put("/:todoId", async (req, res) => {
  const todosCollection = await getTodosCollection();
  const $set: Partial<Todo> = {
    update_date: new Date(),
  };
  if (req.body.title) {
    $set.title = req.body.title;
  }
  if (req.body.status) {
    $set.status = req.body.status;
    if ($set.status === "completed") {
      $set.completion_date = new Date();
    }
  }
  if (req.body.description) {
    $set.description = req.body.description;
  }
  await todosCollection.updateOne(
    { _id: new ObjectId(req.params.todoId) },
    {
      $set,
    }
  );
  res.status(204);
  res.end();
});
todosRouter.delete("/:todoId", async (req, res) => {
  const todosCollection = await getTodosCollection();
  await todosCollection.deleteOne({ _id: new ObjectId(req.params.todoId) });
  res.status(204);
  res.end();
});
todosRouter.get("/:todoId?", async (req, res) => {
  const todosCollection = await getTodosCollection();
  if (req.params.todoId) {
    const todo = await todosCollection.findOne({
      _id: new ObjectId(req.params.todoId),
      username: req.username,
    });
    if (!todo) {
      res.status(404);
      res.end();
    } else res.json(todo);
  } else {
    const todos = await todosCollection
      .find({
        username: req.username,
      })
      .toArray();
    res.json(todos);
  }
});
export default todosRouter;
