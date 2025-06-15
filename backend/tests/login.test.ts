import bcrypt from 'bcryptjs';
import app from '../src/index';
import { AddressInfo } from 'net';

var findUniqueMock: jest.Mock; // eslint-disable-line no-var

jest.mock('@prisma/client', () => {
  findUniqueMock = jest.fn();
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      user: { findUnique: findUniqueMock },
      $disconnect: jest.fn(),
    })),
  };
});

// Helper to perform fetch requests using the started server
const getUrl = (path: string, server: ReturnType<typeof app.listen>) => {
  const { port } = server.address() as AddressInfo;
  return `http://localhost:${port}${path}`;
};

let server: ReturnType<typeof app.listen>;

beforeAll(done => {
  server = app.listen(0, done);
});

afterAll(done => {
  server.close(done);
});

describe('Auth Login', () => {
  it('returns token for valid credentials', async () => {
    const hashedPassword = bcrypt.hashSync('admin', 10);
    findUniqueMock.mockResolvedValue({
      id: '1',
      email: 'admin@admin.com',
      password: hashedPassword,
      role: 'ADMIN',
      bandId: null,
      band: null,
    });

    const res = await fetch(getUrl('/api/auth/login', server), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@admin.com', password: 'admin' }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('token');
  });
});
