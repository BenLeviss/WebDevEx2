import request from "supertest";
import mongoose, { Types } from "mongoose";
import { Express } from "express";

import initApp from "../app";
import Comment from "../models/comment";
import Post from "../models/post";
import User from "../models/user";

import { createUserAndLogin, sampleUser } from "./utils.test";

describe("Comments API", () => {
  let app: Express;
  let token: string;
  let userId: string;
  let postId: string;

  beforeAll(async () => {
    app = await initApp();
  });

  beforeEach(async () => {
    await Comment.deleteMany({});
    await Post.deleteMany({});
    await User.deleteMany({});

    // login user
    token = await createUserAndLogin(app, sampleUser);

    const user = await User.findOne({ email: sampleUser.email });
    userId = (user!._id as Types.ObjectId).toString();

    // create a post to comment on
    const post = await Post.create({
      title: "Post for comments",
      content: "content",
      userId,
    });

    postId = (post._id as Types.ObjectId).toString();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe("POST /posts/:postId/comment", () => {
    it("should create a comment when authenticated", async () => {
      const res = await request(app)
        .post(`/posts/${postId}/comment`)  
        .set("Authorization", `Bearer ${token}`)
        .send({
          content: "Nice post!",  
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("_id");
      expect(res.body.content).toBe("Nice post!"); 
      expect(res.body.postId).toBe(postId);
    });

    it("should fail without authentication", async () => {
      const res = await request(app)
        .post(`/posts/${postId}/comment`)  
        .send({ content: "No auth" });  

      expect(res.status).toBe(401);
    });
  });

  describe("GET /posts/:postId/comment", () => {
    it("should return comments for a post", async () => {
      await Comment.create({
        content: "Existing comment",
        postId,
        userId,
      });

      const res = await request(app).get(`/posts/${postId}/comment`);  

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(1);
      expect(res.body[0].content).toBe("Existing comment");  
    });
  });

  describe("DELETE /comments/:commentId", () => {
    it("should delete comment when user owns it", async () => {
      const comment = await Comment.create({
        content: "Delete me",
        postId,
        userId,
      });

      const res = await request(app)
        .delete(`/comments/${comment._id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);

      const deleted = await Comment.findById(comment._id);
      expect(deleted).toBeNull();
    });

    it("should fail without authentication", async () => {
      const comment = await Comment.create({
        content: "No auth delete",
        postId,
        userId,
      });

      const res = await request(app)
        .delete(`/comments/${comment._id}`);

      expect(res.status).toBe(401);
    });
  });
});