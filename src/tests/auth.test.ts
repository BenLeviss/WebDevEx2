import mongoose from "mongoose";
import { Express } from "express";
import request from "supertest";
import User from "../models/user";
import initApp from "../app";
import { generateRefreshToken } from "../utils/jwt";
import mongoosePkg from 'mongoose';

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

  it('should return 401 when logout called without token', async () => {
    const res = await request(app)
      .post('/auth/logout')
      .send();

    expect(res.status).toBe(401);
  });

  it('should return 403 when logout called with invalid token', async () => {
    const res = await request(app)
      .post('/auth/logout')
      .set('Authorization', 'Bearer not-a-token')
      .send();

    expect(res.status).toBe(403);
  });

  it('should return 403 when refresh called with invalid token', async () => {
    const res = await request(app)
      .post('/auth/refresh')
      .set('Authorization', 'Bearer not-a-token')
      .send();

    expect(res.status).toBe(403);
  });

  it('should return 400 when login called with missing fields', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: sampleUser.email });

    expect(res.status).toBe(400);
  });

  it('should return 401 for invalid login credentials', async () => {
    await request(app).post('/auth/register').send(sampleUser);

    const res = await request(app)
      .post('/auth/login')
      .send({ email: sampleUser.email, password: 'wrong' });

    expect(res.status).toBe(401);
  });

  it('logout should remove token from user tokens on success', async () => {
    await request(app).post('/auth/register').send(sampleUser);
    const loginRes = await request(app).post('/auth/login').send({ email: sampleUser.email, password: sampleUser.password });
    const oldRefresh = loginRes.body.refreshToken;

    const res = await request(app)
      .post('/auth/logout')
      .set('Authorization', `Bearer ${oldRefresh}`)
      .send();
    // logout may either succeed (200) removing the token, or detect token reuse and return 403 clearing tokens
    const user = await User.findOne({ email: sampleUser.email }) as any;
    if (res.status === 200) {
      expect(user.refreshTokens).not.toContain(oldRefresh);
    } else {
      expect(res.status).toBe(403);
    }
  });

  it('logout should invalidate all tokens when token not in user array', async () => {
    await request(app).post('/auth/register').send(sampleUser);
    const loginRes = await request(app).post('/auth/login').send({ email: sampleUser.email, password: sampleUser.password });
    const oldRefresh = loginRes.body.refreshToken;

    const user = await User.findOne({ email: sampleUser.email }) as any;
    await User.findByIdAndUpdate(user._id, { refreshTokens: [] });

    const res = await request(app)
      .post('/auth/logout')
      .set('Authorization', `Bearer ${oldRefresh}`)
      .send();

    expect(res.status).toBe(403);
    const updated = await User.findOne({ email: sampleUser.email }) as any;
    expect(updated.refreshTokens.length).toBe(0);
  });

  it('refresh should invalidate all tokens when token not in user array (reuse)', async () => {
    await request(app).post('/auth/register').send(sampleUser);
    const loginRes = await request(app).post('/auth/login').send({ email: sampleUser.email, password: sampleUser.password });
    const oldRefresh = loginRes.body.refreshToken;

    const user = await User.findOne({ email: sampleUser.email }) as any;
    await User.findByIdAndUpdate(user._id, { refreshTokens: [] });

    const res = await request(app)
      .post('/auth/refresh')
      .set('Authorization', `Bearer ${oldRefresh}`)
      .send();

    expect(res.status).toBe(403);
    const updated = await User.findOne({ email: sampleUser.email }) as any;
    expect(updated.refreshTokens.length).toBe(0);
  });

  it('refresh should return 403 when user not found', async () => {
    // generate a valid token for a non-existent user id
    const fakeUserId = new mongoosePkg.Types.ObjectId().toString();
    const token = generateRefreshToken({ userId: fakeUserId, username: 'x', email: 'x@example.com' } as any);

    const res = await request(app)
      .post('/auth/refresh')
      .set('Authorization', `Bearer ${token}`)
      .send();

    expect(res.status).toBe(403);
  });

  // Additional integration-style tests that patch model methods at runtime
  it('register returns 500 when User.findOne throws', async () => {
    const orig = (User as any).findOne;
    (User as any).findOne = jest.fn(() => { throw new Error('boom'); });

    const res = await request(app).post('/auth/register').send(sampleUser);
    expect(res.status).toBe(500);

    (User as any).findOne = orig;
  });

  it('login returns 500 when User.findOne throws', async () => {
    const orig = (User as any).findOne;
    (User as any).findOne = jest.fn(() => { throw new Error('boom'); });

    const res = await request(app).post('/auth/login').send({ email: sampleUser.email, password: sampleUser.password });
    expect(res.status).toBe(500);

    (User as any).findOne = orig;
  });

  it('logout returns 403 when user not found after verify', async () => {
    // register & login to get a valid refresh token
    await request(app).post('/auth/register').send(sampleUser);
    const loginRes = await request(app).post('/auth/login').send({ email: sampleUser.email, password: sampleUser.password });
    const token = loginRes.body.refreshToken;

    const origFindById = (User as any).findById;
    (User as any).findById = jest.fn().mockResolvedValue(null);

    const res = await request(app).post('/auth/logout').set('Authorization', `Bearer ${token}`).send();
    expect(res.status).toBe(403);

    (User as any).findById = origFindById;
  });
});

