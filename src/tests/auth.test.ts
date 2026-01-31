import mongoose from "mongoose";
import { Express } from "express";
import request from "supertest";
import User from "../models/user";
import initApp from "../app";

const sampleUser = {
  username: "authuser",
  email: "auth@example.com",
  password: "password123",
};

describe("Auth API", () => {
  let app: Express;

  beforeAll(async () => {
    app = await initApp();
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it("should register a new user and return tokens", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send(sampleUser);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("accessToken");
    expect(res.body).toHaveProperty("refreshToken");
    expect(res.body.user).toHaveProperty("_id");
    expect(res.body.user.email).toBe(sampleUser.email);
  });

  it("should login an existing user and return tokens", async () => {
    await request(app).post("/auth/register").send(sampleUser);

    const res = await request(app)
      .post("/auth/login")
      .send({ email: sampleUser.email, password: sampleUser.password });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("accessToken");
    expect(res.body).toHaveProperty("refreshToken");
    expect(res.body.user.email).toBe(sampleUser.email);
  });

  it("should refresh tokens when given a valid refresh token", async () => {
    await request(app).post("/auth/register").send(sampleUser);

    const loginRes = await request(app)
      .post("/auth/login")
      .send({ email: sampleUser.email, password: sampleUser.password });

    const oldRefresh = loginRes.body.refreshToken;
    const res = await request(app)
      .post("/auth/refresh")
      .set("Authorization", `Bearer ${oldRefresh}`)
      .send();

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("accessToken");
    expect(res.body).toHaveProperty("refreshToken");
    expect(res.body.refreshToken).not.toBe(oldRefresh);
  });
});
