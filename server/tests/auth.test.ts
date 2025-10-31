import request from 'supertest';
import { app } from '../src/server'; // Assuming your Express app is exported from server.ts
import mongoose from 'mongoose';
import { User } from '../src/models/User';

describe('Auth API', () => {
  beforeAll(async () => {
    console.log('beforeAll');
    // Connect to a test database
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/aiheartbridge_test';
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected');
  });

  afterEach(async () => {
    console.log('afterEach');
    // Clean up the database after each test
    await User.deleteMany({});
  });

  afterAll(async () => {
    console.log('afterAll');
    // Disconnect from the database
    await mongoose.connection.close();
    console.log('MongoDB disconnected');
  });

  it('should register a new user', async () => {
    console.log('should register a new user');
    const res = await request(app)
      .post('/api/auth/signup')
      .send({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      });
    console.log(res.body);
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.email).toEqual('test@example.com');
  });

  it('should not register a user with existing email', async () => {
    await request(app)
      .post('/api/auth/signup')
      .send({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      });

    const res = await request(app)
      .post('/api/auth/signup')
      .send({
        email: 'test@example.com',
        password: 'password123',
        name: 'Another User',
      });
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('error', 'Invalid credentials');
  });

  it('should login an existing user', async () => {
    await request(app)
      .post('/api/auth/signup')
      .send({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      });

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123',
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.email).toEqual('test@example.com');
  });

  it('should not login with incorrect password', async () => {
    await request(app)
      .post('/api/auth/signup')
      .send({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      });

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'wrongpassword',
      });
    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty('error', 'Invalid email or password');
  });
});