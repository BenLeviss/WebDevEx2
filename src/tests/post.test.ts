import mongoose from "mongoose";
import { Express } from "express";
import request from "supertest";
import Post from "../models/post";
import User from "../models/user";
import initApp from "../app";
import { createUserAndLogin, sampleUser } from "./utils.test";

describe("Post API Tests", () => {
    let app: Express;
    let token: string;
    let userId: string;

    beforeAll(async () => {
        app = await initApp();
    });

    beforeEach(async () => {
        await Post.deleteMany({});
        await User.deleteMany({});

        token = await createUserAndLogin(app, sampleUser);
        const user = await User.findOne({ email: sampleUser.email }) as any;
        userId = user._id.toString();
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    describe("POST /posts - Create Post", () => {
        it("should create a post successfully", async () => {
            const response = await request(app)
                .post("/posts")
                .set("Authorization", `Bearer ${token}`)
                .send({ title: "Test Post", content: "Hello world" });

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty("_id");
            expect(response.body.title).toBe("Test Post");
            expect(response.body.userId).toBe(userId);
        });

        it("should fail without authentication", async () => {
            const response = await request(app)
                .post("/posts")
                .send({ title: "Test Post" });

            expect(response.status).toBe(401);
        });
    });

    describe("GET /posts - Get All Posts", () => {
        it("should get all posts", async () => {
            await Post.create({
                title: "Post 1",
                content: "Content",
                userId,
            });

            const response = await request(app)
                .get("/posts");

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBe(1);
        });
    });

    describe("GET /posts/:postId - Get Post By ID", () => {
        it("should get post by ID", async () => {
            const post = await Post.create({
                title: "Single Post",
                content: "Test",
                userId,
            });

            const response = await request(app)
                .get(`/posts/${post._id}`);

            expect(response.status).toBe(200);
            expect(response.body.title).toBe("Single Post");
        });

        it("should return 404 for non-existing post", async () => {
            const response = await request(app)
                .get("/posts/123456789012345678901234");

            expect(response.status).toBe(404);  // Changed from 401 to 404
        });
    });

    describe("PUT /posts/:postId - Update Post", () => {
        it("should update post if user owns it", async () => {
            const post = await Post.create({
                title: "Old Title",
                content: "Old",
                userId,
            });

            const response = await request(app)
                .put(`/posts/${post._id}`)
                .set("Authorization", `Bearer ${token}`)
                .send({ title: "Updated Title" });

            expect(response.status).toBe(200);
            expect(response.body.title).toBe("Updated Title");
        });

        it("should fail without authentication", async () => {
            const post = await Post.create({
                title: "Old Title",
                content: "Old",
                userId,
            });

            const response = await request(app)
                .put(`/posts/${post._id}`)
                .send({ title: "Updated" });

            expect(response.status).toBe(401);
        });
    });

    describe("DELETE /posts/:postId - Delete Post", () => {
        it("should delete post if user owns it", async () => {
            const post = await Post.create({
                title: "To be deleted",
                content: "Test",
                userId,
            });

            const response = await request(app)
                .delete(`/posts/${post._id}`)
                .set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(200);

            const deletedPost = await Post.findById(post._id);
            expect(deletedPost).toBeNull();
        });

        it("should fail without authentication", async () => {
            const post = await Post.create({
                title: "To be deleted",
                content: "Test",
                userId,
            });

            const response = await request(app)
                .delete(`/posts/${post._id}`);

            expect(response.status).toBe(401);
        });
    });
});