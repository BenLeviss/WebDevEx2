import dotenv from "dotenv";
dotenv.config();

import express, { Express } from "express";
import mongoose from "mongoose";

import postRouter from "./routes/posts";
import commentRouter from "./routes/comment";
import userRouter from "./routes/user";
import authRouter from "./routes/auth";


const app: Express = express();
app.use(express.json());

const PORT = process.env.PORT;
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
    console.error("DATABASE_URL is not defined in .env file");
    process.exit(1);
}

mongoose.connect(DATABASE_URL);
const db = mongoose.connection;

db.on("error", (error) => console.error("Database Error:", error));
db.once("open", () => console.log("Connected to MongoDB"));

app.use("/auth", authRouter);
app.use("/post", postRouter);
app.use("/comment", commentRouter);
app.use("/user", userRouter);


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
