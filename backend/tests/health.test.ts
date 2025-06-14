jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      $disconnect: jest.fn(),
    })),
  };
});

import app from '../src/index';
import { AddressInfo } from 'net';

// Helper to perform fetch requests using the started server
const getUrl = (path: string) => {
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

describe('Health Check', () => {
  it('responds with status ok on /health', async () => {
    const res = await fetch(getUrl('/health'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ status: 'ok' });
  });

  it('responds with status ok on /api/health', async () => {
    const res = await fetch(getUrl('/api/health'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ status: 'ok' });
  });
});
