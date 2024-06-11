"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const app = (0, express_1.default)();
const prisma = new client_1.PrismaClient();
// for users router --
app.use(body_parser_1.default.json());
const router1 = express_1.default.Router();
// for todos router --
const router2 = express_1.default.Router();
app.use(router1);
app.use(router2);
const userRegistrattionSchema = zod_1.z.object({
    username: zod_1.z.string(),
    password: zod_1.z.string(),
    firstName: zod_1.z.string(),
    lastName: zod_1.z.string(),
});
router1.post("/users/register", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!userRegistrattionSchema.parse(req.body)) {
            return res.status(411).json({
                message: "Email already taken / Incorrect inputs",
            });
        }
        // const user=req.body
        const registeredUser = yield insertUser(req.body);
        res.status(200).json(registeredUser);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
}));
function insertUser(users) {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield prisma.user.create({
            data: {
                username: users.username,
                password: users.password,
                firstName: users.firstName,
                lastName: users.lastName,
            },
        });
        console.log(res);
        return res;
    });
}
const userLoginSchema = zod_1.z.object({
    username: zod_1.z.string(),
    password: zod_1.z.string(),
});
function loginUser(users) {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield prisma.user.findFirst({
            where: {
                username: users.username,
                password: users.password,
            },
        });
        return res;
    });
}
// login--
router1.post("/users/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!userLoginSchema.parse(req.body)) {
            return res.status(411).json({
                message: "Incorrect inputs",
            });
        }
        const loggedInUser = yield loginUser(req.body);
        res.status(200).json(loggedInUser);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
}));
// update User---
const UserUpdateSchema = zod_1.z.object({
    username: zod_1.z.string(),
    password: zod_1.z.string(),
    firstName: zod_1.z.string(),
    lastName: zod_1.z.string(),
});
function updateUser(updateProps, userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield prisma.user.update({
            where: {
                id: userId,
            },
            data: Object.assign({}, updateProps),
        });
        return res;
    });
}
router1.put("/users/update:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = parseInt(req.params.id);
        if (!userId) {
            return res.status(411).json({ message: "Incorrect userId" });
        }
        const updateProps = yield UserUpdateSchema.parse(req.body);
        const updatedUser = yield updateUser(updateProps, userId);
        return res.status(200).json(updatedUser);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
}));
// get users--
function getUsers() {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield prisma.user.findMany();
        return res;
    });
}
router1.get("/users", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield getUsers();
        res.status(200).json(users);
    }
    catch (e) {
        res.status(400).json({ message: e.message });
    }
}));
// todo app---
const todoSchema = zod_1.z.object({
    title: zod_1.z.string(),
    description: zod_1.z.string(),
    user_id: zod_1.z.number(),
});
// create todo--
router2.post("/todos/create", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!todoSchema.parse(req.body)) {
            return res.status(411).json({ message: "Incorrect inputs" });
        }
        const todo = req.body;
        const createdTodo = yield createTodo(todo);
        res.status(200).json(createdTodo);
    }
    catch (error) {
        return res.status(400).json({ message: error.message });
    }
}));
// insertUser("admin1", "123456", "harkirat", "singh");
function createTodo(todo) {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield prisma.todo.create({
            data: {
                title: todo.title,
                description: todo.description,
                user_id: todo.user_id,
            },
        });
        console.log(res);
    });
}
// delete todo--
function deleteTodoById(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const deletedTodo = yield prisma.todo.delete({
            where: {
                id: id,
            },
        });
        return deletedTodo;
    });
}
const deleteTodoSchema = zod_1.z.object({
    id: zod_1.z.number(),
});
router2.delete("/todos/delete/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!deleteTodoSchema.parse(req.params)) {
            return res.status(411).json({ message: "Incorrect inputs" });
        }
        const todoId = parseInt(req.params.id);
        const deletedTodo = yield deleteTodoById(todoId);
        res.status(200).json(deletedTodo);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
}));
const updateTodoSchema = zod_1.z.object({
    user_id: zod_1.z.number(),
});
router2.put("/todos/update/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!updateTodoSchema.parse(req.params)) {
        return res.status(411).json({ message: "Incorrect inputs" });
    }
    const todoId = parseInt(req.params.id);
    const updateProps = req.body;
}));
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
