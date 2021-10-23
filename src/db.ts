import { Collection, MongoClient } from "mongodb";
import { Todo } from "./todos";
import { User } from "./users";

let dbClient: MongoClient;

export async function initDatabase() {
  dbClient = new MongoClient(process.env.MONGODB_URI!!);
  await dbClient.connect();
  try {
    const userCollection = await dbClient
      .db(process.env.MONGODB_DATABASE)
      .createCollection<User>("users", {
        validator: {
          $jsonSchema: {
            bsonType: "object",
            additionalProperties: false,
            required: ["_id", "username", "password"],
            properties: {
              _id: { bsonType: "objectId" },
              username: {
                bsonType: "string",
                minLength: 1,
                maxLength: 20,
              },
              password: {
                bsonType: "string",
                minLength: 1,
              },
            },
          },
        },
      });
    userCollection.createIndex({ username: 1 }, { unique: true });
  } catch (e) {}
  try {
    const todosCollection = await dbClient
      .db(process.env.MONGODB_DATABASE)
      .createCollection<Todo>("todos", {
        validator: {
          $jsonSchema: {
            bsonType: "object",
            additionalProperties: false,
            required: [
              "_id",
              "title",
              "status",
              "description",
              "username",
              "create_date",
            ],
            properties: {
              _id: { bsonType: "objectId" },
              title: {
                bsonType: "string",
                minLength: 1,
                maxLength: 20,
              },
              status: {
                bsonType: "string",
                enum: ["completed", "new"],
              },
              description: {
                bsonType: "string",
                minLength: 1,
              },
              completion_date: {
                bsonType: "date",
              },
              username: {
                bsonType: "string",
                minLength: 1,
                maxLength: 20,
              },
              create_date: {
                bsonType: "date",
              },
              update_date: {
                bsonType: "date",
              },
            },
          },
        },
      });
    todosCollection.createIndex({ title: 1 }, { unique: true });
  } catch (e) {}
}
export async function getUsersCollection(): Promise<Collection<User>> {
  await dbClient.connect();
  return await dbClient.db(process.env.MONGODB_DATABASE).collection("users");
}
export async function getTodosCollection(): Promise<Collection<Todo>> {
  await dbClient.connect();
  return await dbClient.db(process.env.MONGODB_DATABASE).collection("todos");
}
