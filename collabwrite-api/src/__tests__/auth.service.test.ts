import { authService } from '../services/auth.service';
import * as jwtUtil from '../utils/jwt.util';

jest.mock('../config/db.config.js', () => ({
  pool: {
    query: jest.fn(),
  },
}));

describe('auth.service refreshAccessToken', () => {
  const { pool } = jest.requireMock('../config/db.config.js');

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('émet un nouveau access token si la session et le refresh sont valides', async () => {
    // session trouvée et non expirée
    pool.query.mockResolvedValueOnce({ rows: [{ id: 's1' }] });
    jest.spyOn(jwtUtil, 'verifyRefreshToken').mockReturnValue({
      userId: 'u1', email: 'user@example.com', role: 'USER',
    } as any);
    jest.spyOn(jwtUtil, 'generateAccessToken').mockReturnValue('new.access.token');

    const token = await authService.refreshAccessToken('refresh.token');
    expect(token).toBe('new.access.token');
  });

  it('rejette si la session est introuvable/expirée', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });
    await expect(authService.refreshAccessToken('bad.token')).rejects.toThrow('Session introuvable ou expirée');
  });
});


