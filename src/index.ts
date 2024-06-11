import express from "express";
import bodyParser from "body-parser";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
const app = express();
const prisma = new PrismaClient();
// for users router --
app.use(bodyParser.json());
const router1 = express.Router();
// for todos router --
const router2 = express.Router();
app.use(router1);
app.use(router2);
const userRegistrattionSchema = z.object({
  username: z.string(),
  password: z.string(),
  firstName: z.string(),
  lastName: z.string(),
});
interface Users {
  username: string;
  password: string;
  firstName: string;
  lastName: string;
}
router1.post(
  "/users/register",
  async (req: express.Request, res: express.Response) => {
    try {
      if (!userRegistrattionSchema.parse(req.body)) {
        return res.status(411).json({
          message: "Email already taken / Incorrect inputs",
        });
      }
      // const user=req.body
      const registeredUser = await insertUser(req.body as Users);
      res.status(200).json(registeredUser);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
);
async function insertUser(users: Users) {
  const res = await prisma.user.create({
    data: {
      username: users.username,
      password: users.password,
      firstName: users.firstName,
      lastName: users.lastName,
    },
  });
  console.log(res);
  return res;
}
const userLoginSchema = z.object({
  username: z.string(),
  password: z.string(),
});
interface UserLogin {
  username: string;
  password: string;
}
async function loginUser(users: UserLogin) {
  const res = await prisma.user.findFirst({
    where: {
      username: users.username,
      password: users.password,
    },
  });
  return res;
}
// login--
router1.post(
  "/users/login",
  async (req: express.Request, res: express.Response) => {
    try {
      if (!userLoginSchema.parse(req.body)) {
        return res.status(411).json({
          message: "Incorrect inputs",
        });
      }
      const loggedInUser = await loginUser(req.body as UserLogin);
      res.status(200).json(loggedInUser);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
);
// update User---
const UserUpdateSchema = z.object({
  username: z.string(),
  password: z.string(),
  firstName: z.string(),
  lastName: z.string(),
});
type UpdateProps = Pick<
  Users,
  "username" | "password" | "firstName" | "lastName"
>;
type UpdatePropsOptional = Partial<UpdateProps>;

async function updateUser(updateProps: UpdatePropsOptional, userId: number) {
  const res = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      ...updateProps,
    },
  });
  return res;
}

router1.put(
  "/users/update:id",
  async (req: express.Request, res: express.Response) => {
    try {
      const userId = parseInt(req.params.id);
      if (!userId) {
        return res.status(411).json({ message: "Incorrect userId" });
      }
      const updateProps = await UserUpdateSchema.parse(req.body);
      const updatedUser = await updateUser(updateProps, userId);
      return res.status(200).json(updatedUser);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
);
// get users--
async function getUsers() {
  const res = await prisma.user.findMany();
  return res;
}
router1.get("/users", async (req: express.Request, res: express.Response) => {
  try {
    const users = await getUsers();
    res.status(200).json(users);
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
});
// todo app---
const todoSchema = z.object({
  title: z.string(),
  description: z.string(),
  user_id: z.number(),
});

interface Todo {
  title: string;
  description: string;
  user_id: number;
}
// create todo--
router2.post(
  "/todos/create",
  async (req: express.Request, res: express.Response) => {
    try {
      if (!todoSchema.parse(req.body)) {
        return res.status(411).json({ message: "Incorrect inputs" });
      }
      const todo = req.body as Todo;
      const createdTodo = await createTodo(todo);
      res.status(200).json(createdTodo);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }
);
// insertUser("admin1", "123456", "harkirat", "singh");
async function createTodo(todo: Todo) {
  const res = await prisma.todo.create({
    data: {
      title: todo.title,
      description: todo.description,
      user_id: todo.user_id,
    },
  });
  console.log(res);
}

// delete todo--
async function deleteTodoById(id: number) {
  const deletedTodo = await prisma.todo.delete({
    where: {
      id: id,
    },
  });
  return deletedTodo;
}
const deleteTodoSchema = z.object({
  id: z.number(),
});
router2.delete(
  "/todos/delete/:id",
  async (req: express.Request, res: express.Response) => {
    try {
      if (!deleteTodoSchema.parse(req.params)) {
        return res.status(411).json({ message: "Incorrect inputs" });
      }
      const todoId = parseInt(req.params.id);
      const deletedTodo = await deleteTodoById(todoId);
      res.status(200).json(deletedTodo);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
);
// update todo--
interface updateTodo {
  user_id: number;
  done: boolean;
}
const updateTodoSchema = z.object({
  user_id: z.number(),
});
router2.put(
  "/todos/update/:id",
  async (req: express.Request, res: express.Response) => {
    if (!updateTodoSchema.parse(req.params)) {
      return res.status(411).json({ message: "Incorrect inputs" });
    }
    const todoId = parseInt(req.params.id);
    const updateProps = req.body as updateTodo;
  }
);
// createTodo("title6", "description16", 2);
// async function getTodosAndUserDetails(user_id: number) {
//   const todos = await prisma.todo.findMany({
//     where: {
//       user_id: user_id,
//     },
//     select: {
//       user: true,
//       title: true,
//       description: true,
//     },
//   });
//   console.log(todos);
// }

// getTodosAndUserDetails(1);

app.listen(3000, () => console.log("Server is running"));
