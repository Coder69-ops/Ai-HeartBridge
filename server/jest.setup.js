import dotenv from 'dotenv';
dotenv.config({ path: '.env.test' }); // Load test environment variables

jest.setTimeout(30000);