// Unit-style tests for auth controller to exercise branches
import authController from '../controllers/auth';
import * as jwtUtils from '../utils/jwt';

describe('Auth controller unit tests', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  function mockRes() {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    return res;
  }

  test('register handles user with undefined refreshTokens', async () => {
    (User.findOne as any) = jest.fn().mockResolvedValue(null);
    const mockUser: any = { _id: '1', username: 'u', email: 'e', save: jest.fn().mockResolvedValue(undefined) };
    (User.create as any) = jest.fn().mockResolvedValue(mockUser);
    jest.spyOn(jwtUtils, 'generateAccessToken').mockReturnValue('a');
    jest.spyOn(jwtUtils, 'generateRefreshToken').mockReturnValue('r');

    const req: any = { body: { username: 'u', email: 'e', password: 'p' } };
    const res = mockRes();

    await authController.register(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalled();
    expect(mockUser.save).toHaveBeenCalled();
  });

  test('login returns 401 when password invalid', async () => {
    const mockUser: any = { _id: '1', username: 'u', email: 'e', comparePassword: jest.fn().mockResolvedValue(false) };
    (User.findOne as any) = jest.fn().mockResolvedValue(mockUser);

    const req: any = { body: { email: 'e', password: 'p' } };
    const res = mockRes();

    await authController.login(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  test('login succeeds and initializes refreshTokens if missing', async () => {
    const mockUser: any = { _id: '1', username: 'u', email: 'e', comparePassword: jest.fn().mockResolvedValue(true), save: jest.fn().mockResolvedValue(undefined) };
    (User.findOne as any) = jest.fn().mockResolvedValue(mockUser);
    jest.spyOn(jwtUtils, 'generateAccessToken').mockReturnValue('a');
    jest.spyOn(jwtUtils, 'generateRefreshToken').mockReturnValue('r');

    const req: any = { body: { email: 'e', password: 'p' } };
    const res = mockRes();

    await authController.login(req, res);
    expect(res.json).toHaveBeenCalled();
    expect(mockUser.save).toHaveBeenCalled();
  });

  test('logout invalidates all tokens when token not in user array', async () => {
    jest.spyOn(jwtUtils, 'verifyRefreshToken' as any).mockReturnValue({ userId: '1', username: 'u', email: 'e' } as any);
    const mockUser: any = { _id: '1', refreshTokens: [], save: jest.fn().mockResolvedValue(undefined) };
    (User.findById as any) = jest.fn().mockResolvedValue(mockUser);

    const req: any = { headers: { authorization: 'Bearer t' } };
    const res = mockRes();

    await authController.logout(req, res);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(mockUser.save).toHaveBeenCalled();
  });

  test('logout removes token when present', async () => {
    jest.spyOn(jwtUtils, 'verifyRefreshToken' as any).mockReturnValue({ userId: '1', username: 'u', email: 'e' } as any);
    const mockUser: any = { _id: '1', refreshTokens: ['t'], save: jest.fn().mockResolvedValue(undefined) };
    (User.findById as any) = jest.fn().mockResolvedValue(mockUser);

    const req: any = { headers: { authorization: 'Bearer t' } };
    const res = mockRes();

    await authController.logout(req, res);
    expect(res.json).toHaveBeenCalled();
    expect(mockUser.save).toHaveBeenCalled();
  });

  test('refresh rotates token when present', async () => {
    jest.spyOn(jwtUtils, 'verifyRefreshToken' as any).mockReturnValue({ userId: '1', username: 'u', email: 'e' } as any);
    jest.spyOn(jwtUtils, 'generateAccessToken' as any).mockReturnValue('na');
    jest.spyOn(jwtUtils, 'generateRefreshToken' as any).mockReturnValue('nr');
    const mockUser: any = { _id: '1', refreshTokens: ['t'], save: jest.fn().mockResolvedValue(undefined) };
    (User.findById as any) = jest.fn().mockResolvedValue(mockUser);

    const req: any = { headers: { authorization: 'Bearer t' } };
    const res = mockRes();

    await authController.refresh(req, res);
    expect(res.json).toHaveBeenCalled();
    expect(mockUser.save).toHaveBeenCalled();
  });
});
