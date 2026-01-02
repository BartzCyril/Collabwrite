import { generateAccessToken, verifyAccessToken } from '../utils/jwt.util';

describe('jwt.util', () => {
  beforeAll(() => {
    process.env.JWT_SECRET = 'test-secret';
  });

  it('génère et vérifie un access token', () => {
    const payload = { userId: 'u1', email: 'user@example.com', role: 'USER' };
    const token = generateAccessToken(payload);
    const decoded = verifyAccessToken(token);
    expect(decoded.userId).toBe(payload.userId);
    expect(decoded.email).toBe(payload.email);
    expect(decoded.role).toBe(payload.role);
  });
});


